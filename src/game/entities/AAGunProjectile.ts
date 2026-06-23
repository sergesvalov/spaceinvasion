import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';

export class AAGunProjectile extends BaseProjectile {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'aagun-projectile');

    // Provide a default texture if missing
    if (!scene.textures.exists('aagun-projectile')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0xffff00, 1); // Yellow bullet
      graphics.fillCircle(5, 5, 5);
      graphics.generateTexture('aagun-projectile', 10, 10);
      graphics.destroy();
      this.setTexture('aagun-projectile');
    }
  }

  protected isOutOfBounds(): boolean {
    const { width, height } = this.scene.scale;
    // Out of bounds if it goes too far off any edge
    return this.y < -50 || this.y > height + 50 || this.x < -50 || this.x > width + 50;
  }
}
