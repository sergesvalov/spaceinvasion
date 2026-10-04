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
import { AchievementManager } from '../../services/AchievementManager';

import { DamageManager } from './DamageManager';
import { ScoreManager } from './ScoreManager';

export class GameController {
  private isPlaying: boolean = false;

  private damageManager: DamageManager;
  private scoreManager: ScoreManager;

  constructor(
    private scene: Phaser.Scene,
    private player: Player,
    private boss: Boss,
    private entityManager: EntityManager,
    private hudManager: HUDManager,
    private inputManager: InputManager,
    private currentLevel: number,
  ) {
    this.damageManager = new DamageManager(
      scene,
      player,
      () => this.handlePlayerDeath(),
      (newHealth) =>
        this.hudManager.update(this.scoreManager.score, newHealth, this.scoreManager.antimatter),
    );

    this.scoreManager = new ScoreManager(scene, (score, health, antimatter) => {
      this.hudManager.update(score, health, antimatter);
      AchievementManager.getInstance().checkScoreAchievements(score);
    });

    AchievementManager.getInstance().onAchievementUnlocked((title, desc) => {
      this.hudManager.showAchievement(title, desc);
    });
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setIsPlaying(playing: boolean) {
    this.isPlaying = playing;
  }

  public getScore(): number {
    return this.scoreManager.score;
  }

  public getDDAModifier(time: number): number {
    return this.damageManager.getDDAModifier(time, this.scoreManager.score);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private boundHandlers: Record<string, (...args: any[]) => void> = {};

  public setupEvents() {
    this.boundHandlers['enemy_destroyed'] = (points: number) => this.handleEnemyDestroyed(points);
    this.boundHandlers['boss_destroyed'] = () => this.handleVictory();
    this.boundHandlers['antimatter_collected'] = () => this.handleAntimatterCollected();
    this.boundHandlers['spawn_antimatter'] = (x: number, y: number, vx: number, vy: number) =>
      this.handleSpawnAntimatter(x, y, vx, vy);
    this.boundHandlers['enemy_fire'] = (x: number, y: number, speed: number) =>
      this.handleEnemyFire(x, y, speed);
    this.boundHandlers['player_hit'] = () => this.handlePlayerDamage();
    this.boundHandlers['powerup_collected'] = (type: string) => this.handlePowerUpCollected(type);
    this.boundHandlers['spawn_powerup'] = (x: number, y: number, type: string) =>
      this.handleSpawnPowerup(x, y, type);

    Object.entries(this.boundHandlers).forEach(([event, handler]) => {
      EventBus.on(event as any, handler as any, this);
    });
  }

  public destroy() {
    Object.entries(this.boundHandlers).forEach(([event, handler]) => {
      EventBus.off(event as any, handler as any, this);
    });
    this.boundHandlers = {};
  }

  public handleBossPhase(width: number) {
    console.log('[GameController] Boss phase started!');
    this.hudManager.showFloatingText(
      this.scene,
      width / 2,
      this.scene.scale.height / 2 - 50,
      'WARNING\nBOSS APPROACHING',
      '#ff0000',
      3000,
      1.5,
    );
    this.scene.cameras.main.flash(500, 255, 0, 0);

    this.scene.time.delayedCall(3000, () => {
      if (!this.isPlaying) return;
      this.boss.spawn(width / 2, -100);
      this.hudManager.showBossBar();
      this.hudManager.updateBossBar(this.boss.hp, GameConfig.Boss.HP);
    });
  }

  public updateBossHUD() {
    if (this.boss.active) {
      this.hudManager.updateBossBar(this.boss.hp, GameConfig.Boss.HP);
    }
  }

  public syncAndRefreshHUD() {
    this.damageManager.syncHealth();
    this.scoreManager.syncAntimatter();
    this.hudManager.update(
      this.scoreManager.score,
      this.damageManager.health,
      this.scoreManager.antimatter,
    );
  }

  private handleEnemyDestroyed(points: number) {
    this.scoreManager.addScore(points, this.damageManager.health, (text, color) =>
      this.hudManager.showFloatingText(
        this.scene,
        this.player.x,
        this.player.y - 30,
        text,
        color,
        1500,
        1.2,
      ),
    );

    // Hit-stop on large enemies
    if (points >= GameConfig.Enemy.Points * 2) {
      this.scene.scene.pause();
      setTimeout(() => {
        if (this.isPlaying) this.scene.scene.resume();
      }, 40);
    }
  }

  private handleAntimatterCollected() {
    this.scoreManager.addAntimatter(1, this.damageManager.health, (text, color) =>
      this.hudManager.showFloatingText(this.scene, this.player.x, this.player.y, text, color),
    );
  }

  private handleSpawnAntimatter(x: number, y: number, vx: number, vy: number) {
    const container = this.entityManager.getAntimatterContainer();
    if (container) {
      container.spawn(x, y, vx, vy);
    }
  }

  private handleEnemyFire(x: number, y: number, speed: number) {
    if (!this.isPlaying) return;
    const ep = this.entityManager.getEnemyProjectile();
    if (ep) {
      ep.fire(x, y, speed);
    }
  }

  private handlePowerUpCollected(type: string) {
    const state = GameState.getInstance();
    if (type === 'health') {
      const newHealth = Math.min(this.damageManager.health + 1, state.maxHp);
      state.setHp(newHealth);
      this.damageManager.syncHealth();
      this.hudManager.update(
        this.scoreManager.score,
        this.damageManager.health,
        this.scoreManager.antimatter,
      );
      AudioManager.getInstance().playPowerupSound(this.scene, 'health');
    } else if (type === 'weapon') {
      state.upgradeWeapon();
      this.player.weaponLevel = state.weaponLevel;
      AudioManager.getInstance().playPowerupSound(this.scene, 'weapon');
      this.hudManager.showFloatingText(
        this.scene,
        this.player.x,
        this.player.y,
        'W UP',
        StyleConfig.Colors.NeonYellow,
      );
    } else if (type === 'spread' || type === 'homing') {
      this.player.setTempWeapon(type as any, 10000); // 10 seconds
      AudioManager.getInstance().playPowerupSound(this.scene, 'spread');
      this.hudManager.showFloatingText(
        this.scene,
        this.player.x,
        this.player.y,
        type.toUpperCase(),
        StyleConfig.Colors.NeonCyan,
      );
    }
  }

  private handlePlayerDamage() {
    this.scoreManager.resetChain();
    this.damageManager.handlePlayerDamage(this.scene.time.now);
  }

  private handleSpawnPowerup(x: number, y: number, type: string) {
    if (!this.isPlaying) return;
    const powerUp = this.entityManager.getPowerUp();
    if (powerUp) {
      powerUp.spawn(x, y, type as any);
    }
  }

  private handlePlayerDeath() {
    console.log('[GameController] Player defeated!');
    AudioManager.getInstance().playPlayerDestroyed(this.scene);
    this.isPlaying = false;
    this.inputManager.isActive = false;
    (window as any).__GAME_RESULT__ = 'DEFEAT';
    this.player.explode();

    AnalyticsService.getInstance().playerDeath(this.player.x, this.player.y);
    AnalyticsService.getInstance().levelFail(`level_${this.currentLevel}`, 'no_health');

    const state = GameState.getInstance();
    state.addCredits(this.scoreManager.score);
    // Hand back a barely-flyable hull instead of a free full repair: the
    // Garage is what restores HP. 1 HP guarantees the player is never stuck.
    state.setHp(1);

    this.scene.time.delayedCall(2000, () => {
      this.hudManager.destroy();
      this.destroy();
      this.scene.scene.start('DefeatScene', {
        score: this.scoreManager.score,
        level: this.currentLevel,
      });
    });
  }

  private handleVictory() {
    console.log('[GameController] Boss destroyed! VICTORY!');
    this.isPlaying = false;
    this.inputManager.isActive = false;
    (window as any).__GAME_RESULT__ = 'VICTORY';

    this.scene.cameras.main.shake(1500, 0.02);

    AnalyticsService.getInstance().levelComplete(`level_${this.currentLevel}`);
    AchievementManager.getInstance().checkBossDefeat();

    this.hudManager.hideBossBar();

    this.entityManager.enemies.children.iterate((c) => {
      const e = c as Enemy;
      if (e.active) {
        burst(this.scene, e.x, e.y, 20, {
          speed: { min: 50, max: 200 },
          scale: { start: 1, end: 0 },
          lifespan: 300,
        });
        e.setActive(false).setVisible(false);
      }
      return true;
    });

    const state = GameState.getInstance();
    state.addCredits(this.scoreManager.score + 5000);
    state.updateHiScore(this.scoreManager.score);

    const score = this.scoreManager.score;
    let rank = 'C';
    if (score >= 15000) rank = 'S';
    else if (score >= 10000) rank = 'A';
    else if (score >= 5000) rank = 'B';

    const { width, height } = this.scene.scale;

    // Dim background
    const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    bg.setDepth(999);

    this.scene.add
      .text(width / 2, height / 2 - 80, 'MISSION CLEARED', {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '24px',
        color: StyleConfig.Colors.NeonCyan,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.add
      .text(width / 2, height / 2 - 20, `SCORE: ${score}`, {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.add
      .text(width / 2, height / 2 + 10, `HI-SCORE: ${state.hiScore}`, {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '16px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.add
      .text(width / 2, height / 2 + 50, `RANK: ${rank}`, {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '32px',
        color: rank === 'S' ? StyleConfig.Colors.NeonPink : StyleConfig.Colors.NeonOrange,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(1000);

    // Blinking "CLICK TO CONTINUE"
    const continueText = this.scene.add
      .text(width / 2, height - 50, 'TAP TO CONTINUE', {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: continueText,
      alpha: 0,
      yoyo: true,
      repeat: -1,
      duration: 500,
    });

    this.scene.time.delayedCall(1000, () => {
      const proceed = () => {
        this.hudManager.destroy();
        this.destroy();
        if (this.currentLevel < 3) {
          StoryManager.getInstance().showBriefing(`level_${this.currentLevel}_victory`, () => {
            this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
            this.scene.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.scene.start('MapScene', { level: this.currentLevel + 1 });
            });
          });
        } else {
          StoryManager.getInstance().showBriefing(`level_3_victory`, () => {
            this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
            this.scene.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.scene.start('MenuScene'); // End of game
            });
          });
        }
      };

      const w = window as any;
      if (w.__E2E_TEST_MODE__ || w.__AI_DEMO_MODE__) {
        this.scene.time.delayedCall(500, proceed);
      } else {
        this.scene.input.once('pointerdown', proceed);
      }
    });
  }
}
