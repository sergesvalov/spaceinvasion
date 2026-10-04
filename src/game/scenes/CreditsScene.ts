import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';
import { Button } from '../ui/Button';

export class CreditsScene extends Phaser.Scene {
  private nextLevel: number = 1;

  constructor() {
    super({ key: 'CreditsScene' });
  }

  create(data: { nextLevel: number }) {
    this.nextLevel = data.nextLevel || 4;
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(0, 0, width, height, StyleConfig.ColorsHex.Black, 1).setOrigin(0);

    // Simple pixelated starfield
    const noise = this.add.graphics();
    noise.fillStyle(0xffffff, 0.4);
    for (let i = 0; i < 50; i++) {
      noise.fillRect(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 2, 2);
    }

    const title = this.add
      .text(width / 2, height, 'MISSION ACCOMPLISHED', {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '16px',
        color: StyleConfig.Colors.NeonCyan,
      })
      .setOrigin(0.5);

    const creditsText = this.add
      .text(
        width / 2,
        height + 150,
        'SPACE INVASION\n\n' +
          'A Game by AI\n\n' +
          'DESIGN\nAntigravity\n\n' +
          'PROGRAMMING\nAntigravity\n\n' +
          'ART\nProcedural\n\n' +
          'AUDIO\nZzFX\n\n\n' +
          'THANKS FOR PLAYING!',
        {
          fontFamily: StyleConfig.Fonts.Main,
          fontSize: '10px',
          color: StyleConfig.Colors.White,
          align: 'center',
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5);

    // Scroll up animation
    this.tweens.add({
      targets: [title, creditsText],
      y: '-= 600',
      duration: 10000,
      onComplete: () => {
        this.showContinueButton(width, height);
      },
    });

    // Skip on click
    this.input.once('pointerdown', () => {
      this.tweens.killAll();
      title.y = 100;
      creditsText.y = 250;
      this.showContinueButton(width, height);
    });
  }

  private showContinueButton(width: number, height: number) {
    Button.create(this, width / 2, height - 50, 'NEW GAME+', () => {
      this.scene.start('MapScene', { level: this.nextLevel });
    });

    Button.create(this, width / 2, height - 100, 'MAIN MENU', () => {
      this.scene.start('MenuScene');
    });
  }
}
