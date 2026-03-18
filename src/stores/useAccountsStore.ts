import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccountRecord, UserSettings, UserStats } from '@/types';
import { hashPassword, verifyPassword, DEFAULT_PASSWORD } from '@/lib/passwordUtils';

interface AccountsState {
  accounts: AccountRecord[];
  lastLoggedInUid: string | null;

  createAccount: (displayName: string, avatarId: number, password?: string) => AccountRecord;
  authenticate: (displayName: string, password: string) => AccountRecord | null;
  findByName: (name: string) => AccountRecord | undefined;
  findByUid: (uid: string) => AccountRecord | undefined;
  updatePassword: (uid: string, oldPassword: string, newPassword: string) => boolean;
  updateAccountStats: (uid: string, stats: Partial<UserStats>) => void;
  deleteAccount: (uid: string) => void;
  setLastLoggedInUid: (uid: string | null) => void;
  importLegacyAccount: (user: { uid: string; displayName: string; avatarId: number; settings: UserSettings; stats: UserStats }) => AccountRecord;
}

const defaultSettings: UserSettings = {
  dailyTimeLimit: 30,
  enabledTables: [2, 3, 4, 5, 6, 7, 8, 9],
  difficultyLevel: 'auto',
  soundEnabled: true,
};

const defaultStats: UserStats = {
  totalStars: 0,
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalProblems: 0,
  totalCorrect: 0,
};

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      accounts: [],
      lastLoggedInUid: null,

      createAccount: (displayName, avatarId, password = DEFAULT_PASSWORD) => {
        const account: AccountRecord = {
          uid: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          displayName,
          avatarId,
          passwordHash: hashPassword(password),
          role: 'child',
          createdAt: Date.now(),
          settings: { ...defaultSettings },
          stats: { ...defaultStats },
        };
        set((state) => ({ accounts: [...state.accounts, account] }));
        return account;
      },

      authenticate: (displayName, password) => {
        const account = get().accounts.find(
          (a) => a.displayName.toLowerCase() === displayName.toLowerCase()
        );
        if (!account) return null;
        if (!verifyPassword(password, account.passwordHash)) return null;
        set({ lastLoggedInUid: account.uid });
        return account;
      },

      findByName: (name) => {
        return get().accounts.find(
          (a) => a.displayName.toLowerCase() === name.toLowerCase()
        );
      },

      findByUid: (uid) => {
        return get().accounts.find((a) => a.uid === uid);
      },

      updatePassword: (uid, oldPassword, newPassword) => {
        const account = get().accounts.find((a) => a.uid === uid);
        if (!account || !verifyPassword(oldPassword, account.passwordHash)) return false;
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.uid === uid ? { ...a, passwordHash: hashPassword(newPassword) } : a
          ),
        }));
        return true;
      },

      updateAccountStats: (uid, stats) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.uid === uid
              ? { ...a, stats: { ...a.stats, ...stats } }
              : a
          ),
        }));
      },

      deleteAccount: (uid) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.uid !== uid),
          lastLoggedInUid: state.lastLoggedInUid === uid ? null : state.lastLoggedInUid,
        }));
      },

      setLastLoggedInUid: (uid) => set({ lastLoggedInUid: uid }),

      importLegacyAccount: (user) => {
        const account: AccountRecord = {
          uid: user.uid,
          displayName: user.displayName,
          avatarId: user.avatarId,
          passwordHash: hashPassword(DEFAULT_PASSWORD),
          role: 'child',
          createdAt: Date.now(),
          settings: { ...user.settings },
          stats: { ...user.stats },
        };
        set((state) => ({ accounts: [...state.accounts, account] }));
        return account;
      },
    }),
    {
      name: 'math-kids-accounts',
    }
  )
);
