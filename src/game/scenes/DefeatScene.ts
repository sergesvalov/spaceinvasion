import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';
import { Button } from '../ui/Button';

export class DefeatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DefeatScene' });
  }

  create(data: { score: number; level: number }) {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, StyleConfig.ColorsHex.Black, 1).setOrigin(0);

    // Simple pixelated starfield background for defeat
    const noise = this.add.graphics();
    noise.fillStyle(0xffffff, 0.4);
    for (let i = 0; i < 50; i++) {
      noise.fillRect(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 2, 2);
    }

    // Hard screen shake
    this.cameras.main.shake(300, 0.03);

    this.add
      .text(width / 2, height / 2 - 120, 'GAME OVER', {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '24px', // fits 270px width
        color: StyleConfig.Colors.NeonRed,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 60, `SCORE\n${data.score}`, {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '16px',
        color: StyleConfig.Colors.White,
        align: 'center',
      })
      .setOrigin(0.5);

    const warn = this.add
      .text(width / 2, height / 2, 'HULL DESTROYED', {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '10px',
        color: StyleConfig.Colors.NeonOrange,
      })
      .setOrigin(0.5);

    // Blinking effect
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => warn.setVisible(!warn.visible),
    });

    Button.create(this, width / 2, height / 2 + 70, 'RETRY', () => {
      this.scene.start('GameScene', { level: data.level });
    });

    Button.create(this, width / 2, height / 2 + 120, 'GARAGE', () => {
      this.scene.start('GarageScene');
    });

    Button.create(this, width / 2, height / 2 + 170, 'MENU', () => {
      this.scene.start('MenuScene');
    });
  }
}
