import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@fidooo/shared';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  authStatus: AuthStatus;
  lastEmail: string;
  setUser: (user: User | null) => void;
  setAuthStatus: (status: AuthStatus) => void;
  setLastEmail: (email: string) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        authStatus: 'idle',
        lastEmail: '',
        setUser: (user) =>
          set({
            user,
            authStatus: user ? 'authenticated' : 'unauthenticated',
          }),
        setAuthStatus: (authStatus) => set({ authStatus }),
        setLastEmail: (lastEmail) => set({ lastEmail }),
        clearUser: () =>
          set({ user: null, authStatus: 'unauthenticated' }),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ lastEmail: state.lastEmail }),
      },
    ),
    { name: 'AuthStore', enabled: process.env.NODE_ENV === 'development' },
  ),
);
