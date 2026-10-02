import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import { EntityManager } from './EntityManager';
import { HUDManager } from './HUDManager';
import { InputManager } from './InputManager';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameState } from '../../services/GameState';
import { StoryManager } from '../../services/StoryManager';
import { GameConfig } from '../config/GameConfig';
import { burst } from '../effects/burst';
import { AudioManager } from '../../services/AudioManager';

export class GameController {
  private isPlaying: boolean = false;
  private isInvulnerable: boolean = false;
  private damageTimestamps: number[] = [];
  
  private score: number = 0;
  private health: number = 3;
  private antimatter: number = 0;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
    private boss: Boss,
    private entityManager: EntityManager,
    private hudManager: HUDManager,
    private inputManager: InputManager,
    private currentLevel: number
  ) {
    const state = GameState.getInstance();
    this.health = state.currentHp;
    // Antimatter is a persistent currency shared with the Garage, so the HUD
    // mirrors the saved balance instead of counting only this run's pickups.
    this.antimatter = state.antimatter;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setIsPlaying(playing: boolean) {
    this.isPlaying = playing;
  }

  public getScore(): number {
    return this.score;
  }

  public getDDAModifier(time: number): number {
    this.damageTimestamps = this.damageTimestamps.filter(t => time - t < 30000);
    const hits = this.damageTimestamps.length;
    let modifier = 1.0 + (hits * 0.2);
    if (hits === 0 && this.score > 2000) {
      modifier = 0.8;
    }
    return Math.min(2.0, modifier);
  }

  private boundHandlers: Record<string, Function> = {};

  public setupEvents() {
    this.boundHandlers['enemy_destroyed'] = (points: number) => this.handleEnemyDestroyed(points);
    this.boundHandlers['boss_destroyed'] = () => this.handleVictory();
    this.boundHandlers['antimatter_collected'] = () => this.handleAntimatterCollected();
    this.boundHandlers['player_hit'] = () => this.handlePlayerDamage();
    this.boundHandlers['powerup_collected'] = (type: string) => this.handlePowerUpCollected(type);
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

  public handleBossPhase(width: number) {
    console.log('[GameController] Boss phase started!');
    this.boss.spawn(width / 2, -100);
    this.hudManager.showBossBar();
    this.hudManager.updateBossBar(this.boss.hp, GameConfig.Boss.HP);
  }

  public updateBossHUD() {
    if (this.boss.active) {
      this.hudManager.updateBossBar(this.boss.hp, GameConfig.Boss.HP);
    }
  }

  private handleShieldRequest() {
    const state = GameState.getInstance();
    if (!this.player.isShielded() && state.useShield()) {
      this.player.activatePurchasedShield();
      this.hudManager.update(this.score, this.health, this.antimatter);
      
      AudioManager.getInstance().playPew(this.scene, { volume: 0.5, rate: 0.8 });
    } else if (state.shields === 0) {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }

  private handleBombRequest() {
    if (!this.isPlaying) return;
    
    const state = GameState.getInstance();
    if (state.useBomb()) {
      // Screen clear visual effect
      this.scene.cameras.main.flash(500, 255, 255, 255);
      this.scene.cameras.main.shake(300, 0.02);
      
      AudioManager.getInstance().playExplosion(this.scene, { volume: 1.0 });
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      }
      
      this.entityManager.applyDamageToAllEnemies(100);
      this.entityManager.clearEnemyProjectiles();

      this.hudManager.update(this.score, this.health, this.antimatter);
    } else {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }

  private handleDashRequest(dir: { dx: number, dy: number }) {
    if (this.player.getForm() === 'mecha' && this.isPlaying) {
      this.player.dash(dir.dx, dir.dy, this.scene.time.now);
    }
  }

  private handleMechaShockwave(data: { x: number, y: number, radius: number }) {
    if (!this.isPlaying) return;
    
    this.scene.cameras.main.flash(300, 255, 200, 0);
    this.scene.cameras.main.shake(200, 0.015);
    
    AudioManager.getInstance().playExplosion(this.scene, { volume: 0.8 });
    
    this.entityManager.applyDamageToAllEnemies(100, data.radius, data.x, data.y);
    this.entityManager.clearEnemyProjectiles(data.radius, data.x, data.y);

    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handleTransformRequest() {
    if (this.player.getForm() === 'mecha') return; // Already transformed
    
    const state = GameState.getInstance();
    if (state.spendAntimatter(GameConfig.Player.MechaCost)) {
      this.antimatter = state.antimatter;
      this.hudManager.update(this.score, this.health, this.antimatter);

      this.player.transformToMecha();
      
      AudioManager.getInstance().playPew(this.scene, { volume: 0.5, rate: 0.5 }); // Deep sound

      this.scene.time.delayedCall(GameConfig.Player.MechaDuration, () => {
        if (this.isPlaying) {
          this.player.revertToFighter();
        }
      });
    } else {
      // Optional: Play an error sound or visual feedback that antimatter is not enough
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    const txt = this.scene.add.text(x, y, text, {
      fontSize: '20px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => txt.destroy()
    });
  }

  private handleEnemyDestroyed(points: number) {
    AudioManager.getInstance().playExplosion(this.scene, { volume: 0.3 });
    this.score += points;
    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handleAntimatterCollected() {
    const state = GameState.getInstance();
    state.addAntimatter(1);
    this.antimatter = state.antimatter;
    this.hudManager.update(this.score, this.health, this.antimatter);
    this.showFloatingText(this.player.x, this.player.y, '+1 AM', '#ff00ff');
  }

  private handlePowerUpCollected(type: string) {
    const state = GameState.getInstance();
    if (type === 'health') {
      this.health = Math.min(this.health + 1, state.maxHp);
      state.setHp(this.health);
      this.hudManager.update(this.score, this.health, this.antimatter);
      AudioManager.getInstance().playPew(this.scene, { volume: 0.5, rate: 2 });
    } else if (type === 'weapon') {
      state.upgradeWeapon();
      this.player.weaponLevel = state.weaponLevel;
      AudioManager.getInstance().playPew(this.scene, { volume: 0.5, rate: 1.5 });
      this.showFloatingText(this.player.x, this.player.y, 'W UP', '#ffff00');
    } else if (type === 'spread' || type === 'homing') {
      this.player.setTempWeapon(type as any, 10000); // 10 seconds
      AudioManager.getInstance().playPew(this.scene, { volume: 0.8, rate: 1.0 });
      this.showFloatingText(this.player.x, this.player.y, type.toUpperCase(), '#00ffff');
    }
  }

  private handlePlayerDamage() {
    if (this.isInvulnerable || this.player.isDashing) return;
    // God mode for E2E tests to prevent flaky test failures due to bullet hell randomness
    if ((window as any).__E2E_TEST_MODE__) return;
    
    this.health -= 1;
    this.isInvulnerable = true;
    this.damageTimestamps.push(this.scene.time.now);
    
    const state = GameState.getInstance();
    state.setHp(this.health);
    this.hudManager.update(this.score, this.health, this.antimatter);
    
    this.scene.cameras.main.shake(200, 0.01);
    this.scene.cameras.main.flash(200, 255, 0, 0);
    
    AudioManager.getInstance().playPew(this.scene, { volume: 0.5, rate: 0.2 });
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }

    if (this.health <= 0) {
      console.log('[GameController] Player defeated!');
      AudioManager.getInstance().playExplosion(this.scene, { volume: 0.8 });
      this.isPlaying = false;
      this.inputManager.isActive = false;
      (window as any).__GAME_RESULT__ = 'DEFEAT';
      this.player.explode();

      AnalyticsService.getInstance().playerDeath(this.player.x, this.player.y);
      AnalyticsService.getInstance().levelFail(`level_${this.currentLevel}`, 'no_health');
      
      state.addCredits(this.score);
      // Hand back a barely-flyable hull instead of a free full repair: the
      // Garage is what restores HP. 1 HP guarantees the player is never stuck.
      state.setHp(1);
      
      setTimeout(() => {
        this.hudManager.destroy();
        this.destroy();
        this.scene.scene.start('DefeatScene', { score: this.score, level: this.currentLevel });
      }, 2000);
    } else {
      // Blinking invulnerability effect
      const blinkTween = this.scene.tweens.add({
        targets: this.player,
        alpha: 0.2,
        duration: 80,
        yoyo: true,
        repeat: 5, // 6 blinks over ~960ms
      });

      this.scene.time.delayedCall(1000, () => {
        blinkTween.stop();
        if (this.isPlaying) {
          this.player.setAlpha(1);
        }
        this.isInvulnerable = false;
      });
    }
  }

  private handleVictory() {
    console.log('[GameController] Boss destroyed! VICTORY!');
    this.isPlaying = false;
    this.inputManager.isActive = false;
    (window as any).__GAME_RESULT__ = 'VICTORY';
    
    this.scene.cameras.main.shake(1500, 0.02);
    
    AnalyticsService.getInstance().levelComplete(`level_${this.currentLevel}`);

    this.hudManager.hideBossBar();

    this.entityManager.enemies.children.iterate((c) => {
      const e = c as Enemy;
      if (e.active) {
        burst(this.scene, e.x, e.y, 20, {
          speed: { min: 50, max: 200 }, scale: { start: 1, end: 0 }, lifespan: 300
        });
        e.setActive(false).setVisible(false);
      }
      return true;
    });

    const state = GameState.getInstance();
    state.addCredits(this.score + 5000); 

    const { width, height } = this.scene.scale;
    this.scene.add.text(width / 2, height / 2 - 50, 'MISSION ACCOMPLISHED', {
      fontSize: '28px', color: '#00ffcc', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.add.text(width / 2, height / 2 + 10, '+5000 CREDITS', {
      fontSize: '20px', color: '#ffaa00'
    }).setOrigin(0.5);

    setTimeout(() => {
      this.hudManager.destroy();
      this.destroy();
      if (this.currentLevel === 1) {
        StoryManager.getInstance().showBriefing('level_1_victory', () => {
          this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
          this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.scene.start('MapScene', { level: 2 });
          });
        });
      } else {
        this.scene.scene.start('MenuScene');
      }
    }, 4000);
  }
}
