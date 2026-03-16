import Phaser from 'phaser';
import { BaseGameScene } from '../BaseGameScene';
import eventBus from '../../EventBus';

interface Enemy {
  container: Phaser.GameObjects.Container;
  value: number;
  isCorrect: boolean;
}

export class ShootingScene extends BaseGameScene {
  private player!: Phaser.GameObjects.Triangle;
  private enemies: Enemy[] = [];
  private problemText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private health = 3;
  private wave = 1;
  private waveKills = 0;

  constructor() {
    super('ShootingScene');
  }

  create() {
    const { width, height } = this.scale;

    // Space background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a2e);

    // Stars
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Math.random() * 0.5 + 0.3
      );
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Player ship
    this.player = this.add.triangle(width / 2, height - 60, 0, 30, 15, 0, 30, 30, 0x3b82f6);

    // HUD
    this.scoreText = this.createText(10, 10, 'Điểm: 0', { fontSize: '16px' });
    this.waveText = this.createText(width - 10, 10, 'Wave 1/3', { fontSize: '16px' }).setOrigin(1, 0);
    this.problemText = this.createText(width / 2, 50, '', {
      fontSize: '28px',
      fontStyle: 'bold',
      backgroundColor: '#1a1a2e88',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5);

    this.resetGame();
    this.health = 3;
    this.wave = 1;
    this.waveKills = 0;
    this.spawnProblem();
  }

  private spawnProblem(): void {
    const problem = this.generateProblem();
    this.problemText.setText(`${problem.num1} × ${problem.num2} = ?`);

    // Clear old enemies
    this.enemies.forEach(e => e.container.destroy());
    this.enemies = [];

    // Spawn enemies with answer options
    const { width } = this.scale;
    const spacing = width / (problem.options.length + 1);

    problem.options.forEach((option, i) => {
      const x = spacing * (i + 1);
      const y = Phaser.Math.Between(100, 250);

      const bg = this.add.rectangle(0, 0, 60, 60, 0xef4444, 0.9).setInteractive();
      bg.setStrokeStyle(2, 0xff6b6b);
      const text = this.add.text(0, 0, String(option), {
        fontFamily: 'Nunito',
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      const container = this.add.container(x, y, [bg, text]);

      // Float animation
      this.tweens.add({
        targets: container,
        y: y + 20,
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const enemy: Enemy = {
        container,
        value: option,
        isCorrect: option === problem.correctAnswer,
      };

      bg.on('pointerdown', () => this.shootEnemy(enemy));
      this.enemies.push(enemy);
    });
  }

  private shootEnemy(enemy: Enemy): void {
    const result = this.checkAnswer(enemy.value);
    if (!result) return;

    // Destroy animation
    this.tweens.add({
      targets: enemy.container,
      scale: result.isCorrect ? 1.5 : 0.5,
      alpha: 0,
      duration: 300,
      onComplete: () => enemy.container.destroy(),
    });

    if (result.isCorrect) {
      this.waveKills++;
      this.scoreText.setText(`Điểm: ${this.score}`);

      if (this.waveKills >= 10) {
        if (this.wave >= 3) {
          this.emitGameOver();
          return;
        }
        this.wave++;
        this.waveKills = 0;
        this.waveText.setText(`Wave ${this.wave}/3`);
      }
    } else {
      this.health--;
      if (this.health <= 0) {
        this.emitGameOver();
        return;
      }
    }

    this.time.delayedCall(400, () => this.spawnProblem());
  }
}
