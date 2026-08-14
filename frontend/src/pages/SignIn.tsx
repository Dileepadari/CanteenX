import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { CanteenXLogo } from "@/components/brand/Logo";
import { Spinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIATE_CAS_LOGIN, SIGN_IN, SIGN_UP } from "@/graphql/operations";
import { useSession } from "@/stores/session";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function SignIn() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setUser = useSession((state) => state.setUser);

  // Where to land after signing in. Only same-origin paths are honoured, so a
  // crafted `?next=https://evil.example` cannot turn this into an open redirect.
  const next = (() => {
    const raw = params.get("next");
    return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  })();

  const [signIn, signInState] = useMutation(SIGN_IN);
  const [signUp, signUpState] = useMutation(SIGN_UP);
  const [initiateCas, casState] = useMutation(INITIATE_CAS_LOGIN);

  const busy = signInState.loading || signUpState.loading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (mode === "signin") {
        const { data } = await signIn({ variables: { email, password } });
        if (data?.signIn.user) setUser(data.signIn.user);
        toast.success(`Welcome back, ${data?.signIn.user.name.split(" ")[0]}`);
      } else {
        const { data } = await signUp({ variables: { name, email, password } });
        if (data?.signUp.user) setUser(data.signUp.user);
        toast.success("Your account is ready");
      }
      navigate(next, { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not sign you in.",
      );
    }
  };

  const handleCas = async () => {
    try {
      const { data } = await initiateCas();
      if (data?.initiateCasLogin) window.location.href = data.initiateCasLogin;
    } catch {
      toast.error("Single sign-on is unavailable right now.");
    }
  };

  return (
    <div className="grain flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="relative z-[2] w-full max-w-sm">
        <Link to="/" className="mb-8 flex justify-center">
          <CanteenXLogo showTagline markClassName="h-9 w-9" />
        </Link>

        <div className="surface p-6 sm:p-7">
          <div
            role="tablist"
            aria-label="Sign in or create an account"
            className="mb-6 flex gap-1 rounded-lg bg-muted p-1"
          >
            {(["signin", "signup"] as const).map((value) => (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  mode === value
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                  className="mt-1.5"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                minLength={mode === "signup" ? 8 : undefined}
                className="mt-1.5"
              />
              {mode === "signup" && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  At least 8 characters.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Spinner className="mr-2" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCas}
            disabled={casState.loading}
          >
            {casState.loading && <Spinner className="mr-2" />}
            Continue with campus SSO
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground hover:underline">
            Back to CanteenX
          </Link>
        </p>
      </div>
    </div>
  );
}
