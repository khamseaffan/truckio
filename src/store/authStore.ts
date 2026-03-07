import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

type Role = 'owner' | 'driver' | null;

interface AuthState {
  session: Session | null;
  user: Session['user'] | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setRole: (role: Role) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
    }),

  setRole: (role) => set({ role }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      session: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
