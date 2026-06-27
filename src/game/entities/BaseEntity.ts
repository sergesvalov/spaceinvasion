import Phaser from 'phaser';

export abstract class BaseEntity extends Phaser.Physics.Arcade.Sprite {
  public hp: number = 0;
  
  // Callbacks for events
  protected onDestroyed?: (entity: BaseEntity) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public setOnDestroyedCallback(callback: (entity: BaseEntity) => void) {
    this.onDestroyed = callback;
  }

  public takeDamage(amount: number): boolean {
    if (!this.active) return false;
    
    this.hp -= amount;
    
    // Flash red when taking damage
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
      return true; // Returned true indicates it just died
    }
    return false;
  }

  protected die() {
    this.createExplosion();
    this.setActive(false);
    this.setVisible(false);
    
    if (this.onDestroyed) {
      this.onDestroyed(this);
    }
  }

  protected createExplosion() {
    const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      quantity: 20
    });
    emitter.explode(20);
  }
}
