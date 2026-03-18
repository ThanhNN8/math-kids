import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedSession } from '@/types';

const MAX_SESSIONS = 500;

interface HistoryState {
  sessions: SavedSession[];

  saveSession: (session: SavedSession) => void;
  getByUser: (userId: string) => SavedSession[];
  getRecent: (userId: string, limit?: number) => SavedSession[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],

      saveSession: (session) => {
        set((state) => {
          const updated = [session, ...state.sessions];
          // Keep max 500, remove oldest
          if (updated.length > MAX_SESSIONS) {
            updated.length = MAX_SESSIONS;
          }
          return { sessions: updated };
        });
      },

      getByUser: (userId) => {
        return get().sessions.filter((s) => s.userId === userId);
      },

      getRecent: (userId, limit = 20) => {
        return get()
          .sessions.filter((s) => s.userId === userId)
          .slice(0, limit);
      },
    }),
    {
      name: 'math-kids-history',
    }
  )
);
