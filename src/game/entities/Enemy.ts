import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private startX: number = 0;
  private timeOffset: number = 0;
  private lastFired: number = 0;
  public hp: number = 3;
  private exhaustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(40, 40);
    }
    
    this.setScale(0.04);
    this.setBlendMode(Phaser.BlendModes.SCREEN);
    
    this.exhaustEmitter = scene.add.particles(0, 0, 'particle', {
      speedY: { min: -100, max: -200 },
      speedX: { min: -15, max: 15 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      tint: [0xff0000, 0xff5500],
      frequency: 20
    });
    this.exhaustEmitter.startFollow(this, 0, -30);
    this.exhaustEmitter.stop();
  }

  spawn(x: number, y: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.exhaustEmitter.start();
    this.startX = x;
    this.timeOffset = Phaser.Math.Between(0, 1000);
    this.hp = 3;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(100);
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    
    // Sinewave horizontal movement
    this.x = this.startX + Math.sin((time + this.timeOffset) * 0.002) * 50;

    if (this.y > this.scene.scale.height + 50) {
      this.setActive(false);
      this.setVisible(false);
      this.exhaustEmitter.stop();
    }
    
    // Also stop emitter if destroyed by player
    if (!this.active) {
      this.exhaustEmitter.stop();
    }
  }

  canFire(time: number): boolean {
    if (time > this.lastFired + 1500) {
      this.lastFired = time;
      return true;
    }
    return false;
  }
}
