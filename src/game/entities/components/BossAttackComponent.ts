import Phaser from 'phaser';
import { Boss } from '../Boss';
import { EnemyProjectile } from '../EnemyProjectile';

export class BossAttackComponent {
  private lastFiredBullet: number = 0;
  private lastSpawnedKamikaze: number = 0;

  constructor(
    private boss: Boss,
    private enemyProjectiles: Phaser.Physics.Arcade.Group,
    private onSpawnKamikaze: (x: number, y: number) => void
  ) {}

  public update(time: number) {
    // Bullet hell
    if (time > this.lastFiredBullet + 800) {
      this.lastFiredBullet = time;
      this.fireBulletHell();
    }

    // Spawn Kamikaze
    if (time > this.lastSpawnedKamikaze + 5000) {
      this.lastSpawnedKamikaze = time;
      // Spawn from left and right hangar bays
      this.onSpawnKamikaze(this.boss.x - 60, this.boss.y + 40);
      this.onSpawnKamikaze(this.boss.x + 60, this.boss.y + 40);
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
        
        ep.fire(this.boss.x, this.boss.y + 60, 0); // initial velocity 0
        const body = ep.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(vx, vy);
        }
      }
    });
  }
}
