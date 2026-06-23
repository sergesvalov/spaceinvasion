import Phaser from 'phaser';
import { EnemyProjectile } from './EnemyProjectile';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public hp: number = 100;
  private startX: number = 0;
  private timeOffset: number = 0;
  private lastFiredBullet: number = 0;
  private lastSpawnedKamikaze: number = 0;

  private enemyProjectiles: Phaser.Physics.Arcade.Group;
  private onSpawnKamikaze: (x: number, y: number) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyProjectiles: Phaser.Physics.Arcade.Group,
    onSpawnKamikaze: (x: number, y: number) => void
  ) {
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.enemyProjectiles = enemyProjectiles;
    this.onSpawnKamikaze = onSpawnKamikaze;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(180, 130);
      body.setImmovable(true);
    }
  }

  spawn(x: number, y: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.startX = x;
    this.timeOffset = Phaser.Math.Between(0, 1000);
    this.hp = 100;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      // Moves slowly down until it reaches top of screen
      body.setVelocityY(20);
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    
    // Tint red momentarily
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    return this.hp <= 0;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Stop moving down once fully on screen
    if (this.y > 100 && body.velocity.y > 0) {
      body.setVelocityY(0);
    }

    // Sinewave horizontal movement
    if (this.y >= 100) {
       this.x = this.startX + Math.sin((time + this.timeOffset) * 0.001) * 80;
    }

    // Bullet hell
    if (time > this.lastFiredBullet + 800) {
      this.lastFiredBullet = time;
      this.fireBulletHell();
    }

    // Spawn Kamikaze
    if (time > this.lastSpawnedKamikaze + 5000) {
      this.lastSpawnedKamikaze = time;
      // Spawn from left and right hangar bays
      this.onSpawnKamikaze(this.x - 60, this.y + 40);
      this.onSpawnKamikaze(this.x + 60, this.y + 40);
    }
  }

  private fireBulletHell() {
    // Fire 5 bullets in a spread
    const angles = [-30, -15, 0, 15, 30];
    const speed = 250;

    angles.forEach((angleDeg) => {
      const ep = this.enemyProjectiles.get() as EnemyProjectile;
      if (ep) {
        const rad = Phaser.Math.DegToRad(angleDeg + 90); // +90 because 0 is right, we want down
        const vx = Math.cos(rad) * speed;
        const vy = Math.sin(rad) * speed;
        
        ep.fire(this.x, this.y + 60, 0); // initial velocity 0
        const body = ep.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(vx, vy);
        }
      }
    });
  }
}
