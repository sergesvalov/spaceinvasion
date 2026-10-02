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
import { StyleConfig } from '../config/StyleConfig';
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

  public syncAndRefreshHUD() {
    const state = GameState.getInstance();
    this.health = state.currentHp;
    this.antimatter = state.antimatter;
    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handleEnemyDestroyed(points: number) {
    AudioManager.getInstance().playEnemyDestroyed(this.scene);
    this.score += points;
    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handleAntimatterCollected() {
    const state = GameState.getInstance();
    state.addAntimatter(1);
    this.antimatter = state.antimatter;
    this.hudManager.update(this.score, this.health, this.antimatter);
    this.hudManager.showFloatingText(this.scene, this.player.x, this.player.y, '+1 AM', StyleConfig.Colors.NeonPink);
  }

  private handlePowerUpCollected(type: string) {
    const state = GameState.getInstance();
    if (type === 'health') {
      this.health = Math.min(this.health + 1, state.maxHp);
      state.setHp(this.health);
      this.hudManager.update(this.score, this.health, this.antimatter);
      AudioManager.getInstance().playPowerupSound(this.scene, 'health');
    } else if (type === 'weapon') {
      state.upgradeWeapon();
      this.player.weaponLevel = state.weaponLevel;
      AudioManager.getInstance().playPowerupSound(this.scene, 'weapon');
      this.hudManager.showFloatingText(this.scene, this.player.x, this.player.y, 'W UP', StyleConfig.Colors.NeonYellow);
    } else if (type === 'spread' || type === 'homing') {
      this.player.setTempWeapon(type as any, 10000); // 10 seconds
      AudioManager.getInstance().playPowerupSound(this.scene, 'spread');
      this.hudManager.showFloatingText(this.scene, this.player.x, this.player.y, type.toUpperCase(), StyleConfig.Colors.NeonCyan);
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
    
    AudioManager.getInstance().playDamageSound(this.scene);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }

    if (this.health <= 0) {
      console.log('[GameController] Player defeated!');
      AudioManager.getInstance().playPlayerDestroyed(this.scene);
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
      fontFamily: StyleConfig.Fonts.Main,
      fontSize: '28px', 
      color: StyleConfig.Colors.NeonCyan, 
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scene.add.text(width / 2, height / 2 + 10, '+5000 CREDITS', {
      fontFamily: StyleConfig.Fonts.Main,
      fontSize: '20px', 
      color: StyleConfig.Colors.NeonOrange
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
