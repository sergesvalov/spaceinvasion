import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { Boss } from './Boss';
import { AAGunProjectile } from './AAGunProjectile';
import { BaseEntity } from './BaseEntity';
import { GameConfig } from '../config/GameConfig';

export class AAGun extends BaseEntity {
  private lastFired: number = 0;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private boss!: Boss;
  private projectileGroup!: Phaser.Physics.Arcade.Group;
  private fireRateMs: number = GameConfig.AAGun.FireRate;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'aagun');

    // Scale down the generated asset if needed
    this.setScale(0.15); 
    this.setDepth(-10); // Sit on top of buildings but below flying ships

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(200, 200); // adjust as needed based on scale
      body.setImmovable(true);
    }
  }

  setReferences(enemyGroup: Phaser.Physics.Arcade.Group, boss: Boss, projectileGroup: Phaser.Physics.Arcade.Group) {
    this.enemyGroup = enemyGroup;
    this.boss = boss;
    this.projectileGroup = projectileGroup;
  }

  spawn(x: number, y: number, scrollSpeed: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      // To match background scroll speed exactly, velocityY should be 0.5 * 1000 = 500
      body.setVelocityY(scrollSpeed);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    if (this.y > this.scene.scale.height + 150) {
      this.setActive(false);
      this.setVisible(false);
      return;
    }

    if (time > this.lastFired + this.fireRateMs) {
      this.fireAtNearestEnemy(time);
    }
  }

  private fireAtNearestEnemy(time: number) {
    let nearestDist = Number.MAX_VALUE;
    let target: Phaser.GameObjects.Sprite | null = null;

    // Check enemies
    this.enemyGroup.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (enemy.active) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
        if (dist < nearestDist && dist < 800) { // Max range
          nearestDist = dist;
          target = enemy;
        }
      }
    });

    // Check boss
    if (this.boss.active) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.boss.x, this.boss.y);
      if (dist < nearestDist && dist < 800) {
        nearestDist = dist;
        target = this.boss;
      }
    }

    if (target) {
      this.lastFired = time;
      
      const proj = this.projectileGroup.get() as AAGunProjectile;
      if (proj) {
        proj.fire(this.x, this.y - 20, 0, GameConfig.AAGun.Damage); // Fire upwards initially, then correct velocity
        
        // Calculate velocity vector
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const speed = 600;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const body = proj.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(vx, vy);
        }
        
        // Optional: play sound
        // if (localStorage.getItem('soundEnabled') !== 'false') {
        //   this.scene.sound.play('pew', { volume: 0.1 });
        // }
      }
    }
  }
}
