import Phaser from 'phaser';

export class BaseProjectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number = 1;
  protected trailEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.trailEmitter = scene.add.particles(0, 0, 'particle', {
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      lifespan: 150,
      tint: 0x00ffff,
      frequency: 20
    });
    this.trailEmitter.startFollow(this);
    this.trailEmitter.stop();
  }

  fire(x: number, y: number, velocityY: number, damage?: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    if (damage !== undefined) {
      this.damage = damage;
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(velocityY);
    }
    
    if (this.trailEmitter) {
      this.trailEmitter.start();
    }
  }

  setActive(value: boolean): this {
    super.setActive(value);
    if (!value && this.trailEmitter) {
      this.trailEmitter.stop();
    }
    return this;
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

    if (this.active) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body && (body.velocity.x !== 0 || body.velocity.y !== 0)) {
        this.rotation = Math.atan2(body.velocity.y, body.velocity.x) + Math.PI / 2;
      }
    }
  }
}
