
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'staff';
  department?: string;
  canteenCredits?: number;
}

interface UserState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addCanteenCredits: (amount: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
      addCanteenCredits: (amount) => set((state) => ({
        user: state.user 
          ? { ...state.user, canteenCredits: (state.user.canteenCredits || 0) + amount } 
          : null
      }))
    }),
    {
      name: 'user-storage',
    }
  )
);
