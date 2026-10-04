import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';
import { EntityConfig } from '../config/EntityConfig';

export class Projectile extends BaseProjectile {
  public weaponType: string = 'plasma';
  public target?: any;
  public piercing: boolean = false;
  public hitTargets: Set<any> = new Set();
  private startX: number = 0;
  private timeAlive: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'projectile_plasma'); // Default to fighter sprite
  }

  fire(x: number, y: number, velocityY: number, damage?: number, weaponType: string = 'plasma') {
    super.fire(x, y, velocityY, damage);
    this.weaponType = weaponType;
    this.target = undefined;
    this.piercing = false;
    this.hitTargets.clear();
    this.startX = x;
    this.timeAlive = 0;

    // Use additive blending for a nice neon glow
    this.setBlendMode(Phaser.BlendModes.ADD);

    // Default config (Fighter)
    this.setTexture('projectile_plasma');
    this.setScale(1.15);
    this.clearTint();

    if (weaponType === 'ion') {
      this.setScale(EntityConfig.Projectiles.scale);
      this.setTint(0xaa00ff);
    } else if (weaponType === 'wave') {
      this.setScale(EntityConfig.Projectiles.scale);
      this.setTint(0x00ffaa);
    } else if (weaponType === 'spread') {
      this.setTint(0xffaa00);
      this.setScale(EntityConfig.Projectiles.scale);
    } else if (weaponType === 'beam') {
      // Mecha config
      this.setTexture('projectile_plasma');
      this.setTint(0xffffff);
      this.setScale(EntityConfig.Projectiles.scale);
      this.piercing = true;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      // Hitbox in texture pixels; Arcade multiplies it by the sprite scale.
      // 25 * 0.48 -> ~12px
      // Center it: (64 - 25) / 2
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    if (this.weaponType === 'wave') {
      this.timeAlive += delta;
      this.x = this.startX + Math.sin(this.timeAlive * 0.01) * 80; // 80px amplitude
    } else if (this.weaponType === 'homing' && this.target && this.target.active) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      const speed = EntityConfig.Projectiles.homingSpeed;
      const body = this.body as Phaser.Physics.Arcade.Body;
      const desiredVx = Math.cos(angle) * speed;
      const desiredVy = Math.sin(angle) * speed;

      body.setVelocityX(Phaser.Math.Linear(body.velocity.x, desiredVx, 0.1));
      body.setVelocityY(Phaser.Math.Linear(body.velocity.y, desiredVy, 0.1));
    }
  }

  protected isOutOfBounds(): boolean {
    return this.y < -50 || this.x < -100 || this.x > this.scene.scale.width + 100;
  }
}
