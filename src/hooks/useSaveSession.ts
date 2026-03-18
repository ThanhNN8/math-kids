import { useRef, useCallback } from 'react';
import { useHistoryStore } from '@/stores/useHistoryStore';
import { useAccountsStore } from '@/stores/useAccountsStore';
import { useUserStore } from '@/stores/useUserStore';
import type { SavedSession, ProblemResult } from '@/types';
import { ScoreCalculator } from '@/game/math/ScoreCalculator';

interface SaveSessionParams {
  type: SavedSession['type'];
  results: ProblemResult[];
  startedAt: number;
  starsOverride?: number;
}

export function useSaveSession() {
  const savedRef = useRef(false);

  const saveSession = useCallback(({ type, results, startedAt, starsOverride }: SaveSessionParams) => {
    if (savedRef.current) return; // prevent double-save
    savedRef.current = true;

    const user = useUserStore.getState().user;
    if (!user) return;

    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const accuracy = results.length > 0 ? correctCount / results.length : 0;
    const stars = starsOverride ?? ScoreCalculator.calculateStars(results.length, correctCount);
    const endedAt = Date.now();

    const session: SavedSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.uid,
      type,
      startedAt,
      endedAt,
      score: totalScore,
      accuracy,
      starsEarned: stars,
      totalProblems: results.length,
      correctCount,
      durationMs: endedAt - startedAt,
    };

    // Save to history store
    useHistoryStore.getState().saveSession(session);

    // Update user stats
    const updateStars = useUserStore.getState().updateStars;
    const updateXP = useUserStore.getState().updateXP;
    updateStars(stars);
    updateXP(totalScore);

    // Sync to accounts store
    const currentStats = useUserStore.getState().user?.stats;
    if (currentStats) {
      useAccountsStore.getState().updateAccountStats(user.uid, {
        totalStars: currentStats.totalStars + stars,
        xp: currentStats.xp + totalScore,
        totalProblems: currentStats.totalProblems + results.length,
        totalCorrect: currentStats.totalCorrect + correctCount,
      });
    }
  }, []);

  const resetSaveFlag = useCallback(() => {
    savedRef.current = false;
  }, []);

  return { saveSession, resetSaveFlag };
}
