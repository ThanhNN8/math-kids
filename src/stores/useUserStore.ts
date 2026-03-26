import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, TableProgress } from '@/types';
import { useAccountsStore } from './useAccountsStore';
import { useAuthStore } from './useAuthStore';
import { logout as firebaseLogout } from '@/lib/firebase/auth';

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  progress: TableProgress[];
  parentPin: string | null;

  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setProgress: (progress: TableProgress[]) => void;
  updateStars: (delta: number) => void;
  updateXP: (delta: number) => void;
  updateProblemStats: (totalDelta: number, correctDelta: number) => void;
  setParentPin: (pin: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      progress: [],
      parentPin: null,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      setProgress: (progress) => set({ progress }),

      updateStars: (delta) => set((state) => {
        if (!state.user) return state;
        const newStars = state.user.stats.totalStars + delta;
        return {
          user: {
            ...state.user,
            stats: {
              ...state.user.stats,
              totalStars: newStars,
            },
          },
        };
      }),

      updateXP: (delta) => set((state) => {
        if (!state.user) return state;
        const newXP = state.user.stats.xp + delta;
        return {
          user: {
            ...state.user,
            stats: {
              ...state.user.stats,
              xp: newXP,
            },
          },
        };
      }),

      updateProblemStats: (totalDelta, correctDelta) => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            stats: {
              ...state.user.stats,
              totalProblems: state.user.stats.totalProblems + totalDelta,
              totalCorrect: state.user.stats.totalCorrect + correctDelta,
            },
          },
        };
      }),

      setParentPin: (pin) => set({ parentPin: pin }),

      logout: () => {
        const user = get().user;
        const isFirebaseUser = user?.authProvider === 'firebase';

        if (isFirebaseUser) {
          // Firebase user: sign out from Firebase + clear auth store
          firebaseLogout().catch(() => {});
          useAuthStore.getState().clearAuth();
        } else if (user) {
          // Local user: sync stats to accounts store before clearing
          useAccountsStore.getState().updateAccountStats(user.uid, user.stats);
        }

        set({ user: null, isAuthenticated: false, progress: [] });
      },
    }),
    {
      name: 'math-kids-user',
      partialize: (state) => ({ user: state.user, parentPin: state.parentPin }),
    }
  )
);
