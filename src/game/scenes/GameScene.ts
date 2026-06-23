import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { EnemyProjectile } from '../entities/EnemyProjectile';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameState } from '../../services/GameState';
import { StoryManager } from '../../services/StoryManager';
import { HUDManager } from '../managers/HUDManager';
import { InputManager } from '../managers/InputManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private background!: Phaser.GameObjects.TileSprite;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyProjectiles!: Phaser.Physics.Arcade.Group;
  
  private lastEnemySpawn: number = 0;
  private isPlaying: boolean = false;
  
  private score: number = 0;
  private health: number = 3;
  
  private score: number = 0;
  private health: number = 3;
  
  private hudManager!: HUDManager;
  private inputManager!: InputManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    AnalyticsService.getInstance().levelStart('level_1');
    
    // Initialize health from state
    this.health = GameState.getInstance().currentHp;

    // Create Managers
    this.hudManager = new HUDManager();
    this.hudManager.createHUD(this.health);

    const { width, height } = this.scale;

    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'starfield');

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

    this.inputManager = new InputManager(this, this.player);
    this.inputManager.setupInput();

    this.setupCollisions();

    // Start briefing
    StoryManager.getInstance().showBriefing('level_1', () => {
      this.isPlaying = true;
      this.inputManager.isActive = true;
      this.hudManager.show();
    });
  }



  private setupCollisions() {
    // Player Projectile vs Enemy
    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => {
      const p = proj as Projectile;
      const e = enemy as Enemy;
      
      if (p.active && e.active) {
        p.setActive(false);
        p.setVisible(false);
        
        // Damage multiplier based on form? Mecha deals more damage
        const damage = this.player.getForm() === 'mecha' ? 1.5 : 1;
        const destroyed = e.takeDamage(damage);
        
        if (destroyed) {
          this.createExplosion(e.x, e.y);
          e.setActive(false);
          e.setVisible(false);
          this.score += 100;
          this.hudManager.update(this.score, this.health);
        }
      }
    });

    // Enemy Projectile vs Player
    this.physics.add.overlap(this.enemyProjectiles, this.player, (obj1, obj2) => {
      const p = (obj1 === this.player ? obj2 : obj1) as EnemyProjectile;
      if (p.active && this.isPlaying) {
        p.setActive(false);
        p.setVisible(false);
        this.playerTakeDamage();
      }
    });

    // Enemy vs Player
    this.physics.add.overlap(this.enemies, this.player, (obj1, obj2) => {
      const e = (obj1 === this.player ? obj2 : obj1) as Enemy;
      if (e.active && this.isPlaying) {
        this.createExplosion(e.x, e.y);
        e.setActive(false);
        e.setVisible(false);
        this.playerTakeDamage();
      }
    });
  }

  private playerTakeDamage() {
    this.health -= 1;
    
    const state = GameState.getInstance();
    state.setHp(this.health);

    this.hudManager.update(this.score, this.health);
    
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
      state.setHp(1); // Regenerate with 1 HP
      
      // Go back to Menu
      setTimeout(() => {
        this.hudManager.destroy();
        this.scene.start('MenuScene');
      }, 2000);
    }
  }

  private createExplosion(x: number, y: number) {
    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      quantity: 20
    });
    // Emitter self-destroys after playing once
    emitter.explode(20);
  }

  update(time: number, delta: number) {
    this.background.tilePositionY -= 0.5 * delta;

    if (!this.isPlaying) return;

    if (this.player.canFire(time)) {
      this.fireProjectile();
    }

    // Spawn enemies
    if (time > this.lastEnemySpawn + 2000) {
      this.lastEnemySpawn = time;
      const enemy = this.enemies.get() as Enemy;
      if (enemy) {
        const startX = Phaser.Math.Between(50, this.scale.width - 50);
        enemy.spawn(startX, -50);
      }
    }

    // Enemy firing
    this.enemies.children.iterate((child) => {
      const enemy = child as Enemy;
      if (enemy.active && enemy.canFire(time) && enemy.y > 0) {
        const ep = this.enemyProjectiles.get() as EnemyProjectile;
        if (ep) {
          ep.fire(enemy.x, enemy.y + 20, 300);
        }
      }
      return true;
    });
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
