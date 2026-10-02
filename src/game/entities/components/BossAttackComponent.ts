import Phaser from 'phaser';
import { Boss } from '../Boss';
import { EnemyProjectile } from '../EnemyProjectile';
import { GameConfig } from '../../config/GameConfig';

export class BossAttackComponent {
  private lastFiredBullet: number = 0;
  private lastSpawnedKamikaze: number = 0;

  constructor(
    private boss: Boss,
    private enemyProjectiles: Phaser.Physics.Arcade.Group,
    private onSpawnKamikaze: (x: number, y: number) => void
  ) {}

  public update(time: number) {
    const isPhase2 = this.boss.hp <= GameConfig.Boss.HP / 2;
    
    if (isPhase2 && !this.boss.getData('phase2')) {
      this.boss.setData('phase2', true);
      this.boss.setTint(0xffaa55); // Orange/Red warning tint
    }

    const fireRate = isPhase2 ? 500 : 800;
    
    // Bullet hell
    if (time > this.lastFiredBullet + fireRate) {
      this.lastFiredBullet = time;
      this.fireBulletHell(isPhase2);
    }

    // Spawn Kamikaze
    const spawnRate = isPhase2 ? 3000 : 5000;
    if (time > this.lastSpawnedKamikaze + spawnRate) {
      this.lastSpawnedKamikaze = time;
      // Spawn from left and right hangar bays
      this.onSpawnKamikaze(this.boss.x - 60, this.boss.y + 40);
      this.onSpawnKamikaze(this.boss.x + 60, this.boss.y + 40);
    }
  }

  private fireBulletHell(isPhase2: boolean) {
    const angles = isPhase2 ? [-45, -30, -15, 0, 15, 30, 45] : [-30, -15, 0, 15, 30];
    const speed = isPhase2 ? 350 : 250;

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
