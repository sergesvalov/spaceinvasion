import Phaser from 'phaser';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { EnemyProjectile } from '../entities/EnemyProjectile';
import { OceanEnemy } from '../entities/OceanEnemy';
import { AntimatterContainer } from '../entities/AntimatterContainer';
import { AAGunProjectile } from '../entities/AAGunProjectile';
import { AAGun } from '../entities/AAGun';
import { PowerUp } from '../entities/PowerUp';
import { ObjectPool } from './ObjectPool';
import { BaseEntity } from '../entities/BaseEntity';

export class EntityManager {
  public projectiles: ObjectPool<Projectile>;
  public enemies: ObjectPool<Enemy>;
  public oceanEnemies: ObjectPool<OceanEnemy>;
  public enemyProjectiles: ObjectPool<EnemyProjectile>;
  public antimatterContainers: ObjectPool<AntimatterContainer>;
  public aaProjectiles: ObjectPool<AAGunProjectile>;
  public aaGuns: ObjectPool<AAGun>;
  public powerUps: ObjectPool<PowerUp>;

  constructor(private scene: Phaser.Scene) {
    this.projectiles = new ObjectPool<Projectile>(this.scene, Projectile, 150);
    this.enemies = new ObjectPool<Enemy>(this.scene, Enemy, 20);
    this.oceanEnemies = new ObjectPool<OceanEnemy>(this.scene, OceanEnemy, 20);
    this.enemyProjectiles = new ObjectPool<EnemyProjectile>(this.scene, EnemyProjectile, 50);
    this.antimatterContainers = new ObjectPool<AntimatterContainer>(this.scene, AntimatterContainer, 50);
    this.aaProjectiles = new ObjectPool<AAGunProjectile>(this.scene, AAGunProjectile, 100);
    this.aaGuns = new ObjectPool<AAGun>(this.scene, AAGun, 10);
    this.powerUps = new ObjectPool<PowerUp>(this.scene, PowerUp, 10);
  }

  public applyDamageToAllEnemies(damage: number, radius?: number, centerX?: number, centerY?: number) {
    const applyToGroup = (pool: ObjectPool<any>) => {
      pool.children.iterate((c) => {
        const e = c as BaseEntity;
        if (e && e.active) {
          if (radius !== undefined && centerX !== undefined && centerY !== undefined) {
            const dist = Phaser.Math.Distance.Between(centerX, centerY, e.x, e.y);
            if (dist <= radius) {
              e.takeDamage(damage);
            }
          } else {
            e.takeDamage(damage);
          }
        }
        return true;
      });
    };
    applyToGroup(this.enemies);
    applyToGroup(this.oceanEnemies);
  }

  public clearEnemyProjectiles(radius?: number, centerX?: number, centerY?: number) {
    this.enemyProjectiles.children.iterate((c) => {
      const p = c as Phaser.Physics.Arcade.Sprite;
      if (p.active) {
        if (radius !== undefined && centerX !== undefined && centerY !== undefined) {
          const dist = Phaser.Math.Distance.Between(centerX, centerY, p.x, p.y);
          if (dist <= radius) {
            p.setActive(false).setVisible(false);
          }
        } else {
          p.setActive(false).setVisible(false);
        }
      }
      return true;
    });
  }

  public getProjectile(): Projectile | null {
    return this.projectiles.get();
  }

  public getEnemy(): Enemy | null {
    return this.enemies.get();
  }

  public getOceanEnemy(): OceanEnemy | null {
    return this.oceanEnemies.get();
  }

  public getEnemyProjectile(): EnemyProjectile | null {
    return this.enemyProjectiles.get();
  }

  public getAntimatterContainer(): AntimatterContainer | null {
    return this.antimatterContainers.get();
  }

  public getAAGunProjectile(): AAGunProjectile | null {
    return this.aaProjectiles.get();
  }

  public getAAGun(): AAGun | null {
    return this.aaGuns.get();
  }

  public getPowerUp(): PowerUp | null {
    return this.powerUps.get();
  }
}
