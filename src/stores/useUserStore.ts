import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, TableProgress, CollectionItem } from '@/types';
import { useAccountsStore } from './useAccountsStore';
import { useAuthStore } from './useAuthStore';
import { logout as firebaseLogout } from '@/lib/firebase/auth';
import { findShopItem } from '@/data/shop';
import { purchaseOwnedItem } from '@/lib/firebase/firestore';

export type PurchaseResult =
  | { success: true; item: CollectionItem }
  | { success: false; reason: 'no-user' | 'not-found' | 'already-owned' | 'insufficient-stars' };

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
  purchaseItem: (itemId: string) => PurchaseResult;
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

      purchaseItem: (itemId) => {
        const user = get().user;
        if (!user) return { success: false, reason: 'no-user' };

        const shopItem = findShopItem(itemId);
        if (!shopItem) return { success: false, reason: 'not-found' };

        const ownedItems = user.ownedItems ?? [];
        if (ownedItems.some((i) => i.itemId === itemId)) {
          return { success: false, reason: 'already-owned' };
        }

        if (user.stats.totalStars < shopItem.cost) {
          return { success: false, reason: 'insufficient-stars' };
        }

        const item: CollectionItem = {
          itemId,
          purchasedAt: Date.now(),
          isFavorite: false,
        };

        const updatedUser: UserProfile = {
          ...user,
          stats: {
            ...user.stats,
            totalStars: user.stats.totalStars - shopItem.cost,
          },
          ownedItems: [...ownedItems, item],
        };

        set({ user: updatedUser });

        const firebaseUid = useAuthStore.getState().firebaseUid;
        if (user.authProvider === 'firebase' && firebaseUid) {
          purchaseOwnedItem(firebaseUid, item, shopItem.cost).catch((err) => {
            console.warn('[useUserStore] Failed to sync purchase:', err);
          });
        } else {
          useAccountsStore.getState().updateAccountStats(user.uid, updatedUser.stats);
          useAccountsStore.getState().updateAccountOwnedItems(user.uid, updatedUser.ownedItems);
        }

        return { success: true, item };
      },

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
