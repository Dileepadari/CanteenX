/**
 * Session state.
 *
 * Persisted and hydrated, so the app no longer blocks behind a full-screen
 * spinner on every refresh while it re-fetches the user. The persisted copy is
 * a rendering hint only - the server cookie remains the authority, and a
 * background `Me` query corrects it.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MeQuery } from "@/graphql/generated/graphql";
import { ME, SIGN_OUT } from "@/graphql/operations";
import { apolloClient, resetApolloStore } from "@/lib/apollo";

export type SessionUser = NonNullable<MeQuery["me"]>;

export type Role = "STUDENT" | "STAFF" | "VENDOR" | "ADMIN";

interface SessionState {
  user: SessionUser | null;
  /** True until the first `Me` round-trip settles. */
  isLoading: boolean;
  /** True once persisted state has been read back from storage. */
  hasHydrated: boolean;
  setUser: (user: SessionUser | null) => void;
  setHydrated: () => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      hasHydrated: false,

      setUser: (user) => set({ user, isLoading: false }),
      setHydrated: () => set({ hasHydrated: true }),

      refresh: async () => {
        try {
          const { data } = await apolloClient.query({
            query: ME,
            fetchPolicy: "network-only",
          });
          set({ user: data.me ?? null, isLoading: false });
        } catch {
          // A failed `Me` means "not signed in" for our purposes; the Apollo
          // error link has already attempted refresh-and-retry.
          set({ user: null, isLoading: false });
        }
      },

      signOut: async () => {
        try {
          await apolloClient.mutate({ mutation: SIGN_OUT });
        } finally {
          // Clearing the store matters: without it, another user signing in on
          // the same device would see the previous user's cached data.
          set({ user: null, isLoading: false });
          await resetApolloStore();
        }
      },
    }),
    {
      name: "canteenx-session",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/**
 * Case-insensitive role check.
 *
 * The old guards compared `user.role !== 'admin'` exactly while the header
 * lowercased and also accepted `'administrator'`, so a user whose role was
 * stored as "Admin" saw the admin nav link and was then bounced back home.
 */
export function hasRole(user: SessionUser | null, ...roles: Role[]): boolean {
  if (!user) return false;
  const actual = String(user.role).toUpperCase();
  return roles.some((role) => role === actual);
}

export function isVendorRole(user: SessionUser | null): boolean {
  return hasRole(user, "VENDOR", "STAFF", "ADMIN");
}

export function isAdminRole(user: SessionUser | null): boolean {
  return hasRole(user, "ADMIN");
}
