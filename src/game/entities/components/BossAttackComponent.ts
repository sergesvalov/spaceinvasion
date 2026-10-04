import Phaser from 'phaser';
import { Boss } from '../Boss';
import { EnemyProjectile } from '../EnemyProjectile';
import { GameConfig } from '../../config/GameConfig';

export class BossAttackComponent {
  private state: 'SPREAD' | 'LASER' | 'KAMIKAZE' = 'SPREAD';
  private stateTimer: number = 0;
  private lastFired: number = 0;

  constructor(
    private boss: Boss,
    private enemyProjectiles: Phaser.Physics.Arcade.Group,
    private onSpawnKamikaze: (x: number, y: number) => void,
  ) {}

  public update(time: number) {
    const isPhase2 = this.boss.hp <= GameConfig.Boss.HP / 2;

    if (isPhase2 && !this.boss.getData('phase2')) {
      this.boss.setData('phase2', true);
      this.boss.setTint(0xffaa55); // Enraged tint
      this.boss.scene.cameras.main.shake(500, 0.01);
    }

    if (time > this.stateTimer) {
      this.pickNextState(time, isPhase2);
    }

    if (this.state === 'SPREAD') {
      let fireRate = isPhase2 ? 400 : 700;
      if (this.boss.level === 2) fireRate *= 0.8;
      if (this.boss.level >= 3) fireRate *= 0.6;

      if (time > this.lastFired + fireRate) {
        this.lastFired = time;
        this.fireBulletHell(isPhase2);
      }
    } else if (this.state === 'KAMIKAZE') {
      let spawnRate = isPhase2 ? 800 : 1500;
      if (this.boss.level === 2) spawnRate *= 0.8;
      if (this.boss.level >= 3) spawnRate *= 0.6;

      if (time > this.lastFired + spawnRate) {
        this.lastFired = time;
        this.onSpawnKamikaze(this.boss.x - 60, this.boss.y + 40);
        this.onSpawnKamikaze(this.boss.x + 60, this.boss.y + 40);
      }
    }
  }

  private pickNextState(time: number, isPhase2: boolean) {
    const hasTurrets = this.boss.parts.some((p) => p.partType === 'turret');
    const hasGenerator = this.boss.parts.some((p) => p.partType === 'generator');

    const available: string[] = ['LASER'];
    if (hasTurrets) available.push('SPREAD');
    if (hasGenerator) available.push('KAMIKAZE');

    // Core enraged if all parts destroyed
    if (!hasTurrets && !hasGenerator) {
      available.push('SPREAD', 'KAMIKAZE', 'LASER');
    }

    const choice = Phaser.Math.RND.pick(available);
    this.state = choice as 'SPREAD' | 'LASER' | 'KAMIKAZE';

    if (choice === 'SPREAD') {
      this.stateTimer = time + (isPhase2 ? 2000 : 3000);
    } else if (choice === 'KAMIKAZE') {
      this.stateTimer = time + (isPhase2 ? 2000 : 3000);
    } else if (choice === 'LASER') {
      this.stateTimer = time + 4000;
      this.fireLaser();
    }
  }

  private fireLaser() {
    const scene = this.boss.scene;
    const warning = scene.add.rectangle(this.boss.x, this.boss.y + 300, 10, 600, 0xff0000, 0.5);
    scene.tweens.add({
      targets: warning,
      alpha: 0,
      yoyo: true,
      repeat: 3,
      duration: 200,
      onComplete: () => {
        warning.destroy();
        if (!this.boss.active) return; // Boss might have died

        const ep = this.enemyProjectiles.get() as EnemyProjectile;
        if (ep) {
          ep.fire(this.boss.x, this.boss.y + 250, 0);
          // Enemy projectile texture is around 12px. Scale it to be a beam.
          ep.setScale(3, 40);
          ep.setTint(0x00ffff);

          const body = ep.body as Phaser.Physics.Arcade.Body;
          if (body) {
            body.setVelocity(0, 0);
          }

          scene.time.delayedCall(800, () => {
            ep.setActive(false).setVisible(false);
            ep.setScale(1);
            ep.clearTint();
          });
        }
      },
    });
  }

  private fireBulletHell(isPhase2: boolean) {
    let angles = isPhase2 ? [-45, -30, -15, 0, 15, 30, 45] : [-30, -15, 0, 15, 30];

    if (this.boss.level === 2) {
      angles = isPhase2 ? [-60, -40, -20, 0, 20, 40, 60] : [-45, -20, 0, 20, 45];
    } else if (this.boss.level >= 3) {
      angles = isPhase2 ? [-75, -50, -25, 0, 25, 50, 75, -15, 15] : [-60, -30, 0, 30, 60, -10, 10];
    }

    const speed = isPhase2 ? 297.5 : 212.5;

    angles.forEach((angleDeg) => {
      const ep = this.enemyProjectiles.get() as EnemyProjectile;
      if (ep) {
        const rad = Phaser.Math.DegToRad(angleDeg + 90);
        const vx = Math.cos(rad) * speed;
        const vy = Math.sin(rad) * speed;

        ep.fire(this.boss.x, this.boss.y + 60, 0);
        const body = ep.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(vx, vy);
        }
      }
    });
  }
}
