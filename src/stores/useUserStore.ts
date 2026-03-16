import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, TableProgress } from '@/types';

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
  setParentPin: (pin: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
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
        return {
          user: {
            ...state.user,
            stats: {
              ...state.user.stats,
              totalStars: state.user.stats.totalStars + delta,
            },
          },
        };
      }),

      updateXP: (delta) => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            stats: {
              ...state.user.stats,
              xp: state.user.stats.xp + delta,
            },
          },
        };
      }),

      setParentPin: (pin) => set({ parentPin: pin }),

      logout: () => set({ user: null, isAuthenticated: false, progress: [] }),
    }),
    {
      name: 'math-kids-user',
      partialize: (state) => ({ user: state.user, parentPin: state.parentPin }),
    }
  )
);
