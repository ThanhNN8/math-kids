import Phaser from 'phaser';
import { BaseGameScene } from '../BaseGameScene';
import eventBus from '../../EventBus';

export class PuzzleScene extends BaseGameScene {
  private gridSize = 3;
  private pieces: Phaser.GameObjects.Rectangle[] = [];
  private solvedPieces: boolean[] = [];
  private currentPieceIndex = 0;
  private problemText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private elapsed = 0;

  constructor() {
    super('PuzzleScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0xfef3c7);

    // HUD
    this.timerText = this.createText(width - 10, 10, '⏱ 0s', {
      fontSize: '18px',
      color: '#1a1a2e',
    }).setOrigin(1, 0);

    // Problem text
    this.problemText = this.createText(width / 2, height * 0.65, '', {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#1a1a2e',
    }).setOrigin(0.5);

    // Timer
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.elapsed++;
        this.timerText.setText(`⏱ ${this.elapsed}s`);
      },
      loop: true,
    });

    this.resetGame();
    this.initGrid();
    this.nextPuzzleProblem();
  }

  private initGrid(): void {
    const { width } = this.scale;
    const totalPieces = this.gridSize * this.gridSize;
    this.solvedPieces = new Array(totalPieces).fill(false);
    this.pieces = [];

    const gridWidth = width * 0.7;
    const cellSize = gridWidth / this.gridSize;
    const startX = (width - gridWidth) / 2 + cellSize / 2;
    const startY = 60 + cellSize / 2;

    const colors = [0x3b82f6, 0x22c55e, 0xf59e0b, 0xef4444, 0x8b5cf6, 0xec4899, 0x14b8a6, 0xf97316, 0x6366f1];

    for (let i = 0; i < totalPieces; i++) {
      const row = Math.floor(i / this.gridSize);
      const col = i % this.gridSize;
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;

      const piece = this.add.rectangle(x, y, cellSize - 4, cellSize - 4, 0xd1d5db, 1);
      piece.setStrokeStyle(2, 0x9ca3af);
      this.pieces.push(piece);
    }
  }

  private nextPuzzleProblem(): void {
    if (this.currentPieceIndex >= this.gridSize * this.gridSize) {
      this.emitGameOver();
      return;
    }

    const problem = this.generateProblem();
    this.problemText.setText(`${problem.num1} × ${problem.num2} = ?`);

    // Create answer buttons
    const { width, height } = this.scale;
    const startY = height * 0.75;

    problem.options.forEach((option, i) => {
      const x = width * (0.15 + (i * 0.23));
      const bg = this.add.rectangle(x, startY, 70, 50, 0xffffff).setInteractive();
      bg.setStrokeStyle(2, 0x3b82f6);
      const text = this.add.text(x, startY, String(option), {
        fontFamily: 'Nunito',
        fontSize: '24px',
        color: '#1a1a2e',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        const result = this.checkAnswer(option);
        if (result?.isCorrect) {
          this.solvedPieces[this.currentPieceIndex] = true;
          const colors = [0x3b82f6, 0x22c55e, 0xf59e0b, 0xef4444, 0x8b5cf6, 0xec4899, 0x14b8a6, 0xf97316, 0x6366f1];
          this.pieces[this.currentPieceIndex].setFillStyle(colors[this.currentPieceIndex % colors.length]);
          this.currentPieceIndex++;
        }
        // Remove buttons
        bg.destroy();
        text.destroy();
        this.time.delayedCall(300, () => this.nextPuzzleProblem());
      });
    });
  }
}
