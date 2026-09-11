import Phaser from 'phaser';
import { EntityManager } from '../managers/EntityManager';
import { Player } from './Player';

export class Drone extends Phaser.GameObjects.Sprite {
  private player: Player;
  private entityManager: EntityManager;
  private lastFired: number = 0;
  private followOffset = { x: 50, y: 0 };
  private timeAlive: number = 0;

  constructor(scene: Phaser.Scene, player: Player, entityManager: EntityManager) {
    super(scene, player.x + 50, player.y, 'ship');
    this.player = player;
    this.entityManager = entityManager;

    scene.add.existing(this);
    this.setScale(0.24); // Smaller than player
    this.setTint(0x00ff00); // Green tint to distinguish
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.timeAlive += delta;

    // Bob around the player
    this.followOffset.x = 60 * Math.sin(this.timeAlive * 0.001);
    this.followOffset.y = 20 * Math.cos(this.timeAlive * 0.002);

    const targetX = this.player.x + this.followOffset.x;
    const targetY = this.player.y + this.followOffset.y;

    this.x = Phaser.Math.Linear(this.x, targetX, 0.1);
    this.y = Phaser.Math.Linear(this.y, targetY, 0.1);

    // Auto-fire
    if (time > this.lastFired + 1000) {
      this.lastFired = time;
      this.fire();
    }
  }

  private fire() {
    let nearestDist = Infinity;
    let nearestEnemy: any = null;
    this.entityManager.enemies.children.iterate((c) => {
      const e = c as any;
      if (e.active) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = e;
        }
      }
      return true;
    });

    if (nearestEnemy) {
      const proj = this.entityManager.getProjectile() as any;
      if (proj && typeof proj.fire === 'function') {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, nearestEnemy.x, nearestEnemy.y);
        const speed = 400;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        proj.fire(this.x, this.y, vy, 1, 'plasma');
        const body = proj.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocityX(vx);
        }
        proj.setScale(0.24); // Half the size of a normal plasma shot (0.48)
        proj.setTint(0x00ff00);
      }
    } else {
      const proj = this.entityManager.getProjectile() as any;
      if (proj && typeof proj.fire === 'function') {
        proj.fire(this.x, this.y, -400, 1, 'plasma');
        proj.setScale(0.24);
        proj.setTint(0x00ff00);
      }
    }
  }
}
