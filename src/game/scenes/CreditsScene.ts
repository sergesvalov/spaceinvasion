import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';
import { Button } from '../ui/Button';
import { t } from '../../services/i18n';
import { fadeIn, fadeToScene } from '../utils/transition';

const TITLE_Y = 56;
const BODY_Y = 100;

export class CreditsScene extends Phaser.Scene {
  private nextLevel: number = 1;
  private buttonsShown = false;

  constructor() {
    super({ key: 'CreditsScene' });
  }

  create(data: { nextLevel: number }) {
    this.nextLevel = data.nextLevel || 4;
    this.buttonsShown = false;
    const { width, height } = this.scale;
    fadeIn(this);

    // Background
    this.add.rectangle(0, 0, width, height, StyleConfig.ColorsHex.Black, 1).setOrigin(0);

    // Simple pixelated starfield
    const noise = this.add.graphics();
    noise.fillStyle(0xffffff, 0.4);
    for (let i = 0; i < 50; i++) {
      noise.fillRect(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 2, 2);
    }

    const title = this.add
      .text(width / 2, height + 20, t('credits.title'), {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '14px',
        color: StyleConfig.Colors.NeonCyan,
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    const creditsText = this.add
      .text(width / 2, height + 70, t('credits.body'), {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '8px',
        color: StyleConfig.Colors.White,
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5, 0);

    // Roll up into the final layout (title on top, credits below, buttons at the bottom)
    this.tweens.add({ targets: title, y: TITLE_Y, duration: 8000 });
    this.tweens.add({
      targets: creditsText,
      y: BODY_Y,
      duration: 8000,
      onComplete: () => this.showContinueButton(width, height),
    });

    // Skip on click
    this.input.once('pointerdown', () => {
      this.tweens.killAll();
      title.y = TITLE_Y;
      creditsText.y = BODY_Y;
      this.showContinueButton(width, height);
    });
  }

  private showContinueButton(width: number, height: number) {
    if (this.buttonsShown) return;
    this.buttonsShown = true;
    Button.create(
      this,
      width / 2,
      height - 84,
      t('credits.ngplus'),
      () => fadeToScene(this, 'MapScene', { level: this.nextLevel }),
      { primary: true },
    );
    Button.create(this, width / 2, height - 40, t('credits.menu'), () =>
      fadeToScene(this, 'MenuScene'),
    );
  }
}
