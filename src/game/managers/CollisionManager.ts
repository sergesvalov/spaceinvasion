import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { BaseProjectile } from '../entities/BaseProjectile';
import { AntimatterContainer } from '../entities/AntimatterContainer';
import { GameConfig } from '../config/GameConfig';
import { EntityManager } from './EntityManager';

export class CollisionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private boss: Boss;
  private entityManager: EntityManager;
  private isPlayingGetter: () => boolean;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    boss: Boss,
    entityManager: EntityManager,
    isPlayingGetter: () => boolean
  ) {
    this.scene = scene;
    this.player = player;
    this.boss = boss;
    this.entityManager = entityManager;
    this.isPlayingGetter = isPlayingGetter;
  }

  public setupCollisions() {
    const { projectiles, enemies, aaProjectiles, enemyProjectiles, antimatterContainers } = this.entityManager;

    // Player Projectile vs Enemy
    this.scene.physics.add.overlap(projectiles, enemies, (proj, enemy) => {
      const p = proj as BaseProjectile;
      const e = enemy as Enemy;
      
      if (p.active && e.active) {
        p.setActive(false);
        p.setVisible(false);
        
        const destroyed = e.takeDamage(p.damage);
        
        if (destroyed) {
          EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points);

          if (Phaser.Math.FloatBetween(0, 1) <= GameConfig.Enemy.AntimatterDropChance) {
            const container = this.entityManager.getAntimatterContainer();
            if (container) {
              container.spawn(e.x, e.y, Phaser.Math.Between(-20, 20), Phaser.Math.Between(30, 70));
            }
          }
        }
      }
    });

    // Player Projectile vs Boss
    this.scene.physics.add.overlap(projectiles, this.boss, (obj1, obj2) => {
      const p = (obj1 === this.boss ? obj2 : obj1) as BaseProjectile;
      const bossObj = (obj1 === this.boss ? obj1 : obj2) as Boss;
      
      if (p.active && bossObj.active) {
        p.setActive(false);
        p.setVisible(false);
        
        const destroyed = bossObj.takeDamage(p.damage);
        
        if (destroyed) {
          for (let i = 0; i < GameConfig.Boss.AntimatterDrops; i++) {
            const container = this.entityManager.getAntimatterContainer();
            if (container) {
              const vx = Phaser.Math.Between(-100, 100);
              const vy = Phaser.Math.Between(-50, 50);
              container.spawn(bossObj.x, bossObj.y, vx, vy);
            }
          }

          EventBus.emit('boss_destroyed');
        }
      }
    });

    // AA Projectile vs Enemy
    this.scene.physics.add.overlap(aaProjectiles, enemies, (proj, enemy) => {
      const p = proj as BaseProjectile;
      const e = enemy as Enemy;
      if (p.active && e.active) {
        p.setActive(false);
        p.setVisible(false);
        const destroyed = e.takeDamage(p.damage);
        if (destroyed) {
          EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points);
        }
      }
    });

    // AA Projectile vs Boss
    this.scene.physics.add.overlap(aaProjectiles, this.boss, (obj1, obj2) => {
      const p = (obj1 === this.boss ? obj2 : obj1) as BaseProjectile;
      const bossObj = (obj1 === this.boss ? obj1 : obj2) as Boss;
      if (p.active && bossObj.active) {
        p.setActive(false);
        p.setVisible(false);
        const destroyed = bossObj.takeDamage(p.damage);
        if (destroyed) {
          EventBus.emit('boss_destroyed');
        }
      }
    });

    // Enemy Projectile vs Player
    this.scene.physics.add.overlap(enemyProjectiles, this.player, (obj1, obj2) => {
      const p = (obj1 === this.player ? obj2 : obj1) as BaseProjectile;
      if (p.active && this.isPlayingGetter()) {
        p.setActive(false);
        p.setVisible(false);
        this.createExplosion(p.x, p.y);
        
        if (this.player.getForm() !== 'mecha') {
          EventBus.emit('player_hit');
        }
      }
    });

    // Enemy vs Player
    this.scene.physics.add.overlap(enemies, this.player, (obj1, obj2) => {
      const e = (obj1 === this.player ? obj2 : obj1) as Enemy;
      if (e.active && this.isPlayingGetter()) {
        this.createExplosion(e.x, e.y);
        e.setActive(false);
        e.setVisible(false);
        
        if (this.player.getForm() === 'mecha') {
          EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points);
        } else {
          EventBus.emit('player_hit');
        }
      }
    });

    // Boss vs Player
    this.scene.physics.add.overlap(this.boss, this.player, (obj1, obj2) => {
      const b = (obj1 === this.player ? obj2 : obj1) as Boss;
      if (b.active && this.isPlayingGetter()) {
        if (this.player.getForm() !== 'mecha') {
          EventBus.emit('player_hit');
        }
      }
    });

    // Player vs AntimatterContainer
    this.scene.physics.add.overlap(this.player, antimatterContainers, (obj1, obj2) => {
      const container = (obj1 === this.player ? obj2 : obj1) as AntimatterContainer;
      if (container.active && this.isPlayingGetter()) {
        container.setActive(false);
        container.setVisible(false);
        EventBus.emit('antimatter_collected');
      }
    });

    // Player vs PowerUp
    this.scene.physics.add.overlap(this.player, this.entityManager.powerUps, (obj1, obj2) => {
      const powerUp = (obj1 === this.player ? obj2 : obj1) as any;
      if (powerUp.active && this.isPlayingGetter()) {
        powerUp.setActive(false);
        powerUp.setVisible(false);
        EventBus.emit('powerup_collected', powerUp.type);
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
    emitter.explode(20);
  }
}
