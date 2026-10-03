import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { GameConfig } from '../config/GameConfig';
import { BossMovementComponent } from './components/BossMovementComponent';
import { BossAttackComponent } from './components/BossAttackComponent';
import { EventBus } from '../../services/EventBus';

export class Boss extends BaseEntity {
  private exhaustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private movementComponent: BossMovementComponent;
  private attackComponent: BossAttackComponent;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyProjectiles: Phaser.Physics.Arcade.Group,
    onSpawnKamikaze: (x: number, y: number) => void
  ) {
    super(scene, x, y, 'boss');
    
    // Scale down the large generated image to an appropriate boss size
    this.setScale(0.66);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(108, 78);
      body.setImmovable(true);
    }

    this.exhaustEmitter = scene.add.particles(0, 0, 'cloud_particle', {
      speedY: { min: -100, max: -300 }, // boss points down, engine is at the top
      speedX: { min: -20, max: 20 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      lifespan: 600,
      tint: [0xff0000, 0xff5500],
      frequency: 30
    });
    this.exhaustEmitter.startFollow(this, 0, -30);
    this.exhaustEmitter.stop(); // default stopped until spawned
    
    this.movementComponent = new BossMovementComponent(this);
    this.attackComponent = new BossAttackComponent(this, enemyProjectiles, onSpawnKamikaze);
  }

  spawn(x: number, y: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.hp = GameConfig.Boss.HP;
    this.clearTint();
    
    this.movementComponent.spawn(x, y);
    this.exhaustEmitter.start();
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    
    this.movementComponent.update(time);
    this.attackComponent.update(time);
  }

  setActive(value: boolean): this {
    super.setActive(value);
    if (!value) {
      this.exhaustEmitter.stop();
    }
    return this;
  }

  takeDamage(amount: number): boolean {
    const died = super.takeDamage(amount);
    if (!died) {
      this.scene.cameras.main.shake(100, 0.003);
    }
    return died;
  }

  protected die() {
    super.die();
    for (let i = 0; i < GameConfig.Boss.AntimatterDrops; i++) {
      EventBus.emit('spawn_antimatter', this.x, this.y, Phaser.Math.Between(-100, 100), Phaser.Math.Between(-50, 50));
    }
    EventBus.emit('boss_destroyed');
  }
}
