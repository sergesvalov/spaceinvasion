import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';

export class EnemyProjectile extends BaseProjectile {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-projectile');
  }

  fire(x: number, y: number, velocityY: number) {
    super.fire(x, y, velocityY);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      // Give some tiny collision box
      body.setSize(10, 10);
    }
  }

  protected isOutOfBounds(): boolean {
    // Enemies shoot downwards
    return this.y > this.scene.scale.height + 50;
  }
}
