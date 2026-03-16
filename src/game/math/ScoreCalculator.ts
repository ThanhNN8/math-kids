export class ScoreCalculator {
  private static readonly BASE_SCORE = 10;
  private static readonly MAX_TIME_BONUS = 10;
  private static readonly FAST_TIME_MS = 2000;
  private static readonly SLOW_TIME_MS = 10000;
  private static readonly STREAK_MULTIPLIER = 0.1;
  private static readonly MAX_STREAK_BONUS = 2.0;

  static calculate(isCorrect: boolean, timeMs: number, streak: number = 0): {
    score: number;
    xp: number;
    timeBonus: number;
    streakBonus: number;
  } {
    if (!isCorrect) {
      return { score: 0, xp: 1, timeBonus: 0, streakBonus: 0 };
    }

    // Time bonus: faster = more points (linear interpolation)
    const clampedTime = Math.max(this.FAST_TIME_MS, Math.min(timeMs, this.SLOW_TIME_MS));
    const timeRatio = 1 - (clampedTime - this.FAST_TIME_MS) / (this.SLOW_TIME_MS - this.FAST_TIME_MS);
    const timeBonus = Math.round(timeRatio * this.MAX_TIME_BONUS);

    // Streak bonus: consecutive correct answers
    const streakBonus = Math.min(streak * this.STREAK_MULTIPLIER, this.MAX_STREAK_BONUS);

    // Total score
    const score = Math.round((this.BASE_SCORE + timeBonus) * (1 + streakBonus));
    const xp = this.BASE_SCORE + timeBonus;

    return { score, xp, timeBonus, streakBonus };
  }

  static calculateStars(totalProblems: number, correctCount: number): number {
    if (totalProblems < 10) return 0;
    const accuracy = correctCount / totalProblems;
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.7) return 2;
    return 1;
  }

  static calculateDailyStreak(lastActiveDate: string, currentDate: string): {
    newStreak: number;
    streakBroken: boolean;
    bonusStars: number;
  } {
    const last = new Date(lastActiveDate);
    const current = new Date(currentDate);
    const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { newStreak: 0, streakBroken: false, bonusStars: 0 };
    }
    if (diffDays === 1) {
      return { newStreak: 1, streakBroken: false, bonusStars: Math.min(5, 1) };
    }
    return { newStreak: 0, streakBroken: true, bonusStars: 1 };
  }
}
