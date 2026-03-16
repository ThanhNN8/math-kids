import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile, TableProgress, GameSession, UserStats } from '@/types';

// User operations
export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const defaultProfile: UserProfile = {
    uid,
    displayName: data.displayName || 'Be',
    avatarId: data.avatarId || 1,
    role: 'child',
    createdAt: Date.now(),
    settings: {
      dailyTimeLimit: 30,
      enabledTables: [2, 3, 4, 5, 6, 7, 8, 9],
      difficultyLevel: 'auto',
      soundEnabled: true,
    },
    stats: {
      totalStars: 0,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalProblems: 0,
      totalCorrect: 0,
    },
    ...data,
  };
  await setDoc(doc(db, 'users', uid), defaultProfile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserStats(uid: string, stats: Partial<UserStats>): Promise<void> {
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(stats)) {
    updates[`stats.${key}`] = value;
  }
  await updateDoc(doc(db, 'users', uid), updates);
}

export async function addStars(uid: string, stars: number): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    'stats.totalStars': increment(stars),
  });
}

export async function addXP(uid: string, xp: number): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    'stats.xp': increment(xp),
  });
}

// Progress operations
export async function getTableProgress(uid: string, table: number): Promise<TableProgress | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'progress', String(table)));
  return snap.exists() ? (snap.data() as TableProgress) : null;
}

export async function updateTableProgress(uid: string, table: number, data: Partial<TableProgress>): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'progress', String(table)), data, { merge: true });
}

export async function getAllProgress(uid: string): Promise<TableProgress[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'progress'));
  return snap.docs.map(d => d.data() as TableProgress);
}

// Session operations
export async function saveSession(uid: string, session: Omit<GameSession, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'sessions'), {
    ...session,
    endedAt: Date.now(),
  });
  return ref.id;
}

export async function getRecentSessions(uid: string, count: number = 10): Promise<GameSession[]> {
  const q = query(
    collection(db, 'users', uid, 'sessions'),
    orderBy('startedAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as GameSession));
}
