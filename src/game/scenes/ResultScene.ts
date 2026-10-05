import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';
import { Button } from '../ui/Button';
import { GameState } from '../../services/GameState';
import { StoryManager } from '../../services/StoryManager';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  create(data: { level: number; score: number; kills: number; maxChain: number; health: number }) {
    const { width, height } = this.scale;
    const state = GameState.getInstance();

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
      .text(width / 2, 40, 'MISSION CLEARED', {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '16px',
        color: StyleConfig.Colors.NeonCyan,
      })
      .setOrigin(0.5);

    let y = 90;
    const spacing = 30;

    // Stats list
    const stats = [
      { label: 'SCORE', value: data.score.toString() },
      { label: 'KILLS', value: data.kills.toString() },
      { label: 'MAX CHAIN', value: `${data.maxChain}x` },
      { label: 'HULL STATUS', value: `${data.health} / ${state.maxHp}` },
    ];

    stats.forEach((stat, i) => {
      // Delay showing each line
      this.time.delayedCall(i * 400, () => {
        this.add.text(20, y, stat.label, {
          fontFamily: StyleConfig.Fonts.Main,
          fontSize: '10px',
          color: StyleConfig.Colors.White,
        });

        this.add
          .text(width - 20, y, stat.value, {
            fontFamily: StyleConfig.Fonts.Main,
            fontSize: '10px',
            color: StyleConfig.Colors.NeonYellow,
          })
          .setOrigin(1, 0);

        y += spacing;
      });
    });

    // Rank
    this.time.delayedCall(stats.length * 400 + 400, () => {
      this.cameras.main.flash(200, 255, 255, 255);

      this.add
        .text(width / 2, y + 20, 'RANK', {
          fontFamily: StyleConfig.Fonts.Main,
          fontSize: '16px',
          color: StyleConfig.Colors.White,
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, y + 60, rank, {
          fontFamily: StyleConfig.Fonts.Main,
          fontSize: '48px',
          color: rankColor,
        })
        .setOrigin(0.5);
    });

    // Show button to proceed
    this.time.delayedCall(stats.length * 400 + 1200, () => {
      Button.create(this, width / 2, height - 50, 'CONTINUE', () => {
        StoryManager.getInstance().showBriefing(`level_${data.level}_victory`, () => {
          if (data.level % 4 === 0) {
            this.scene.start('CreditsScene', { nextLevel: data.level + 1 });
          } else {
            this.scene.start('MapScene', { level: data.level + 1 });
          }
        });
      });
    });
  }
}
