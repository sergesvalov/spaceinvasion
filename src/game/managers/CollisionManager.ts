import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { BaseProjectile } from '../entities/BaseProjectile';
import { AntimatterContainer } from '../entities/AntimatterContainer';
import { GameConfig } from '../config/GameConfig';
import { EntityManager } from './EntityManager';
import { burst } from '../effects/burst';
import { Projectile } from '../entities/Projectile';
import { PowerUp } from '../entities/PowerUp';

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
    const { projectiles, enemies, aaProjectiles, enemyProjectiles, antimatterContainers, powerUps } = this.entityManager;

    this.scene.physics.add.overlap(projectiles, enemies, this.handlePlayerProjectileVsEnemy.bind(this));
    this.scene.physics.add.overlap(projectiles, this.boss, this.handlePlayerProjectileVsBoss.bind(this));
    this.scene.physics.add.overlap(aaProjectiles, enemies, this.handleAAProjectileVsEnemy.bind(this));
    this.scene.physics.add.overlap(aaProjectiles, this.boss, this.handleAAProjectileVsBoss.bind(this));
    this.scene.physics.add.overlap(enemyProjectiles, this.player, this.handleEnemyProjectileVsPlayer.bind(this));
    this.scene.physics.add.overlap(enemies, this.player, this.handleEnemyVsPlayer.bind(this));
    this.scene.physics.add.overlap(this.boss, this.player, this.handleBossVsPlayer.bind(this));
    this.scene.physics.add.overlap(this.player, antimatterContainers, this.handlePlayerVsAntimatter.bind(this));
    this.scene.physics.add.overlap(this.player, powerUps, this.handlePlayerVsPowerUp.bind(this));
  }

  private handlePlayerProjectileVsEnemy(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const p = obj1 as Projectile;
    const e = obj2 as Enemy;
    
    if (p.active && e.active) {
      if (p.piercing) {
        if (p.hitTargets && p.hitTargets.has(e)) return;
        if (p.hitTargets) p.hitTargets.add(e);
      } else {
        p.setActive(false);
        p.setVisible(false);
      }
      
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
  }

  private handlePlayerProjectileVsBoss(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const p = (obj1 === this.boss ? obj2 : obj1) as Projectile;
    const bossObj = (obj1 === this.boss ? obj1 : obj2) as Boss;
    
    if (p.active && bossObj.active) {
      if (p.piercing) {
        if (p.hitTargets && p.hitTargets.has(bossObj)) return;
        if (p.hitTargets) p.hitTargets.add(bossObj);
      } else {
        p.setActive(false);
        p.setVisible(false);
      }
      
      const destroyed = bossObj.takeDamage(p.damage);
      if (destroyed) {
        for (let i = 0; i < GameConfig.Boss.AntimatterDrops; i++) {
          const container = this.entityManager.getAntimatterContainer();
          if (container) {
            container.spawn(bossObj.x, bossObj.y, Phaser.Math.Between(-100, 100), Phaser.Math.Between(-50, 50));
          }
        }
        EventBus.emit('boss_destroyed');
      }
    }
  }

  private handleAAProjectileVsEnemy(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const p = obj1 as BaseProjectile;
    const e = obj2 as Enemy;
    if (p.active && e.active) {
      p.setActive(false);
      p.setVisible(false);
      if (e.takeDamage(p.damage)) {
        EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points);
      }
    }
  }

  private handleAAProjectileVsBoss(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const p = (obj1 === this.boss ? obj2 : obj1) as BaseProjectile;
    const bossObj = (obj1 === this.boss ? obj1 : obj2) as Boss;
    if (p.active && bossObj.active) {
      p.setActive(false);
      p.setVisible(false);
      if (bossObj.takeDamage(p.damage)) {
        EventBus.emit('boss_destroyed');
      }
    }
  }

  private handleEnemyProjectileVsPlayer(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const p = (obj1 === this.player ? obj2 : obj1) as BaseProjectile;
    if (p.active && this.isPlayingGetter()) {
      p.setActive(false);
      p.setVisible(false);
      this.createExplosion(p.x, p.y);
      if (!this.player.isShielded()) {
        EventBus.emit('player_hit');
      }
    }
  }

  private handleEnemyVsPlayer(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const e = (obj1 === this.player ? obj2 : obj1) as Enemy;
    if (e.active && this.isPlayingGetter()) {
      this.createExplosion(e.x, e.y);
      e.setActive(false);
      e.setVisible(false);
      if (this.player.getForm() === 'mecha') {
        EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points);
      } else if (!this.player.isShielded()) {
        EventBus.emit('player_hit');
      }
    }
  }

  private handleBossVsPlayer(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const b = (obj1 === this.player ? obj2 : obj1) as Boss;
    if (b.active && this.isPlayingGetter() && !this.player.isShielded()) {
      EventBus.emit('player_hit');
    }
  }

  private handlePlayerVsAntimatter(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const container = (obj1 === this.player ? obj2 : obj1) as AntimatterContainer;
    if (container.active && this.isPlayingGetter()) {
      container.setActive(false);
      container.setVisible(false);
      EventBus.emit('antimatter_collected');
    }
  }

  private handlePlayerVsPowerUp(obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile) {
    const powerUp = (obj1 === this.player ? obj2 : obj1) as PowerUp;
    if (powerUp.active && this.isPlayingGetter()) {
      powerUp.setActive(false);
      powerUp.setVisible(false);
      EventBus.emit('powerup_collected', powerUp.type);
    }
  }

  private createExplosion(x: number, y: number) {
    burst(this.scene, x, y, 20, {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300
    });
  }
}
