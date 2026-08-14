import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";

import { PageHeader, Spinner } from "@/components/common";
import { ImageUploadField } from "@/components/common/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CHANGE_PASSWORD,
  FAVORITE_CANTEENS,
  ME,
  UPDATE_PROFILE,
} from "@/graphql/operations";
import { CanteenCard } from "@/components/canteen/CanteenCard";
import { useSession } from "@/stores/session";

export default function Profile() {
  const { data } = useQuery(ME);
  const setUser = useSession((state) => state.setUser);
  const favorites = useQuery(FAVORITE_CANTEENS);

  const me = data?.me;

  const [name, setName] = useState(me?.name ?? "");
  const [phone, setPhone] = useState(me?.phone ?? "");
  const [upiId, setUpiId] = useState(me?.upiId ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(me?.avatarUrl ?? null);
  const [isVegetarian, setVegetarian] = useState(me?.isVegetarian ?? false);
  const [initialised, setInitialised] = useState(false);

  // Seed the form once the query lands, without clobbering later edits.
  if (me && !initialised) {
    setName(me.name);
    setPhone(me.phone ?? "");
    setUpiId(me.upiId ?? "");
    setAvatarUrl(me.avatarUrl ?? null);
    setVegetarian(me.isVegetarian);
    setInitialised(true);
  }

  const [updateProfile, updateState] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: ME }],
  });

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data: saved } = await updateProfile({
        variables: {
          input: {
            name,
            phone: phone || null,
            upiId: upiId || null,
            avatarUrl,
            isVegetarian,
          },
        },
      });
      if (saved?.updateProfile && me) {
        setUser({ ...me, ...saved.updateProfile });
      }
      toast.success("Profile saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save your profile.",
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Your account"
        title="Profile"
        description="Your details, preferences, and saved canteens."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} className="surface space-y-5 p-5">
          <h2 className="font-display text-base font-semibold">Details</h2>

          <ImageUploadField
            kind="avatar"
            label="Profile photo"
            value={avatarUrl}
            onChange={setAvatarUrl}
          />

          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={me?.email ?? ""}
              disabled
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Your email cannot be changed here.
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="upi">UPI ID</Label>
            <Input
              id="upi"
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              placeholder="name@bank"
              className="mt-1.5"
            />
          </div>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3.5">
            <span>
              <span className="block text-sm font-medium">Vegetarian</span>
              <span className="block text-xs text-muted-foreground">
                Highlight vegetarian dishes across the app
              </span>
            </span>
            <Switch checked={isVegetarian} onCheckedChange={setVegetarian} />
          </label>

          <Button type="submit" disabled={updateState.loading}>
            {updateState.loading && <Spinner className="mr-2" />}
            Save changes
          </Button>
        </form>

        <div className="space-y-6">
          <PasswordCard />

          <section>
            <h2 className="mb-3 font-display text-base font-semibold">
              Saved canteens
            </h2>
            {(favorites.data?.favoriteCanteens.length ?? 0) === 0 ? (
              <p className="surface p-5 text-sm text-muted-foreground">
                You have not saved any canteens yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {favorites.data?.favoriteCanteens.map((canteen) => (
                  <CanteenCard key={canteen.id} canteen={canteen} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);
  const signOut = useSession((state) => state.signOut);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await changePassword({
        variables: { currentPassword: current, newPassword: next },
      });
      // The server revokes every session on a password change, so the local
      // one has to go too rather than lingering in a broken state.
      toast.success("Password changed. Please sign in again.");
      await signOut();
      window.location.href = "/signin";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not change your password.",
      );
    }
  };

  return (
    <form onSubmit={submit} className="surface space-y-4 p-5">
      <h2 className="font-display text-base font-semibold">Password</h2>
      <div>
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          autoComplete="current-password"
          className="mt-1.5"
          required
        />
      </div>
      <div>
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          className="mt-1.5"
          required
        />
      </div>
      <Button type="submit" variant="outline" disabled={loading}>
        {loading && <Spinner className="mr-2" />}
        Change password
      </Button>
    </form>
  );
}
