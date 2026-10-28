import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';
import { Button } from '../ui/Button';
import { t } from '../../services/i18n';
import { countUp } from '../utils/countUp';
import { fadeIn, fadeToScene } from '../utils/transition';

export class DefeatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DefeatScene' });
  }

  create(data: { score: number; level: number; credits?: number }) {
    const { width, height } = this.scale;
    const font = StyleConfig.Fonts.Main;
    fadeIn(this);

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
      .text(width / 2, 90, t('defeat.title'), {
        fontFamily: font,
        fontSize: '24px',
        color: StyleConfig.Colors.NeonRed,
        shadow: { color: '#000', offsetX: 2, offsetY: 2, fill: true, blur: 0 },
      })
      .setOrigin(0.5);

    const warn = this.add
      .text(width / 2, 124, t('defeat.sub'), {
        fontFamily: font,
        fontSize: '8px',
        color: StyleConfig.Colors.NeonOrange,
      })
      .setOrigin(0.5);
    this.time.addEvent({ delay: 500, loop: true, callback: () => warn.setVisible(!warn.visible) });

    this.add
      .text(width / 2, 170, t('result.score'), {
        fontFamily: font,
        fontSize: '8px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);
    const score = this.add
      .text(width / 2, 190, '0', {
        fontFamily: font,
        fontSize: '16px',
        color: StyleConfig.Colors.White,
      })
      .setOrigin(0.5);

    const reward = this.add
      .text(width / 2, 216, '', {
        fontFamily: font,
        fontSize: '8px',
        color: StyleConfig.Colors.Credits,
      })
      .setOrigin(0.5);

    countUp(this, score, data.score).then(() => {
      if (data.credits) {
        countUp(this, reward, data.credits, (n) => `+${n} ${t('cur.cr')}`, 400);
      }
    });

    const by = height - 140;
    Button.create(
      this,
      width / 2,
      by,
      t('defeat.retry'),
      () => fadeToScene(this, 'GameScene', { level: data.level }),
      {
        primary: true,
      },
    );
    Button.create(this, width / 2, by + 44, t('defeat.garage'), () =>
      fadeToScene(this, 'GarageScene'),
    );
    Button.create(this, width / 2, by + 88, t('defeat.menu'), () => fadeToScene(this, 'MenuScene'));
  }
}
