import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';

export class AAGunProjectile extends BaseProjectile {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'aagun-projectile');
    if (this.trailEmitter) {
      this.trailEmitter.setParticleTint(0xff8800);
      this.trailEmitter.setParticleScale(1.5, 0);
    }
  }

  protected isOutOfBounds(): boolean {
    const { width, height } = this.scene.scale;
    // Out of bounds if it goes too far off any edge
    return this.y < -50 || this.y > height + 50 || this.x < -50 || this.x > width + 50;
  }
}
