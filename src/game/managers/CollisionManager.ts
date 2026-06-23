import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { BaseProjectile } from '../entities/BaseProjectile';

export interface CollisionCallbacks {
  onEnemyDestroyed: (points: number) => void;
  onBossDestroyed: () => void;
  onPlayerHit: () => void;
  getIsPlaying: () => boolean;
}

export class CollisionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private boss: Boss;
  private projectiles: Phaser.Physics.Arcade.Group;
  private enemies: Phaser.Physics.Arcade.Group;
  private enemyProjectiles: Phaser.Physics.Arcade.Group;
  private callbacks: CollisionCallbacks;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    boss: Boss,
    projectiles: Phaser.Physics.Arcade.Group,
    enemies: Phaser.Physics.Arcade.Group,
    enemyProjectiles: Phaser.Physics.Arcade.Group,
    callbacks: CollisionCallbacks
  ) {
    this.scene = scene;
    this.player = player;
    this.boss = boss;
    this.projectiles = projectiles;
    this.enemies = enemies;
    this.enemyProjectiles = enemyProjectiles;
    this.callbacks = callbacks;
  }

  public setupCollisions() {
    // Player Projectile vs Enemy
    this.scene.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => {
      const p = proj as BaseProjectile;
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
          this.callbacks.onEnemyDestroyed(100);
        }
      }
    });

    // Player Projectile vs Boss
    this.scene.physics.add.overlap(this.projectiles, this.boss, (proj, b) => {
      const p = proj as BaseProjectile;
      const bossObj = b as Boss;
      
      if (p.active && bossObj.active) {
        p.setActive(false);
        p.setVisible(false);
        
        const damage = this.player.getForm() === 'mecha' ? 1.5 : 1;
        const destroyed = bossObj.takeDamage(damage);
        
        if (destroyed) {
          this.createExplosion(bossObj.x, bossObj.y);
          bossObj.setActive(false);
          bossObj.setVisible(false);
          this.callbacks.onBossDestroyed();
        }
      }
    });

    // Enemy Projectile vs Player
    this.scene.physics.add.overlap(this.enemyProjectiles, this.player, (obj1, obj2) => {
      const p = (obj1 === this.player ? obj2 : obj1) as BaseProjectile;
      if (p.active && this.callbacks.getIsPlaying()) {
        p.setActive(false);
        p.setVisible(false);
        this.callbacks.onPlayerHit();
      }
    });

    // Enemy vs Player
    this.scene.physics.add.overlap(this.enemies, this.player, (obj1, obj2) => {
      const e = (obj1 === this.player ? obj2 : obj1) as Enemy;
      if (e.active && this.callbacks.getIsPlaying()) {
        this.createExplosion(e.x, e.y);
        e.setActive(false);
        e.setVisible(false);
        this.callbacks.onPlayerHit();
      }
    });

    // Boss vs Player
    this.scene.physics.add.overlap(this.boss, this.player, (obj1, obj2) => {
      const b = (obj1 === this.player ? obj2 : obj1) as Boss;
      if (b.active && this.callbacks.getIsPlaying()) {
        this.callbacks.onPlayerHit();
      }
    });
  }

  private createExplosion(x: number, y: number) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
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
}
