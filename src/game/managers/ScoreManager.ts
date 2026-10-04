import Phaser from 'phaser';
import { GameState } from '../../services/GameState';
import { Player } from '../entities/Player';
import { StyleConfig } from '../config/StyleConfig';
import { AudioManager } from '../../services/AudioManager';

export class ScoreManager {
  public score: number = 0;
  public antimatter: number;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
    private onUpdateHUD: (score: number, health: number, antimatter: number) => void,
  ) {
    this.antimatter = GameState.getInstance().antimatter;
  }

  public syncAntimatter() {
    this.antimatter = GameState.getInstance().antimatter;
  }

  public addScore(points: number, health: number) {
    this.score += points;
    AudioManager.getInstance().playEnemyDestroyed(this.scene);
    this.onUpdateHUD(this.score, health, this.antimatter);
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
