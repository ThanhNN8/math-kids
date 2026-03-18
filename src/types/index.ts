// User types
export interface UserProfile {
  uid: string;
  displayName: string;
  avatarId: number;
  role: 'child' | 'parent';
  parentId?: string;
  createdAt: number;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  dailyTimeLimit: number; // minutes
  enabledTables: number[]; // [2,3,4,...,9]
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'auto';
  soundEnabled: boolean;
}

export interface UserStats {
  totalStars: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalProblems: number;
  totalCorrect: number;
}

// Math problem types
export interface MathProblem {
  id: string;
  num1: number;
  num2: number;
  operation: 'multiply' | 'add' | 'subtract';
  correctAnswer: number;
  options: number[];
  difficulty: number;
}

export interface ProblemResult {
  problem: MathProblem;
  selectedAnswer: number;
  isCorrect: boolean;
  timeMs: number;
  score: number;
}

// Progress tracking
export interface TableProgress {
  tableNumber: number;
  accuracy: number;
  avgTimeMs: number;
  totalAttempts: number;
  masteryLevel: 'learning' | 'practicing' | 'mastered';
  problemBreakdown: Record<string, { correct: number; total: number; avgTime: number }>;
}

// Session
export interface GameSession {
  id: string;
  userId: string;
  type: 'practice' | 'racing' | 'shooting' | 'puzzle' | 'mental-math';
  startedAt: number;
  endedAt?: number;
  score: number;
  accuracy: number;
  starsEarned: number;
  problems: ProblemResult[];
  metadata?: Record<string, unknown>;
}

// Rewards
export interface Badge {
  id: string;
  nameVi: string;
  description: string;
  icon: string;
  criteria: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned?: boolean;
  earnedAt?: number;
}

export interface ShopItem {
  id: string;
  nameVi: string;
  type: 'car_skin' | 'ship_skin' | 'puzzle_image' | 'avatar';
  cost: number;
  requiredLevel: number;
  imageUrl: string;
  owned?: boolean;
}

export interface RewardEntry {
  id: string;
  type: string;
  itemId: string;
  earnedAt: number;
}

// Multi-account
export interface AccountRecord {
  uid: string;
  displayName: string;
  avatarId: number;
  passwordHash: string;
  role: 'child' | 'parent';
  createdAt: number;
  settings: UserSettings;
  stats: UserStats;
}

// Saved session history
export interface SavedSession {
  id: string;
  userId: string;
  type: 'racing' | 'shooting' | 'puzzle' | 'multiplication' | 'mixed' | 'mental-math';
  startedAt: number;
  endedAt: number;
  score: number;
  accuracy: number;
  starsEarned: number;
  totalProblems: number;
  correctCount: number;
  durationMs: number;
}

// Leaderboard
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarId: number;
  score: number;
  rank: number;
}

// Game-specific
export interface RacingGameState {
  playerPosition: number;
  aiPositions: number[];
  currentLap: number;
  totalLaps: number;
  speed: number;
  boost: number;
}

export interface ShootingGameState {
  wave: number;
  totalWaves: number;
  score: number;
  health: number;
  streak: number;
  powerUps: string[];
}

export interface PuzzleGameState {
  gridSize: number;
  pieces: PuzzlePiece[];
  solvedCount: number;
  totalPieces: number;
}

export interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  isLocked: boolean;
  isSolved: boolean;
}

// Avatar list
export const AVATARS = [
  { id: 1, name: 'Meo Con', emoji: '🐱' },
  { id: 2, name: 'Cun Con', emoji: '🐶' },
  { id: 3, name: 'Gau Bong', emoji: '🧸' },
  { id: 4, name: 'Tho Trang', emoji: '🐰' },
  { id: 5, name: 'Su Tu', emoji: '🦁' },
  { id: 6, name: 'Khi Con', emoji: '🐵' },
  { id: 7, name: 'Cu Meo', emoji: '🦉' },
  { id: 8, name: 'Buom Xinh', emoji: '🦋' },
  { id: 9, name: 'Ca Heo', emoji: '🐬' },
  { id: 10, name: 'Ngoi Sao', emoji: '⭐' },
  { id: 11, name: 'Rong Con', emoji: '🐲' },
  { id: 12, name: 'Ky Lan', emoji: '🦄' },
] as const;

// XP per level calculation
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + xpForLevel(level) <= totalXP && level < 50) {
    xpNeeded += xpForLevel(level);
    level++;
  }
  return level;
}
