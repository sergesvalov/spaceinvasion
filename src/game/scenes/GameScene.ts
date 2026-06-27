import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameState } from '../../services/GameState';
import { StoryManager } from '../../services/StoryManager';
import { HUDManager } from '../managers/HUDManager';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { EntitySpawner } from '../managers/EntitySpawner';
import { LevelManager } from '../managers/LevelManager';
import { EntityManager } from '../managers/EntityManager';
import { GameConfig } from '../config/GameConfig';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private boss!: Boss;
  private entityManager!: EntityManager;
  
  private isPlaying: boolean = false;
  private currentLevel: number = 1;
  private isInvulnerable: boolean = false;
  
  private score: number = 0;
  private health: number = 3;
  private antimatter: number = 0;
  
  private hudManager!: HUDManager;
  private inputManager!: InputManager;
  private collisionManager!: CollisionManager;
  private entitySpawner!: EntitySpawner;
  private levelManager!: LevelManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: { level?: number }) {
    this.currentLevel = data?.level || 1;
  }

  create() {
    AnalyticsService.getInstance().levelStart(`level_${this.currentLevel}`);
    
    GameState.getInstance().setHp(GameState.getInstance().maxHp);
    this.health = GameState.getInstance().currentHp;

    this.hudManager = new HUDManager();
    this.hudManager.createHUD(this.health);

    const { width, height } = this.scale;

    this.player = new Player(this, width / 2, height - 100);
    this.entityManager = new EntityManager(this);

    this.inputManager = new InputManager(this, this.player);
    this.inputManager.setupInput();

    this.boss = new Boss(this, width / 2, -200, this.entityManager.enemyProjectiles, (x, y) => {
      const enemy = this.entityManager.getEnemy();
      if (enemy) enemy.spawn(x, y);
    });
    this.boss.setActive(false).setVisible(false);

    this.entitySpawner = new EntitySpawner(this, this.entityManager, this.boss);

    this.collisionManager = new CollisionManager(
      this,
      this.player,
      this.boss,
      this.entityManager,
      () => this.isPlaying
    );
    this.collisionManager.setupCollisions();

    this.setupEvents();

    const levelPhases = (GameConfig.Levels as any)[this.currentLevel] || (GameConfig.Levels as any)[1];

    this.levelManager = new LevelManager(
      this,
      levelPhases,
      () => this.handleBossPhase()
    );
    this.levelManager.setupBackgrounds();

    const storyId = `level_${this.currentLevel}`;
    StoryManager.getInstance().showBriefing(storyId, () => {
      this.isPlaying = true;
      this.inputManager.isActive = true;
      this.hudManager.show();
      this.levelManager.startLevel(this.time.now);
    });
  }

  private setupEvents() {
    this.events.on('enemy_destroyed', (points: number) => this.handleEnemyDestroyed(points));
    this.events.on('boss_destroyed', () => this.handleVictory());
    this.events.on('antimatter_collected', () => this.handleAntimatterCollected());
    this.events.on('player_hit', () => this.handlePlayerDamage());
    this.events.on('powerup_collected', (type: string) => this.handlePowerUpCollected(type));
    this.events.on('transform_request', () => this.handleTransformRequest());
  }

  private handleTransformRequest() {
    if (this.player.getForm() === 'mecha') return; // Already transformed
    
    if (this.antimatter >= 10) {
      this.antimatter -= 10;
      this.hudManager.update(this.score, this.health, this.antimatter);
      
      this.player.transformToMecha();
      
      // Play sound if available
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.sound.play('pew', { volume: 0.5, rate: 0.5 }); // Deep sound
      }

      // Revert after 15 seconds
      this.time.delayedCall(15000, () => {
        if (this.isPlaying) {
          this.player.revertToFighter();
        }
      });
    } else {
      // Optional: Play an error sound or visual feedback that antimatter is not enough
    }
  }

  private handleEnemyDestroyed(points: number) {
    this.score += points;
    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handleAntimatterCollected() {
    this.antimatter += 1;
    this.hudManager.update(this.score, this.health, this.antimatter);
  }

  private handlePowerUpCollected(type: string) {
    const state = GameState.getInstance();
    if (type === 'health') {
      this.health = Math.min(this.health + 1, state.maxHp);
      state.setHp(this.health);
      this.hudManager.update(this.score, this.health, this.antimatter);
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.sound.play('pew', { volume: 0.5, rate: 2 });
      }
    } else if (type === 'weapon') {
      this.player.weaponLevel = Math.min(this.player.weaponLevel + 1, 4);
      if (localStorage.getItem('soundEnabled') !== 'false') {
        this.sound.play('pew', { volume: 0.5, rate: 1.5 });
      }
    }
  }

  private handlePlayerDamage() {
    if (this.isInvulnerable) return;
    this.health -= 1;
    this.isInvulnerable = true;
    
    const state = GameState.getInstance();
    state.setHp(this.health);
    this.hudManager.update(this.score, this.health, this.antimatter);
    
    this.cameras.main.shake(200, 0.01);
    this.cameras.main.flash(200, 255, 0, 0);
    
    if (localStorage.getItem('soundEnabled') !== 'false') {
      this.sound.play('pew', { volume: 0.5, rate: 0.2 });
    }
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }

    if (this.health <= 0) {
      this.isPlaying = false;
      this.inputManager.isActive = false;
      this.player.explode();

      AnalyticsService.getInstance().playerDeath(this.player.x, this.player.y);
      AnalyticsService.getInstance().levelFail(`level_${this.currentLevel}`, 'no_health');
      
      state.addCredits(this.score);
      state.setHp(state.maxHp);
      
      setTimeout(() => {
        this.destroyScene();
        this.scene.start('GameOverScene');
      }, 2000);
    } else {
      this.player.setAlpha(0.5);
      this.time.delayedCall(1000, () => {
        if (this.isPlaying) {
          this.player.setAlpha(1);
        }
        this.isInvulnerable = false;
      });
    }
  }

  private handleBossPhase() {
    this.boss.spawn(this.scale.width / 2, -100);
  }

  private handleVictory() {
    this.isPlaying = false;
    this.inputManager.isActive = false;
    
    this.entityManager.enemies.children.iterate((c) => {
      const e = c as Enemy;
      if (e.active) {
        const emitter = this.add.particles(e.x, e.y, 'particle', {
          speed: { min: 50, max: 200 }, scale: { start: 1, end: 0 }, lifespan: 300, quantity: 20
        });
        emitter.explode(20);
        e.setActive(false).setVisible(false);
      }
      return true;
    });

    const state = GameState.getInstance();
    state.addCredits(this.score + 5000); 

    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 50, 'MISSION ACCOMPLISHED', {
      fontSize: '28px', color: '#00ffcc', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, '+5000 CREDITS', {
      fontSize: '20px', color: '#ffaa00'
    }).setOrigin(0.5);

    setTimeout(() => {
      this.destroyScene();
      if (this.currentLevel === 1) {
        StoryManager.getInstance().showBriefing('level_1_victory', () => {
          this.scene.start('GameScene', { level: 2 });
        });
      } else {
        this.scene.start('MenuScene');
      }
    }, 4000);
  }

  private destroyScene() {
    this.hudManager.destroy();
    this.events.off('enemy_destroyed');
    this.events.off('boss_destroyed');
    this.events.off('antimatter_collected');
    this.events.off('player_hit');
    this.events.off('powerup_collected');
  }

  update(time: number, delta: number) {
    this.levelManager.update(time, delta);

    if (!this.isPlaying) return;

    if (this.player.canFire(time)) {
      this.player.fire(this.entityManager);
    }

    if (this.levelManager.getCurrentPhaseKey() === 'bg_city') {
      this.entitySpawner.spawnAAGun(time);
    }

    const modifier = this.levelManager.getCurrentSpawnModifier();
    this.entitySpawner.update(time, this.isPlaying, modifier);
  }
}
