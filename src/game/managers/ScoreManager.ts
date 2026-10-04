import Phaser from 'phaser';
import { GameState } from '../../services/GameState';
import { StyleConfig } from '../config/StyleConfig';
import { AudioManager } from '../../services/AudioManager';

export class ScoreManager {
  public score: number = 0;
  public antimatter: number;

  constructor(
    private scene: Phaser.Scene,
    private onUpdateHUD: (score: number, health: number, antimatter: number) => void,
  ) {
    this.antimatter = GameState.getInstance().antimatter;
  }

  public syncAntimatter() {
    this.antimatter = GameState.getInstance().antimatter;
  }

  public chainCount: number = 0;
  public maxChain: number = 0;
  public kills: number = 0;

  public resetChain() {
    this.chainCount = 0;
  }

  public addScore(
    points: number,
    health: number,
    showFloatingText?: (text: string, color: string) => void,
  ) {
    this.chainCount++;
    this.kills++;
    this.maxChain = Math.max(this.maxChain, this.chainCount);
    const multiplier = Math.min(this.chainCount, 8); // max x8

    this.score += points * multiplier;
    AudioManager.getInstance().playEnemyDestroyed(this.scene);
    this.onUpdateHUD(this.score, health, this.antimatter);

    if (showFloatingText && this.chainCount > 1) {
      if (this.chainCount % 5 === 0) {
        showFloatingText(`CHAIN x${this.chainCount}!`, '#00ffff');
      }
    }
  }

  public addAntimatter(
    amount: number,
    health: number,
    showFloatingText: (text: string, color: string) => void,
  ) {
    GameState.getInstance().addAntimatter(amount);
    this.antimatter = GameState.getInstance().antimatter;
    this.onUpdateHUD(this.score, health, this.antimatter);
    showFloatingText('+1 AM', StyleConfig.Colors.NeonPink);
  }
}
