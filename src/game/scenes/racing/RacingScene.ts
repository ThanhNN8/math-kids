import Phaser from 'phaser';
import { BaseGameScene } from '../BaseGameScene';
import eventBus from '../../EventBus';

export class RacingScene extends BaseGameScene {
  private playerCar!: Phaser.GameObjects.Rectangle;
  private aiCar!: Phaser.GameObjects.Rectangle;
  private playerProgress = 0;
  private aiProgress = 0;
  private road!: Phaser.GameObjects.TileSprite;
  private problemText!: Phaser.GameObjects.Text;
  private answerButtons: Phaser.GameObjects.Container[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private problemCount = 0;
  private readonly TOTAL_PROBLEMS = 20;

  constructor() {
    super('RacingScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);

    // Road
    this.add.rectangle(width / 2, height / 2, width * 0.6, height, 0x555555);
    this.add.rectangle(width / 2, height / 2, 4, height, 0xffffff, 0.5);

    // Cars
    this.playerCar = this.add.rectangle(width * 0.35, height - 80, 40, 60, 0x3b82f6);
    this.aiCar = this.add.rectangle(width * 0.65, height - 80, 40, 60, 0xef4444);

    // Progress bars
    this.add.rectangle(60, 30, 100, 20, 0x333333).setStrokeStyle(2, 0xffffff);
    this.add.rectangle(width - 60, 30, 100, 20, 0x333333).setStrokeStyle(2, 0xffffff);

    // Score
    this.scoreText = this.createText(width / 2, 15, 'Điểm: 0', { fontSize: '18px' }).setOrigin(0.5, 0);

    // Problem text
    this.problemText = this.createText(width / 2, height * 0.35, '', {
      fontSize: '36px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Start
    this.resetGame();
    this.nextProblem();
    this.startAI();
  }

  private nextProblem(): void {
    if (this.problemCount >= this.TOTAL_PROBLEMS) {
      this.emitGameOver();
      return;
    }

    const problem = this.generateProblem();
    this.problemText.setText(`${problem.num1} × ${problem.num2} = ?`);
    this.problemCount++;

    // Clear old buttons
    this.answerButtons.forEach(b => b.destroy());
    this.answerButtons = [];

    // Create answer buttons
    const { width, height } = this.scale;
    const startY = height * 0.55;

    problem.options.forEach((option, i) => {
      const x = width * (i < 2 ? 0.3 : 0.7);
      const y = startY + (i % 2) * 70;
      const btn = this.createAnswerButton(x, y, String(option), () => {
        this.handleAnswer(option);
      });
      this.answerButtons.push(btn);
    });
  }

  private createAnswerButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(0, 0, 100, 50, 0xffffff, 1).setInteractive();
    bg.setStrokeStyle(2, 0x3b82f6);
    const label = this.add.text(0, 0, text, {
      fontFamily: 'Nunito',
      fontSize: '28px',
      color: '#1a1a2e',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [bg, label]);
    bg.on('pointerdown', onClick);
    return container;
  }

  private handleAnswer(answer: number): void {
    const result = this.checkAnswer(answer);
    if (!result) return;

    if (result.isCorrect) {
      const boost = result.timeMs < 3000 ? 15 : result.timeMs < 5000 ? 10 : 5;
      this.playerProgress = Math.min(this.playerProgress + boost, 100);
    }

    this.scoreText.setText(`Điểm: ${this.score}`);
    this.updateCarPositions();

    this.time.delayedCall(500, () => this.nextProblem());
  }

  private startAI(): void {
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.aiProgress = Math.min(this.aiProgress + Math.random() * 5 + 2, 100);
        this.updateCarPositions();
        if (this.aiProgress >= 100) {
          this.emitGameOver();
        }
      },
      loop: true,
    });
  }

  private updateCarPositions(): void {
    const { height } = this.scale;
    const topY = 80;
    const range = height - 160;
    this.playerCar.y = height - 80 - (this.playerProgress / 100) * range;
    this.aiCar.y = height - 80 - (this.aiProgress / 100) * range;
  }
}
