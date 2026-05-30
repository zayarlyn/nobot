import { create } from 'zustand';

type User = { id: number; username: string; isVerified: boolean };

type AuthStore = {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setHydrated: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: () => set({ hydrated: true }),
}));
