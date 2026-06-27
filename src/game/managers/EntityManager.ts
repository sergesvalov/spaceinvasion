import Phaser from 'phaser';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { EnemyProjectile } from '../entities/EnemyProjectile';
import { AntimatterContainer } from '../entities/AntimatterContainer';
import { AAGunProjectile } from '../entities/AAGunProjectile';
import { AAGun } from '../entities/AAGun';

export class EntityManager {
  public projectiles: Phaser.Physics.Arcade.Group;
  public enemies: Phaser.Physics.Arcade.Group;
  public enemyProjectiles: Phaser.Physics.Arcade.Group;
  public antimatterContainers: Phaser.Physics.Arcade.Group;
  public aaProjectiles: Phaser.Physics.Arcade.Group;
  public aaGuns: Phaser.Physics.Arcade.Group;

  constructor(private scene: Phaser.Scene) {
    this.projectiles = this.scene.physics.add.group({
      classType: Projectile,
      maxSize: 50,
      runChildUpdate: true
    });

    this.enemies = this.scene.physics.add.group({
      classType: Enemy,
      maxSize: 20,
      runChildUpdate: true
    });

    this.enemyProjectiles = this.scene.physics.add.group({
      classType: EnemyProjectile,
      maxSize: 50,
      runChildUpdate: true
    });

    this.antimatterContainers = this.scene.physics.add.group({
      classType: AntimatterContainer,
      maxSize: 50,
      runChildUpdate: true
    });

    this.aaProjectiles = this.scene.physics.add.group({
      classType: AAGunProjectile,
      maxSize: 100,
      runChildUpdate: true
    });

    this.aaGuns = this.scene.physics.add.group({
      classType: AAGun,
      maxSize: 10,
      runChildUpdate: true
    });
  }

  public getProjectile(): Projectile | null {
    return this.projectiles.get() as Projectile | null;
  }

  public getEnemy(): Enemy | null {
    return this.enemies.get() as Enemy | null;
  }

  public getEnemyProjectile(): EnemyProjectile | null {
    return this.enemyProjectiles.get() as EnemyProjectile | null;
  }

  public getAntimatterContainer(): AntimatterContainer | null {
    return this.antimatterContainers.get() as AntimatterContainer | null;
  }

  public getAAGunProjectile(): AAGunProjectile | null {
    return this.aaProjectiles.get() as AAGunProjectile | null;
  }

  public getAAGun(): AAGun | null {
    return this.aaGuns.get() as AAGun | null;
  }
}
