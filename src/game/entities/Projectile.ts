import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Provide a default texture if missing (we generate it in BootScene or here)
    if (!scene.textures.exists('projectile')) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillRect(0, 0, 4, 20);
      graphics.generateTexture('projectile', 4, 20);
      graphics.destroy();
    }
    
    this.setTexture('projectile');
  }

  fire(x: number, y: number, velocityY: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(velocityY);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    
    // Deactivate when it leaves the screen
    if (this.y < -50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
