import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  firebaseUid: string | null;
  firebaseEmail: string | null;
  authReady: boolean;
  authLoading: boolean;
  authError: string | null;

  setFirebaseUser: (uid: string, email: string) => void;
  setAuthReady: (ready: boolean) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      firebaseUid: null,
      firebaseEmail: null,
      authReady: false,
      authLoading: false,
      authError: null,

      setFirebaseUser: (uid, email) => set({
        firebaseUid: uid,
        firebaseEmail: email,
        authError: null,
      }),

      setAuthReady: (ready) => set({ authReady: ready }),

      setAuthLoading: (loading) => set({ authLoading: loading }),

      setAuthError: (error) => set({ authError: error, authLoading: false }),

      clearAuth: () => set({
        firebaseUid: null,
        firebaseEmail: null,
        authReady: false,
        authError: null,
      }),
    }),
    {
      name: 'math-kids-auth',
      partialize: (state) => ({
        firebaseUid: state.firebaseUid,
        firebaseEmail: state.firebaseEmail,
      }),
    }
  )
);
