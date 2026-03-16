export class DifficultyManager {
  private currentDifficulty: number = 1;
  private recentResults: boolean[] = [];
  private recentTimes: number[] = [];
  private readonly windowSize = 10;

  get difficulty(): number {
    return this.currentDifficulty;
  }

  recordResult(isCorrect: boolean, timeMs: number): void {
    this.recentResults.push(isCorrect);
    this.recentTimes.push(timeMs);

    if (this.recentResults.length > this.windowSize) {
      this.recentResults.shift();
      this.recentTimes.shift();
    }

    this.adjustDifficulty();
  }

  private adjustDifficulty(): void {
    if (this.recentResults.length < 5) return;

    const accuracy = this.recentResults.filter(Boolean).length / this.recentResults.length;
    const avgTime = this.recentTimes.reduce((a, b) => a + b, 0) / this.recentTimes.length;

    // Fast and accurate → harder
    if (accuracy >= 0.9 && avgTime < 3000) {
      this.currentDifficulty = Math.min(3, this.currentDifficulty + 0.25);
    }
    // Good accuracy, moderate speed → slightly harder
    else if (accuracy >= 0.8 && avgTime < 5000) {
      this.currentDifficulty = Math.min(3, this.currentDifficulty + 0.1);
    }
    // Struggling → easier
    else if (accuracy < 0.5) {
      this.currentDifficulty = Math.max(1, this.currentDifficulty - 0.5);
    }
    // Below average → slightly easier
    else if (accuracy < 0.7) {
      this.currentDifficulty = Math.max(1, this.currentDifficulty - 0.2);
    }
  }

  reset(): void {
    this.currentDifficulty = 1;
    this.recentResults = [];
    this.recentTimes = [];
  }

  getStats() {
    const accuracy = this.recentResults.length > 0
      ? this.recentResults.filter(Boolean).length / this.recentResults.length
      : 0;
    const avgTime = this.recentTimes.length > 0
      ? this.recentTimes.reduce((a, b) => a + b, 0) / this.recentTimes.length
      : 0;

    return {
      difficulty: this.currentDifficulty,
      accuracy,
      avgTime,
      totalAnswered: this.recentResults.length,
    };
  }
}
