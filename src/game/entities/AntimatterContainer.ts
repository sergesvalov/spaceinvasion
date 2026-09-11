import Phaser from 'phaser';

export class AntimatterContainer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'antimatter');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setScale(0.64); 
  }

  spawn(x: number, y: number, vx: number = 0, vy: number = 50) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocity(vx, vy);
      body.setAngularVelocity(Phaser.Math.Between(-100, 100));
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    
    if (this.y > this.scene.scale.height + 50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
