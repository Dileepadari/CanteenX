import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { PageLoader } from "@/components/common";
import { VERIFY_CAS_TICKET } from "@/graphql/operations";
import { useSession } from "@/stores/session";

/**
 * CAS single sign-on callback.
 *
 * The `hasRun` ref matters: a CAS ticket is single-use, and the previous
 * implementation listed the unstable `location` object in its effect
 * dependencies, so a re-render could re-submit an already-consumed ticket and
 * fail the login that had just succeeded.
 */
export default function CasCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useSession((state) => state.setUser);
  const [verifyTicket] = useMutation(VERIFY_CAS_TICKET);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const ticket = params.get("ticket");
    if (!ticket) {
      toast.error("No single sign-on ticket was provided.");
      navigate("/signin", { replace: true });
      return;
    }

    void (async () => {
      try {
        const { data } = await verifyTicket({ variables: { ticket } });
        if (data?.verifyCasTicket.user) {
          setUser(data.verifyCasTicket.user);
          toast.success(`Signed in as ${data.verifyCasTicket.user.name}`);
          navigate("/", { replace: true });
          return;
        }
        throw new Error("Sign-on did not return a user.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Single sign-on failed.",
        );
        navigate("/signin", { replace: true });
      }
    })();
  }, [params, navigate, verifyTicket, setUser]);

  return <PageLoader label="Completing sign-in" />;
}
