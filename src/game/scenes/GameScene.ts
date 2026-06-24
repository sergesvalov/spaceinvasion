import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { EnemyProjectile } from '../entities/EnemyProjectile';
import { Boss } from '../entities/Boss';
import { AntimatterContainer } from '../entities/AntimatterContainer';
import { AAGun } from '../entities/AAGun';
import { AAGunProjectile } from '../entities/AAGunProjectile';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameState } from '../../services/GameState';
import { StoryManager } from '../../services/StoryManager';
import { HUDManager } from '../managers/HUDManager';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { EnemySpawner } from '../managers/EnemySpawner';
import { LevelManager } from '../managers/LevelManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyProjectiles!: Phaser.Physics.Arcade.Group;
  private antimatterContainers!: Phaser.Physics.Arcade.Group;
  private aaProjectiles!: Phaser.Physics.Arcade.Group;
  private aaGuns!: Phaser.Physics.Arcade.Group;
  private boss!: Boss;
  
  private isPlaying: boolean = false;
  private lastAAGunSpawnTime: number = 0;
  
  private score: number = 0;
  private health: number = 3;
  private antimatter: number = 0;
  
  private hudManager!: HUDManager;
  private inputManager!: InputManager;
  private collisionManager!: CollisionManager;
  private enemySpawner!: EnemySpawner;
  private levelManager!: LevelManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    AnalyticsService.getInstance().levelStart('level_1');
    
    // Always ensure player starts with maximum health for the level
    GameState.getInstance().setHp(GameState.getInstance().maxHp);
    this.health = GameState.getInstance().currentHp;

    // Create Managers
    this.hudManager = new HUDManager();
    this.hudManager.createHUD(this.health);

    const { width, height } = this.scale;

    this.player = new Player(this, width / 2, height - 100);

    this.projectiles = this.physics.add.group({
      classType: Projectile,
      maxSize: 50,
      runChildUpdate: true
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
      maxSize: 20,
      runChildUpdate: true
    });

    this.enemyProjectiles = this.physics.add.group({
      classType: EnemyProjectile,
      maxSize: 50,
      runChildUpdate: true
    });

    this.antimatterContainers = this.physics.add.group({
      classType: AntimatterContainer,
      maxSize: 50,
      runChildUpdate: true
    });

    this.aaProjectiles = this.physics.add.group({
      classType: AAGunProjectile,
      maxSize: 100,
      runChildUpdate: true
    });

    this.aaGuns = this.physics.add.group({
      classType: AAGun,
      maxSize: 10,
      runChildUpdate: true
    });

    this.inputManager = new InputManager(this, this.player);
    this.inputManager.setupInput();

    this.enemySpawner = new EnemySpawner(this, this.enemies, this.enemyProjectiles);

    this.boss = new Boss(this, width / 2, -200, this.enemyProjectiles, (x, y) => {
      const enemy = this.enemies.get() as Enemy;
      if (enemy) enemy.spawn(x, y);
    });
    this.boss.setActive(false).setVisible(false);

    this.collisionManager = new CollisionManager(
      this,
      this.player,
      this.boss,
      this.projectiles,
      this.aaProjectiles,
      this.enemies,
      this.enemyProjectiles,
      this.antimatterContainers,
      {
        onEnemyDestroyed: (points) => {
          this.score += points;
          this.hudManager.update(this.score, this.health, this.antimatter);
        },
        onBossDestroyed: () => this.handleVictory(),
        onAntimatterCollected: () => {
          this.antimatter += 1;
          this.hudManager.update(this.score, this.health, this.antimatter);
        },
        onPlayerHit: () => this.handlePlayerDamage(),
        getIsPlaying: () => this.isPlaying
      }
    );
    this.collisionManager.setupCollisions();

    // Setup Level Progression
    this.levelManager = new LevelManager(
      this,
      [
        { textureKey: 'bg_city', duration: 20000, spawnRateModifier: 1.0 },
        { textureKey: 'bg_suburbs', duration: 20000, spawnRateModifier: 0.8 },
        { textureKey: 'bg_mountains', duration: 20000, spawnRateModifier: 0.5 }
      ],
      () => this.handleBossPhase()
    );
    this.levelManager.setupBackgrounds();

    // Start briefing
    StoryManager.getInstance().showBriefing('level_1', () => {
      this.isPlaying = true;
      this.inputManager.isActive = true;
      this.hudManager.show();
      this.levelManager.startLevel(this.time.now);
    });
  }

  private handlePlayerDamage() {
    this.health -= 1;
    
    const state = GameState.getInstance();
    state.setHp(this.health);

    this.hudManager.update(this.score, this.health, this.antimatter);
    
    // Camera shake
    this.cameras.main.shake(200, 0.01);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
    }

    if (this.health <= 0) {
      this.isPlaying = false;
      this.inputManager.isActive = false;
      AnalyticsService.getInstance().playerDeath(this.player.x, this.player.y);
      AnalyticsService.getInstance().levelFail('level_1', 'no_health');
      
      // Reward credits and duct-tape repair
      state.addCredits(this.score);
      state.setHp(state.maxHp); // Regenerate with full HP
      
      // Go back to Menu
      setTimeout(() => {
        this.hudManager.destroy();
        this.scene.start('MenuScene');
      }, 2000);
    }
  }

  private handleBossPhase() {
    this.boss.spawn(this.scale.width / 2, -100);
  }

  private handleVictory() {
    this.isPlaying = false;
    this.inputManager.isActive = false;
    
    // Destroy all enemies
    this.enemies.children.iterate((c) => {
      const e = c as Enemy;
      if (e.active) {
        // Create explosion
        const emitter = this.add.particles(e.x, e.y, 'particle', {
          speed: { min: 50, max: 200 }, scale: { start: 1, end: 0 }, lifespan: 300, quantity: 20
        });
        emitter.explode(20);
        e.setActive(false).setVisible(false);
      }
      return true;
    });

    const state = GameState.getInstance();
    // Huge bonus for completing the level
    state.addCredits(this.score + 5000); 

    // Show Victory Text
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 50, 'MISSION ACCOMPLISHED', {
      fontSize: '28px', color: '#00ffcc', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, '+5000 CREDITS', {
      fontSize: '20px', color: '#ffaa00'
    }).setOrigin(0.5);

    setTimeout(() => {
      this.hudManager.destroy();
      this.scene.start('MenuScene');
    }, 4000);
  }

  update(time: number, delta: number) {
    this.levelManager.update(time, delta);

    if (!this.isPlaying) return;

    if (this.player.canFire(time)) {
      this.fireProjectile();
    }

    // Spawn AA Guns in City phase
    if (this.levelManager.getCurrentPhaseKey() === 'bg_city') {
      if (time > this.lastAAGunSpawnTime + 10000) {
        this.lastAAGunSpawnTime = time;
        this.spawnAAGun();
      }
    }

    const modifier = this.levelManager.getCurrentSpawnModifier();
    this.enemySpawner.update(time, this.isPlaying, modifier);
  }

  private spawnAAGun() {
    const gun = this.aaGuns.get() as AAGun;
    if (gun) {
      // It needs references before it can shoot
      gun.setReferences(this.enemies, this.boss, this.aaProjectiles);
      // Spawn slightly offscreen top
      const x = Phaser.Math.Between(100, this.scale.width - 100);
      gun.spawn(x, -100, 500); // 500 is matching background scroll speed
    }
  }

  private fireProjectile() {
    if (localStorage.getItem('soundEnabled') !== 'false') {
      this.sound.play('pew', { volume: 0.3 });
    }

    const isMecha = this.player.getForm() === 'mecha';
    if (isMecha) {
      const proj1 = this.projectiles.get() as Projectile;
      const proj2 = this.projectiles.get() as Projectile;
      if (proj1) proj1.fire(this.player.x - 10, this.player.y, -400);
      if (proj2) proj2.fire(this.player.x + 10, this.player.y, -400);
    } else {
      const proj = this.projectiles.get() as Projectile;
      if (proj) proj.fire(this.player.x, this.player.y - 20, -600);
    }
  }
}
