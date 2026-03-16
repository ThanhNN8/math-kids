import Phaser from 'phaser';
import eventBus from '../EventBus';
import { generateMultiplication } from '../math/ProblemGenerator';
import { ScoreCalculator } from '../math/ScoreCalculator';
import type { MathProblem, ProblemResult } from '@/types';

export class BaseGameScene extends Phaser.Scene {
  protected currentProblem: MathProblem | null = null;
  protected score = 0;
  protected streak = 0;
  protected results: ProblemResult[] = [];
  protected problemStartTime = 0;
  protected difficulty = 1;

  constructor(key: string) {
    super(key);
  }

  protected generateProblem(table?: number): MathProblem {
    const problem = generateMultiplication(table, this.difficulty);
    this.currentProblem = problem;
    this.problemStartTime = Date.now();
    eventBus.emit('problem:new', problem);
    return problem;
  }

  protected checkAnswer(answer: number): ProblemResult | null {
    if (!this.currentProblem) return null;

    const timeMs = Date.now() - this.problemStartTime;
    const isCorrect = answer === this.currentProblem.correctAnswer;
    const newStreak = isCorrect ? this.streak + 1 : 0;
    const { score, xp } = ScoreCalculator.calculate(isCorrect, timeMs, newStreak);

    this.streak = newStreak;
    if (isCorrect) this.score += score;

    const result: ProblemResult = {
      problem: this.currentProblem,
      selectedAnswer: answer,
      isCorrect,
      timeMs,
      score,
    };

    this.results.push(result);
    eventBus.emit('answer:checked', result);
    return result;
  }

  protected getStars(): number {
    return ScoreCalculator.calculateStars(
      this.results.length,
      this.results.filter(r => r.isCorrect).length
    );
  }

  protected emitGameOver(): void {
    eventBus.emit('game:over', {
      score: this.score,
      results: this.results,
      stars: this.getStars(),
      streak: this.streak,
    });
  }

  protected resetGame(): void {
    this.score = 0;
    this.streak = 0;
    this.results = [];
    this.currentProblem = null;
  }

  protected createText(x: number, y: number, text: string, style?: Partial<Phaser.Types.GameObjects.Text.TextStyle>): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      ...style,
    });
  }

  protected createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(0, 0, 120, 60, 0x3b82f6, 1).setInteractive();
    bg.setStrokeStyle(2, 0x2563eb);
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [bg, label]);
    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => bg.setFillStyle(0x2563eb));
    bg.on('pointerout', () => bg.setFillStyle(0x3b82f6));

    return container;
  }
}
