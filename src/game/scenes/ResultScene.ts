import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';
import { Button } from '../ui/Button';
import { GameState } from '../../services/GameState';
import { StoryManager } from '../../services/StoryManager';
import { AudioManager } from '../../services/AudioManager';
import { t } from '../../services/i18n';
import { countUp } from '../utils/countUp';
import { fadeIn, fadeToScene } from '../utils/transition';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  async create(data: {
    level: number;
    score: number;
    kills: number;
    maxChain: number;
    health: number;
    credits?: number;
  }) {
    const { width, height } = this.scale;
    const state = GameState.getInstance();
    const font = StyleConfig.Fonts.Main;
    fadeIn(this);

    // Clear background
    this.add.rectangle(0, 0, width, height, StyleConfig.ColorsHex.Black, 1).setOrigin(0);

    // Calculate Rank
    let rank = 'C';
    let rankColor = StyleConfig.Colors.White;

    // Level-specific rank thresholds
    const sRank = data.level >= 3 ? 35000 : data.level === 2 ? 25000 : 15000;
    const aRank = data.level >= 3 ? 25000 : data.level === 2 ? 15000 : 10000;
    const bRank = data.level >= 3 ? 15000 : data.level === 2 ? 10000 : 5000;

    if (data.score >= sRank) {
      rank = 'S';
      rankColor = StyleConfig.Colors.NeonPink;
    } else if (data.score >= aRank) {
      rank = 'A';
      rankColor = StyleConfig.Colors.NeonCyan;
    } else if (data.score >= bRank) {
      rank = 'B';
      rankColor = StyleConfig.Colors.NeonYellow;
    }

    // Header
    this.add
      .text(width / 2, 44, t('result.title'), {
        fontFamily: font,
        fontSize: '16px',
        color: StyleConfig.Colors.NeonCyan,
        align: 'center',
        lineSpacing: 6,
        shadow: { color: StyleConfig.Colors.DeepBlue, offsetX: 2, offsetY: 2, fill: true, blur: 0 },
      })
      .setOrigin(0.5);

    const stats: {
      label: string;
      value: number;
      format?: (n: number) => string;
      color?: string;
    }[] = [
      { label: t('result.score'), value: data.score },
      { label: t('result.kills'), value: data.kills },
      { label: t('result.chain'), value: data.maxChain, format: (n) => `${n}x` },
      { label: t('result.hull'), value: data.health, format: (n) => `${n} / ${state.maxHp}` },
    ];
    if (data.credits) {
      stats.push({
        label: t('result.reward'),
        value: data.credits,
        format: (n) => `+${n} ${t('cur.cr')}`,
        color: StyleConfig.Colors.Credits,
      });
    }

    const wait = (ms: number) => new Promise<void>((r) => this.time.delayedCall(ms, r));

    let y = 96;
    for (const stat of stats) {
      await wait(150);
      this.add.text(20, y, stat.label, { fontFamily: font, fontSize: '8px', color: '#aaaaaa' });
      const value = this.add
        .text(width - 20, y, '0', {
          fontFamily: font,
          fontSize: '8px',
          color: stat.color ?? StyleConfig.Colors.White,
        })
        .setOrigin(1, 0);
      this.add.rectangle(20, y + 14, width - 40, 1, 0x333333).setOrigin(0);
      await countUp(this, value, stat.value, stat.format, 450);
      y += 24;
    }

    // Rank stamp
    await wait(250);
    this.add
      .text(width / 2, y + 24, t('result.rank'), {
        fontFamily: font,
        fontSize: '8px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);
    const rankText = this.add
      .text(width / 2, y + 68, rank, {
        fontFamily: font,
        fontSize: '48px',
        color: rankColor,
        shadow: { color: '#000', offsetX: 4, offsetY: 4, fill: true, blur: 0 },
      })
      .setOrigin(0.5)
      .setScale(3)
      .setAlpha(0);
    this.tweens.add({
      targets: rankText,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.cameras.main.shake(100, 0.01);
        this.cameras.main.flash(120, 255, 255, 255);
        AudioManager.getInstance().playExplosion(this, { volume: 0.5 });
      },
    });

    // Show button to proceed
    await wait(600);
    Button.create(
      this,
      width / 2,
      height - 40,
      t('result.continue'),
      () => {
        StoryManager.getInstance().showBriefing(`level_${data.level}_victory`, () => {
          if (data.level % 4 === 0) {
            fadeToScene(this, 'CreditsScene', { nextLevel: data.level + 1 });
          } else {
            fadeToScene(this, 'MapScene', { level: data.level + 1 });
          }
        });
      },
      { primary: true },
    );
  }
}
