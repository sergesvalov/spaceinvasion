import Phaser from 'phaser';

export type PowerUpType = 'health' | 'weapon' | 'spread' | 'homing';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  public type: PowerUpType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    const textureKey = type === 'health' ? 'powerup_health' : 'powerup_weapon';
    super(scene, x, y, textureKey);
    this.type = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.1); // adjust scale based on generated image
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(this.width * 0.8, this.height * 0.8);
      body.setVelocityY(80); // Slowly fall down
    }
  }

  spawn(x: number, y: number, type: PowerUpType) {
    this.type = type;
    this.setTexture(type === 'health' ? 'powerup_health' : 'powerup_weapon');
    
    this.clearTint();
    if (type === 'spread') this.setTint(0xffaa00);
    if (type === 'homing') this.setTint(0x00aaff);

    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(80);
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
