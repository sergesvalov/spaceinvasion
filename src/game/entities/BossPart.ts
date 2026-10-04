import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { Boss } from './Boss';
import { burst } from '../effects/burst';

export type BossPartType = 'turret' | 'generator';

export class BossPart extends BaseEntity {
  private boss!: Boss;
  public offsetX: number = 0;
  public offsetY: number = 0;
  public partType!: BossPartType;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss'); // We will just scale/tint a generic texture for now
  }

  public spawn(boss: Boss, offsetX: number, offsetY: number, type: BossPartType) {
    this.boss = boss;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.partType = type;

    this.hp = type === 'turret' ? 20 : 40;

    if (type === 'turret') {
      this.setTexture('enemy_scout_0');
      this.setScale(1.5);
      this.setTint(0xff5555);
    } else {
      this.setTexture('enemy_scout_1');
      this.setScale(2);
      this.setTint(0x00ffcc);
    }

    this.setActive(true);
    this.setVisible(true);
    this.clearTint();
    // Re-apply tint because clearTint removes it
    if (type === 'turret') this.setTint(0xff5555);
    else this.setTint(0x00ffcc);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setEnable(true);
    }
  }

  public preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    if (!this.boss || !this.boss.active) {
      this.die(); // Die if boss is gone
      return;
    }

    this.x = this.boss.x + this.offsetX;
    this.y = this.boss.y + this.offsetY;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.x = this.x - body.width / 2;
      body.y = this.y - body.height / 2;
    }
  }

  protected die() {
    super.die();
    this.scene.cameras.main.shake(150, 0.01);
    burst(this.scene, this.x, this.y, 40, {
      speed: { min: 100, max: 300 },
      scale: { start: 1.5, end: 0 },
      tint: [0xff0000, 0xffff00],
      blendMode: 'ADD',
    });

    if (this.boss && this.boss.active) {
      this.boss.onPartDestroyed(this);
    }
  }
}
