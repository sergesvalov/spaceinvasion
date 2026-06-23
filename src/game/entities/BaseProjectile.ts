import Phaser from 'phaser';

export class BaseProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
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
    }
  }

  protected isOutOfBounds(): boolean {
    // Subclasses can override this logic (e.g. check top or bottom of screen)
    return false;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    
    if (this.isOutOfBounds()) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
