import { create } from 'zustand';
import type { MathProblem, ProblemResult, GameSession } from '@/types';

interface GameState {
  // Current session
  currentSession: Partial<GameSession> | null;
  currentProblem: MathProblem | null;
  problemResults: ProblemResult[];
  score: number;
  streak: number;
  timeRemaining: number;
  isPlaying: boolean;
  isPaused: boolean;

  // Actions
  startSession: (type: GameSession['type']) => void;
  setCurrentProblem: (problem: MathProblem) => void;
  addResult: (result: ProblemResult) => void;
  addScore: (points: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  setTimeRemaining: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  endSession: () => Partial<GameSession>;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentSession: null,
  currentProblem: null,
  problemResults: [],
  score: 0,
  streak: 0,
  timeRemaining: 0,
  isPlaying: false,
  isPaused: false,

  startSession: (type) => set({
    currentSession: { type, startedAt: Date.now(), userId: '' },
    problemResults: [],
    score: 0,
    streak: 0,
    isPlaying: true,
    isPaused: false,
  }),

  setCurrentProblem: (problem) => set({ currentProblem: problem }),

  addResult: (result) => set((state) => ({
    problemResults: [...state.problemResults, result],
  })),

  addScore: (points) => set((state) => ({ score: state.score + points })),

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),

  resetStreak: () => set({ streak: 0 }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setPaused: (paused) => set({ isPaused: paused }),

  endSession: () => {
    const state = get();
    const results = state.problemResults;
    const correct = results.filter(r => r.isCorrect).length;
    const accuracy = results.length > 0 ? correct / results.length : 0;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);

    const session: Partial<GameSession> = {
      ...state.currentSession,
      score: totalScore,
      accuracy,
      problems: results,
      endedAt: Date.now(),
      starsEarned: accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : results.length >= 10 ? 1 : 0,
    };

    set({ isPlaying: false, currentSession: null });
    return session;
  },

  reset: () => set({
    currentSession: null,
    currentProblem: null,
    problemResults: [],
    score: 0,
    streak: 0,
    timeRemaining: 0,
    isPlaying: false,
    isPaused: false,
  }),
}));
