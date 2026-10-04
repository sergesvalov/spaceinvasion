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
    isPlayingGetter: () => boolean,
  ) {
    this.scene = scene;
    this.player = player;
    this.boss = boss;
    this.entityManager = entityManager;
    this.isPlayingGetter = isPlayingGetter;
  }

  public setupCollisions() {
    const {
      projectiles,
      enemies,
      oceanEnemies,
      alienAAGuns,
      aaProjectiles,
      enemyProjectiles,
      antimatterContainers,
      powerUps,
      bossParts,
    } = this.entityManager;

    this.scene.physics.add.overlap(
      projectiles.getGroup(),
      enemies.getGroup(),
      this.handlePlayerProjectileVsDamageable.bind(this),
    );
    this.scene.physics.add.overlap(
      projectiles.getGroup(),
      oceanEnemies.getGroup(),
      this.handlePlayerProjectileVsDamageable.bind(this),
    );
    this.scene.physics.add.overlap(
      projectiles.getGroup(),
      alienAAGuns.getGroup(),
      this.handlePlayerProjectileVsDamageable.bind(this),
    );
    this.scene.physics.add.overlap(
      projectiles.getGroup(),
      bossParts.getGroup(),
      this.handlePlayerProjectileVsDamageable.bind(this),
    );
    this.scene.physics.add.overlap(
      projectiles.getGroup(),
      this.boss,
      this.handlePlayerProjectileVsDamageable.bind(this),
    );

    this.scene.physics.add.overlap(
      aaProjectiles.getGroup(),
      enemies.getGroup(),
      this.handleAAProjectileVsDamageable.bind(this),
    );
    this.scene.physics.add.overlap(
      aaProjectiles.getGroup(),
      oceanEnemies.getGroup(),
      this.handleAAProjectileVsDamageable.bind(this),
    );
    this.scene.physics.add.overlap(
      aaProjectiles.getGroup(),
      alienAAGuns.getGroup(),
      this.handleAAProjectileVsDamageable.bind(this),
    );
    this.scene.physics.add.overlap(
      aaProjectiles.getGroup(),
      this.boss,
      this.handleAAProjectileVsDamageable.bind(this),
    );

    this.scene.physics.add.overlap(
      enemyProjectiles.getGroup(),
      this.player,
      this.handleEnemyProjectileVsPlayer.bind(this),
    );
    this.scene.physics.add.overlap(
      enemies.getGroup(),
      this.player,
      this.handleEnemyVsPlayer.bind(this),
    );
    this.scene.physics.add.overlap(
      oceanEnemies.getGroup(),
      this.player,
      this.handleOceanEnemyVsPlayer.bind(this),
    );
    this.scene.physics.add.overlap(
      alienAAGuns.getGroup(),
      this.player,
      this.handleAlienAAGunVsPlayer.bind(this),
    );
    this.scene.physics.add.overlap(
      bossParts.getGroup(),
      this.player,
      this.handleEnemyVsPlayer.bind(this),
    );
    this.scene.physics.add.overlap(this.boss, this.player, this.handleBossVsPlayer.bind(this));
    this.scene.physics.add.overlap(
      this.player,
      antimatterContainers.getGroup(),
      this.handlePlayerVsAntimatter.bind(this),
    );
    this.scene.physics.add.overlap(
      this.player,
      powerUps.getGroup(),
      this.handlePlayerVsPowerUp.bind(this),
    );
  }

  private handlePlayerProjectileVsDamageable(obj1: any, obj2: any) {
    const p = (obj1 instanceof Projectile ? obj1 : obj2) as Projectile;
    const target = (
      obj1 instanceof Projectile ? obj2 : obj1
    ) as import('../entities/BaseEntity').BaseEntity;

    if (p.active && target.active) {
      if (p.piercing) {
        if (p.hitTargets && p.hitTargets.has(target)) return;
        if (p.hitTargets) p.hitTargets.add(target);
      } else {
        p.setActive(false);
        p.setVisible(false);
        burst(this.scene, p.x, p.y, p.damage > 2 ? 10 : 5, {
          scale: { start: p.damage > 2 ? 0.8 : 0.5, end: 0 },
          lifespan: p.damage > 2 ? 300 : 200,
          speed: { min: 50, max: 200 },
          tint: 0x00ffff,
        });
      }

      target.takeDamage(p.damage);
    }
  }

  private handleAAProjectileVsDamageable(obj1: any, obj2: any) {
    const p = (obj1 instanceof BaseProjectile ? obj1 : obj2) as BaseProjectile;
    const target = (
      obj1 instanceof BaseProjectile ? obj2 : obj1
    ) as import('../entities/BaseEntity').BaseEntity;

    if (p.active && target.active) {
      p.setActive(false);
      p.setVisible(false);
      target.takeDamage(p.damage);
    }
  }

  private handleEnemyProjectileVsPlayer(obj1: any, obj2: any) {
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

  private handleEnemyVsPlayer(obj1: any, obj2: any) {
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

  private handleOceanEnemyVsPlayer(obj1: any, obj2: any) {
    const e = (obj1 === this.player ? obj2 : obj1) as import('../entities/OceanEnemy').OceanEnemy;
    if (e.active && this.isPlayingGetter()) {
      this.createExplosion(e.x, e.y);
      e.setActive(false);
      e.setVisible(false);
      if (this.player.getForm() === 'mecha') {
        EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points * 2);
      } else if (!this.player.isShielded()) {
        EventBus.emit('player_hit');
      }
    }
  }

  private handleAlienAAGunVsPlayer(obj1: any, obj2: any) {
    const e = (obj1 === this.player ? obj2 : obj1) as import('../entities/AlienAAGun').AlienAAGun;
    if (e.active && this.isPlayingGetter()) {
      this.createExplosion(e.x, e.y);
      e.setActive(false);
      e.setVisible(false);
      if (this.player.getForm() === 'mecha') {
        EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points * 5);
      } else if (!this.player.isShielded()) {
        EventBus.emit('player_hit');
      }
    }
  }

  private handleBossVsPlayer(obj1: any, obj2: any) {
    const b = (obj1 === this.player ? obj2 : obj1) as Boss;
    if (b.active && this.isPlayingGetter() && !this.player.isShielded()) {
      EventBus.emit('player_hit');
    }
  }

  private handlePlayerVsAntimatter(obj1: any, obj2: any) {
    const container = (obj1 === this.player ? obj2 : obj1) as AntimatterContainer;
    if (container.active && this.isPlayingGetter()) {
      container.setActive(false);
      container.setVisible(false);
      EventBus.emit('antimatter_collected');
    }
  }

  private handlePlayerVsPowerUp(obj1: any, obj2: any) {
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
      lifespan: 300,
    });
  }
}
