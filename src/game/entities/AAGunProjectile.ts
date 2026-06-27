import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';

export class AAGunProjectile extends BaseProjectile {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'aagun-projectile');

    // Provide a default texture if missing
    if (!scene.textures.exists('aagun-projectile')) {
      const graphics = scene.add.graphics();
      // Outer glow (orange)
      graphics.fillStyle(0xff8800, 0.4);
      graphics.fillCircle(15, 15, 15);
      // Inner shell (red)
      graphics.fillStyle(0xff2200, 0.8);
      graphics.fillCircle(15, 15, 10);
      // Core (yellow/white)
      graphics.fillStyle(0xffffaa, 1);
      graphics.fillCircle(15, 15, 5);
      
      graphics.generateTexture('aagun-projectile', 30, 30);
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
