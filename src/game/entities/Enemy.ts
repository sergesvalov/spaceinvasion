import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { GameConfig } from '../config/GameConfig';
import { EventBus } from '../../services/EventBus';

export class Enemy extends BaseEntity {
  private startX: number = 0;
  private timeOffset: number = 0;
  private lastFired: number = 0;
  private exhaustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'game_atlas', 'enemy');

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      // Texture pixels, multiplied by the sprite scale below -> ~3px hitbox.
      // Kept identical to the pre-resize value (48 on the old 1024px texture).
      body.setSize(6, 6);
    }

    this.setScale(0.5488);

    this.exhaustEmitter = scene.add.particles(0, 0, 'particle', {
      speedY: { min: -100, max: -200 },
      speedX: { min: -15, max: 15 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      tint: [0xff0000, 0xff5500],
      frequency: 20,
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
    this.hp = GameConfig.Enemy.HP;
    this.clearTint();

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(250); // Faster falling like in Crisis Force
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    // Aggressive sweeping movement
    this.x = this.startX + Math.sin((time + this.timeOffset) * 0.003) * 100;

    if (this.y > 0 && this.canFire(time)) {
      EventBus.emit('enemy_fire', this.x, this.y + 20, 300);
    }

    if (this.y > this.scene.scale.height + 50) {
      this.setActive(false);
      this.setVisible(false);
      this.exhaustEmitter.stop();
    }
  }

  protected die() {
    super.die();
    this.scene.cameras.main.shake(100, 0.005);
    EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points);
    if (Phaser.Math.FloatBetween(0, 1) <= GameConfig.Enemy.AntimatterDropChance) {
      EventBus.emit(
        'spawn_antimatter',
        this.x,
        this.y,
        Phaser.Math.Between(-20, 20),
        Phaser.Math.Between(30, 70),
      );
    }
  }

  canFire(time: number): boolean {
    if (time > this.lastFired + GameConfig.Enemy.FireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
  }
}
