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
    // For now simple thresholds. Later can be level-specific.
    if (data.score >= 15000) {
      rank = 'S';
      rankColor = StyleConfig.Colors.NeonPink;
    } else if (data.score >= 10000) {
      rank = 'A';
      rankColor = StyleConfig.Colors.NeonCyan;
    } else if (data.score >= 5000) {
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
        if (data.level < 3) {
          StoryManager.getInstance().showBriefing(`level_${data.level}_victory`, () => {
            this.scene.start('MapScene', { level: data.level + 1 });
          });
        } else {
          StoryManager.getInstance().showBriefing(`level_3_victory`, () => {
            this.scene.start('MenuScene'); // End of game
          });
        }
      });
    });
  }
}
