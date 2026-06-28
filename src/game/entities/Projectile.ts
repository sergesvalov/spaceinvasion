import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';

export class Projectile extends BaseProjectile {
  public weaponType: string = 'plasma';
  public target?: any;
  public piercing: boolean = false;
  public hitTargets: Set<any> = new Set();
  private startX: number = 0;
  private timeAlive: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'projectile_fighter'); // Default to fighter sprite
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
    this.setTexture('projectile_fighter');
    this.setScale(0.06); 
    this.clearTint();

    if (weaponType === 'ion') {
      this.setScale(0.1);
      this.setTint(0xaa00ff);
    } else if (weaponType === 'wave') {
      this.setScale(0.08);
      this.setTint(0x00ffaa);
    } else if (weaponType === 'spread') {
      this.setTint(0xffaa00);
      this.setScale(0.07);
    } else if (weaponType === 'beam') {
      // Mecha config
      this.setTexture('projectile_mecha');
      this.setTint(0xffffff);
      this.setScale(0.08);
      this.piercing = true;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      // Since it's a 1024x1024 texture scaled down, let's make the hitbox reasonable
      body.setSize(400, 400); // Scaled by 0.06 -> ~24px
      body.setOffset(312, 312); // Center it
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
      const speed = 500;
      const body = this.body as Phaser.Physics.Arcade.Body;
      const desiredVx = Math.cos(angle) * speed;
      const desiredVy = Math.sin(angle) * speed;
      
      body.setVelocityX(Phaser.Math.Linear(body.velocity.x, desiredVx, 0.1));
      body.setVelocityY(Phaser.Math.Linear(body.velocity.y, desiredVy, 0.1));
    }
  }

  protected isOutOfBounds(): boolean {
    return this.y < -50 || this.x < -100 || this.x > (this.scene.scale.width + 100);
  }
}
