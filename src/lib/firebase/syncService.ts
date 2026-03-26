import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { updateUserStats, saveSession as saveSessionToCloud } from './firestore';
import type { SavedSession, UserStats } from '@/types';

export function isCloudUser(): boolean {
  const { firebaseUid } = useAuthStore.getState();
  const user = useUserStore.getState().user;
  return !!firebaseUid && user?.authProvider === 'firebase';
}

export function syncStatsToCloud(stats?: Partial<UserStats>): void {
  const { firebaseUid } = useAuthStore.getState();
  if (!firebaseUid) return;

  const userStats = stats || useUserStore.getState().user?.stats;
  if (!userStats) return;

  updateUserStats(firebaseUid, userStats).catch((err) => {
    console.warn('[syncService] Failed to sync stats:', err);
  });
}

export function syncSessionToCloud(session: SavedSession): void {
  const { firebaseUid } = useAuthStore.getState();
  if (!firebaseUid) return;

  saveSessionToCloud(firebaseUid, {
    userId: session.userId,
    type: session.type as 'practice' | 'racing' | 'shooting' | 'puzzle' | 'mental-math',
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    score: session.score,
    accuracy: session.accuracy,
    starsEarned: session.starsEarned,
    problems: [],
  }).catch((err) => {
    console.warn('[syncService] Failed to sync session:', err);
  });
}

export function syncProfileToCloud(): void {
  const { firebaseUid } = useAuthStore.getState();
  if (!firebaseUid) return;

  const user = useUserStore.getState().user;
  if (!user) return;

  import('./firestore').then(({ createUserProfile }) => {
    createUserProfile(firebaseUid, {
      displayName: user.displayName,
      avatarId: user.avatarId,
      role: user.role,
      email: user.email,
      authProvider: 'firebase',
      settings: user.settings,
      stats: user.stats,
    }).catch((err) => {
      console.warn('[syncService] Failed to sync profile:', err);
    });
  });
}
