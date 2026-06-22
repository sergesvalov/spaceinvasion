import Phaser from 'phaser';

export class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-projectile');
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  fire(x: number, y: number, velocityY: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(velocityY);
      // Give some tiny collision box
      body.setSize(10, 10);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    
    // Deactivate when it leaves the bottom screen
    if (this.y > this.scene.scale.height + 50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
