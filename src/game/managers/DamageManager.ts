import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { GameState } from '../../services/GameState';
import { AudioManager } from '../../services/AudioManager';
import { GameConfig } from '../config/GameConfig';

export class DamageManager {
  private isInvulnerable: boolean = false;
  private damageTimestamps: number[] = [];
  public health: number;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
    private onDeath: () => void,
    private onHealthChanged: (newHealth: number) => void,
  ) {
    this.health = GameState.getInstance().currentHp;
  }

  public syncHealth() {
    this.health = GameState.getInstance().currentHp;
  }

  public getDDAModifier(time: number, score: number): number {
    this.damageTimestamps = this.damageTimestamps.filter((t) => time - t < 30000);
    const hits = this.damageTimestamps.length;
    let modifier = 1.0 + hits * 0.2;
    if (hits === 0 && score > 2000) {
      modifier = 0.8;
    }
    return Math.min(2.0, modifier);
  }

  public handlePlayerDamage(time: number): boolean {
    if (this.isInvulnerable || this.player.isDashing) return false;
    if (GameConfig.Runtime.isE2ETestMode) return false;

    this.health -= 1;
    this.isInvulnerable = true;
    this.damageTimestamps.push(time);

    const state = GameState.getInstance();
    state.setHp(this.health);
    this.onHealthChanged(this.health);

    this.scene.cameras.main.shake(200, 0.01);
    this.scene.cameras.main.flash(200, 255, 0, 0);
    AudioManager.getInstance().playDamageSound(this.scene);

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }

    if (this.health <= 0) {
      this.onDeath();
      return true; // died
    } else {
      const blinkTween = this.scene.tweens.add({
        targets: this.player,
        alpha: 0.2,
        duration: 80,
        yoyo: true,
        repeat: 5,
      });

      this.scene.time.delayedCall(1000, () => {
        blinkTween.stop();
        if (this.player.active) {
          this.player.setAlpha(1);
        }
        this.isInvulnerable = false;
      });
      return false; // survived
    }
  }
}
