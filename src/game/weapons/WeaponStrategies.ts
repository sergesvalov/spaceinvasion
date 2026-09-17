import Phaser from 'phaser';
import { EntityManager } from '../managers/EntityManager';
import { GameConfig } from '../config/GameConfig';

export interface WeaponContext {
  x: number;
  y: number;
  weaponLevel: number;
  isMecha: boolean;
  scene: Phaser.Scene;
}

export abstract class BaseWeaponStrategy {
  protected getBaseDamage(isMecha: boolean): number {
    return isMecha ? GameConfig.Player.DamageMecha : GameConfig.Player.DamageFighter;
  }

  protected getBaseSpeed(isMecha: boolean): number {
    return isMecha ? -400 : -600;
  }

  protected fireProj(entityManager: EntityManager, x: number, y: number, vx: number, vy: number, damage: number, type: string, target?: any) {
    const proj = entityManager.getProjectile() as any;
    if (proj && typeof proj.fire === 'function') {
      proj.fire(x, y, vy, damage, type);
      const body = proj.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocityX(vx);
      }
      if (target) {
        proj.target = target;
      }
    }
  }

  protected fireStandardLines(entityManager: EntityManager, context: WeaponContext, damage: number, speed: number, type: string) {
    const { x, y, weaponLevel, isMecha } = context;
    const lines = (isMecha || weaponLevel >= 3) ? 2 : 1;

    if (lines === 2) {
      this.fireProj(entityManager, x - 10, y, 0, speed, damage, type);
      this.fireProj(entityManager, x + 10, y, 0, speed, damage, type);
    } else {
      this.fireProj(entityManager, x, y - 20, 0, speed, damage, type);
    }

    if (weaponLevel >= 4) {
      const diagSpeed = speed * 0.707;
      this.fireProj(entityManager, x - 15, y, speed * 0.707, diagSpeed, damage, type);
      this.fireProj(entityManager, x + 15, y, -speed * 0.707, diagSpeed, damage, type);
    }
  }
}

export interface WeaponStrategy {
  fire(context: WeaponContext, entityManager: EntityManager): void;
  getFireRateModifier(): number;
}

export class PlasmaWeapon extends BaseWeaponStrategy implements WeaponStrategy {
  fire(context: WeaponContext, entityManager: EntityManager): void {
    const damage = this.getBaseDamage(context.isMecha);
    const speed = this.getBaseSpeed(context.isMecha);
    this.fireStandardLines(entityManager, context, damage, speed, 'plasma');
  }
  getFireRateModifier(): number { return 1.0; }
}

export class IonWeapon extends BaseWeaponStrategy implements WeaponStrategy {
  fire(context: WeaponContext, entityManager: EntityManager): void {
    const damage = this.getBaseDamage(context.isMecha) * 4;
    const speed = this.getBaseSpeed(context.isMecha) * 0.7;
    this.fireStandardLines(entityManager, context, damage, speed, 'ion');
  }
  getFireRateModifier(): number { return 2.5; } // slower
}

export class WaveWeapon extends BaseWeaponStrategy implements WeaponStrategy {
  fire(context: WeaponContext, entityManager: EntityManager): void {
    const damage = this.getBaseDamage(context.isMecha) * 1.5;
    const speed = this.getBaseSpeed(context.isMecha) * 0.8;
    this.fireStandardLines(entityManager, context, damage, speed, 'wave');
  }
  getFireRateModifier(): number { return 1.5; } // slightly slower
}

export class BeamWeapon extends BaseWeaponStrategy implements WeaponStrategy {
  fire(context: WeaponContext, entityManager: EntityManager): void {
    const damage = this.getBaseDamage(context.isMecha) * 2;
    const speed = -1000;
    this.fireStandardLines(entityManager, context, damage, speed, 'beam');
  }
  getFireRateModifier(): number { return 1.0; }
}

export class SpreadWeapon extends BaseWeaponStrategy implements WeaponStrategy {
  fire(context: WeaponContext, entityManager: EntityManager): void {
    const damage = this.getBaseDamage(context.isMecha);
    const speed = this.getBaseSpeed(context.isMecha);
    const angles = [-30, -15, 0, 15, 30];
    angles.forEach(angle => {
      const rad = Phaser.Math.DegToRad(angle - 90);
      const vx = Math.cos(rad) * Math.abs(speed);
      const vy = Math.sin(rad) * Math.abs(speed);
      this.fireProj(entityManager, context.x, context.y - 20, vx, vy, damage, 'spread');
    });
  }
  getFireRateModifier(): number { return 1.0; }
}

export class HomingWeapon extends BaseWeaponStrategy implements WeaponStrategy {
  fire(context: WeaponContext, entityManager: EntityManager): void {
    const damage = this.getBaseDamage(context.isMecha);
    const speed = this.getBaseSpeed(context.isMecha);
    
    let nearestDist = Infinity;
    let nearestEnemy: any = null;
    
    entityManager.enemies.children.iterate((c) => {
      const e = c as any;
      if (e.active) {
        const dist = Phaser.Math.Distance.Between(context.x, context.y, e.x, e.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = e;
        }
      }
      return true;
    });

    this.fireProj(entityManager, context.x, context.y - 20, 0, speed, damage, 'homing', nearestEnemy);
  }
  getFireRateModifier(): number { return 1.0; }
}
