import Phaser from 'phaser';
import { EntityManager } from '../managers/EntityManager';
import { Player } from './Player';
import { Enemy } from './Enemy';

export class Drone extends Phaser.GameObjects.Sprite {
  private player: Player;
  private entityManager: EntityManager;
  private lastFired: number = 0;
  private followOffset = { x: 50, y: 0 };
  private timeAlive: number = 0;

  constructor(scene: Phaser.Scene, player: Player, entityManager: EntityManager) {
    super(scene, player.x + 50, player.y, 'player_fighter');
    this.player = player;
    this.entityManager = entityManager;

    scene.add.existing(this);
    this.setScale(1); // Smaller than player
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
    let nearestEnemy: Enemy | null = null;
    this.entityManager.enemies.children.iterate((c) => {
      const e = c as Enemy;
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
      const target = nearestEnemy as Enemy;
      const proj = this.entityManager.getProjectile();
      if (proj) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const speed = 400;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        proj.fire(this.x, this.y, vy, 1, 'plasma');
        const body = proj.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocityX(vx);
        }
        proj.setScale(1); // Half the size of a normal plasma shot (0.48)
        proj.setTint(0x00ff00);
      }
    } else {
      const proj = this.entityManager.getProjectile();
      if (proj) {
        proj.fire(this.x, this.y, -400, 1, 'plasma');
        proj.setScale(1);
        proj.setTint(0x00ff00);
      }
    }
  }
}
