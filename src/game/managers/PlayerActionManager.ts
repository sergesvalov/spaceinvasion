import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EntityManager } from './EntityManager';
import { GameState } from '../../services/GameState';
import { AudioManager } from '../../services/AudioManager';
import { GameConfig } from '../config/GameConfig';
import { EventBus } from '../../services/EventBus';

export class PlayerActionManager {
  private boundHandlers: Record<string, Function> = {};

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
    private entityManager: EntityManager,
    private isPlayingGetter: () => boolean,
    private updateHUDCallback: () => void
  ) {}

  public setupEvents() {
    this.boundHandlers['transform_request'] = () => this.handleTransformRequest();
    this.boundHandlers['shield_request'] = () => this.handleShieldRequest();
    this.boundHandlers['bomb_request'] = () => this.handleBombRequest();
    this.boundHandlers['dash_request'] = (dir: { dx: number, dy: number }) => this.handleDashRequest(dir);
    this.boundHandlers['mecha_shockwave'] = (data: any) => this.handleMechaShockwave(data);

    Object.entries(this.boundHandlers).forEach(([event, handler]) => {
      EventBus.on(event, handler as Function, this);
    });
  }

  public destroy() {
    Object.entries(this.boundHandlers).forEach(([event, handler]) => {
      EventBus.off(event, handler as Function, this);
    });
    this.boundHandlers = {};
  }

  private handleShieldRequest() {
    const state = GameState.getInstance();
    if (!this.player.isShielded() && state.useShield()) {
      this.player.activatePurchasedShield();
      this.updateHUDCallback();
      AudioManager.getInstance().playShieldSound(this.scene);
    } else if (state.shields === 0) {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }

  private handleBombRequest() {
    if (!this.isPlayingGetter()) return;
    
    const state = GameState.getInstance();
    if (state.useBomb()) {
      this.scene.cameras.main.flash(500, 255, 255, 255);
      this.scene.cameras.main.shake(300, 0.02);
      AudioManager.getInstance().playBombSound(this.scene);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      }
      
      this.entityManager.applyDamageToAllEnemies(100);
      this.entityManager.clearEnemyProjectiles();

      this.updateHUDCallback();
    } else {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }

  private handleDashRequest(dir: { dx: number, dy: number }) {
    if (this.player.getForm() === 'mecha' && this.isPlayingGetter()) {
      this.player.dash(dir.dx, dir.dy, this.scene.time.now);
    }
  }

  private handleMechaShockwave(data: { x: number, y: number, radius: number }) {
    if (!this.isPlayingGetter()) return;
    
    this.scene.cameras.main.flash(300, 255, 200, 0);
    this.scene.cameras.main.shake(200, 0.015);
    AudioManager.getInstance().playBombSound(this.scene);
    
    this.entityManager.applyDamageToAllEnemies(100, data.radius, data.x, data.y);
    this.entityManager.clearEnemyProjectiles(data.radius, data.x, data.y);

    this.updateHUDCallback();
  }

  private handleTransformRequest() {
    if (this.player.getForm() === 'mecha') return;
    
    const state = GameState.getInstance();
    if (state.spendAntimatter(GameConfig.Player.MechaCost)) {
      this.updateHUDCallback();

      this.player.transformToMecha();
      AudioManager.getInstance().playTransformSound(this.scene);

      this.scene.time.delayedCall(GameConfig.Player.MechaDuration, () => {
        if (this.isPlayingGetter()) {
          this.player.revertToFighter();
        }
      });
    }
  }
}
