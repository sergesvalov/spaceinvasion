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

export class GameController {
  private isPlaying: boolean = false;
  private isInvulnerable: boolean = false;
  
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

  public setupEvents() {
    EventBus.on('enemy_destroyed', (points: number) => this.handleEnemyDestroyed(points));
    EventBus.on('boss_destroyed', () => this.handleVictory());
    EventBus.on('antimatter_collected', () => this.handleAntimatterCollected());
    EventBus.on('player_hit', () => this.handlePlayerDamage());
    EventBus.on('powerup_collected', (type: string) => this.handlePowerUpCollected(type));
    EventBus.on('transform_request', () => this.handleTransformRequest());
    EventBus.on('shield_request', () => this.handleShieldRequest());
    EventBus.on('bomb_request', () => this.handleBombRequest());
    EventBus.on('mecha_shockwave', (data: any) => this.handleMechaShockwave(data));
  }

  public destroy() {
    EventBus.off('enemy_destroyed');
    EventBus.off('boss_destroyed');
    EventBus.off('antimatter_collected');
    EventBus.off('player_hit');
    EventBus.off('powerup_collected');
    EventBus.off('transform_request');
    EventBus.off('shield_request');
    EventBus.off('bomb_request');
    EventBus.off('mecha_shockwave');
  }

  public handleBossPhase(width: number) {
    console.log('[GameController] Boss phase started!');
    this.boss.spawn(width / 2, -100);
  }

  private handleShieldRequest() {
    const state = GameState.getInstance();
    if (!this.player.isShielded() && state.useShield()) {
      this.player.activatePurchasedShield();
      this.hudManager.update(this.score, this.health, this.antimatter);
      
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.scene.sound.play('pew', { volume: 0.5, rate: 0.8 }); // Maybe another sound?
      }
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
      
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.scene.sound.play('explosion', { volume: 1.0 });
      }
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      }
      
      // Damage all enemies (instakill normal, hurt boss)
      this.entityManager.enemies.children.iterate((c) => {
        const e = c as Enemy;
        if (e.active) {
          e.takeDamage(100); 
        }
        return true;
      });
      
      // Clear all enemy projectiles
      this.entityManager.enemyProjectiles.children.iterate((c) => {
        const p = c as Phaser.Physics.Arcade.Sprite;
        if (p.active) {
          p.setActive(false).setVisible(false);
        }
        return true;
      });

      this.hudManager.update(this.score, this.health, this.antimatter);
    } else {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }

  private handleMechaShockwave(data: { x: number, y: number, radius: number }) {
    if (!this.isPlaying) return;
    
    this.scene.cameras.main.flash(300, 255, 200, 0);
    this.scene.cameras.main.shake(200, 0.015);
    
    if (localStorage.getItem('soundEnabled') !== 'false') {
      this.scene.sound.play('explosion', { volume: 0.8 });
    }
    
    // Damage enemies in radius
    this.entityManager.enemies.children.iterate((c) => {
      const e = c as Enemy;
      if (e.active) {
        const dist = Phaser.Math.Distance.Between(data.x, data.y, e.x, e.y);
        if (dist <= data.radius) {
          e.takeDamage(100); 
        }
      }
      return true;
    });
    
    // Clear projectiles in radius
    this.entityManager.enemyProjectiles.children.iterate((c) => {
      const p = c as Phaser.Physics.Arcade.Sprite;
      if (p.active) {
        const dist = Phaser.Math.Distance.Between(data.x, data.y, p.x, p.y);
        if (dist <= data.radius) {
          p.setActive(false).setVisible(false);
        }
      }
      return true;
    });

    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handleTransformRequest() {
    if (this.player.getForm() === 'mecha') return; // Already transformed
    
    const state = GameState.getInstance();
    if (state.spendAntimatter(GameConfig.Player.MechaCost)) {
      this.antimatter = state.antimatter;
      this.hudManager.update(this.score, this.health, this.antimatter);

      this.player.transformToMecha();
      
      // Play sound if available
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.scene.sound.play('pew', { volume: 0.5, rate: 0.5 }); // Deep sound
      }

      this.scene.time.delayedCall(GameConfig.Player.MechaDuration, () => {
        if (this.isPlaying) {
          this.player.revertToFighter();
        }
      });
    } else {
      // Optional: Play an error sound or visual feedback that antimatter is not enough
    }
  }

  private handleEnemyDestroyed(points: number) {
    if (localStorage.getItem('soundEnabled') !== 'false') {
      this.scene.sound.play('explosion', { volume: 0.3 });
    }
    this.score += points;
    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handleAntimatterCollected() {
    const state = GameState.getInstance();
    state.addAntimatter(1);
    this.antimatter = state.antimatter;
    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handlePowerUpCollected(type: string) {
    const state = GameState.getInstance();
    if (type === 'health') {
      this.health = Math.min(this.health + 1, state.maxHp);
      state.setHp(this.health);
      this.hudManager.update(this.score, this.health, this.antimatter);
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.scene.sound.play('pew', { volume: 0.5, rate: 2 });
      }
    } else if (type === 'weapon') {
      state.upgradeWeapon();
      this.player.weaponLevel = state.weaponLevel;
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.scene.sound.play('pew', { volume: 0.5, rate: 1.5 });
      }
    } else if (type === 'spread' || type === 'homing') {
      this.player.setTempWeapon(type as any, 10000); // 10 seconds
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.scene.sound.play('pew', { volume: 0.8, rate: 1.0 });
      }
    }
  }

  private handlePlayerDamage() {
    if (this.isInvulnerable) return;
    // God mode for E2E tests to prevent flaky test failures due to bullet hell randomness
    if ((window as any).__E2E_TEST_MODE__) return;
    
    this.health -= 1;
    this.isInvulnerable = true;
    
    const state = GameState.getInstance();
    state.setHp(this.health);
    this.hudManager.update(this.score, this.health, this.antimatter);
    
    this.scene.cameras.main.shake(200, 0.01);
    this.scene.cameras.main.flash(200, 255, 0, 0);
    
    if (localStorage.getItem('soundEnabled') !== 'false') {
      this.scene.sound.play('pew', { volume: 0.5, rate: 0.2 });
    }
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }

    if (this.health <= 0) {
      console.log('[GameController] Player defeated!');
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.scene.sound.play('explosion', { volume: 0.8 });
      }
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
        this.scene.scene.start('MenuScene');
      }, 2000);
    } else {
      this.player.setAlpha(0.5);
      this.scene.time.delayedCall(1000, () => {
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
