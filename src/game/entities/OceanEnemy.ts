import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { GameConfig } from '../config/GameConfig';
import { EventBus } from '../../services/EventBus';

export class OceanEnemy extends BaseEntity {
  private startX: number = 0;
  private timeOffset: number = 0;
  private lastFired: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ocean_enemy');
  }

  spawn(x: number, y: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.startX = x;
    this.timeOffset = Phaser.Math.Between(0, 1000);
    this.hp = GameConfig.Enemy.HP * 2; // Tougher than normal enemies
    this.clearTint();

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(350); // Very fast dive bomber
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    // Zig-zag fast horizontal movement
    this.x = this.startX + Math.sin((time + this.timeOffset) * 0.005) * 120;

    if (this.y > 0 && this.canFire(time)) {
      // Fire 3 bullets in a spread
      EventBus.emit('enemy_fire', this.x - 15, this.y + 20, 300);
      EventBus.emit('enemy_fire', this.x, this.y + 30, 300);
      EventBus.emit('enemy_fire', this.x + 15, this.y + 20, 300);
    }

    if (this.y > this.scene.scale.height + 50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  protected die() {
    super.die();
    this.scene.cameras.main.shake(150, 0.008);
    EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points * 2);
    if (Phaser.Math.FloatBetween(0, 1) <= GameConfig.Enemy.AntimatterDropChance * 1.5) {
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
    if (time > this.lastFired + 1200) {
      // Slower fire rate but triple shot
      this.lastFired = time;
      return true;
    }
    return false;
  }
}
