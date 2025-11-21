import { create } from 'zustand';
import { client as apolloClient } from '@/gql/client';
import { GET_CURRENT_USER_QUERY } from '@/gql/queries/user_queries';
import { LOGOUT_MUTATION } from '@/gql/mutations/auth_mutations';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  user: User | null;
  init: () => Promise<void>;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  init: async () => {
    try {
      const { data } = await apolloClient.query({
        query: GET_CURRENT_USER_QUERY,
        fetchPolicy: 'network-only',
      });
      if (data?.getCurrentUser) {
        set({ user: data.getCurrentUser });
      }
    } catch (error) {
      // User is not authenticated
    }
  },
  login: (user) => set({ user }),
  logout: async () => {
    await apolloClient.mutate({ mutation: LOGOUT_MUTATION });
    set({ user: null });
  },
}));
