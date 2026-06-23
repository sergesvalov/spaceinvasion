import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';

export class Projectile extends BaseProjectile {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'projectile');

    // Provide a default texture if missing
    if (!scene.textures.exists('projectile')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillRect(0, 0, 4, 20);
      graphics.generateTexture('projectile', 4, 20);
      graphics.destroy();
      this.setTexture('projectile');
    }
  }

  protected isOutOfBounds(): boolean {
    // Player shoots upwards
    return this.y < -50;
  }
}
