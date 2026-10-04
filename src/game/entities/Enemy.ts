import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { EntityConfig } from '../config/EntityConfig';
import { GameConfig } from '../config/GameConfig';
import { EventBus } from '../../services/EventBus';

export type EnemyType = 'scout_0' | 'scout_1' | 'carrier' | 'kamikaze' | 'zigzag';

export class Enemy extends BaseEntity {
  private enemyType: EnemyType = 'scout_0';
  private startX: number = 0;
  private timeOffset: number = 0;
  private lastFired: number = 0;
  private exhaustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private target: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_scout_0');

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      // Texture pixels, multiplied by the sprite scale below -> ~3px hitbox.
      // Kept identical to the pre-resize value (48 on the old 1024px texture).
    }

    this.setScale(EntityConfig.Enemy.scaleBase);

    this.exhaustEmitter = scene.add.particles(0, 0, 'particle', {
      speedY: { min: -100, max: -200 },
      speedX: { min: -15, max: 15 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'NORMAL',
      lifespan: 300,
      tint: [0xff0000, 0xff5500],
      frequency: 20,
    });
    this.exhaustEmitter.startFollow(this, 0, -30);
    this.exhaustEmitter.stop();
  }

  setTarget(target: Phaser.GameObjects.Container) {
    this.target = target;
  }

  spawn(x: number, y: number, type: EnemyType = 'scout_0') {
    this.enemyType = type;
    if (type === 'scout_0') {
      this.setTexture('enemy_scout_0');
      this.setScale(EntityConfig.Enemy.scaleBase);
      this.hp = GameConfig.Enemy.HP;
      this.clearTint();
    } else if (type === 'scout_1') {
      this.setTexture('enemy_scout_1');
      this.setScale(EntityConfig.Enemy.scaleBase);
      this.hp = GameConfig.Enemy.HP * 2;
      this.clearTint();
    } else if (type === 'carrier') {
      this.setTexture('enemy_scout_1');
      this.setScale(EntityConfig.Enemy.scaleCarrier);
      this.hp = GameConfig.Enemy.HP * 10;
      this.setTint(0xff8800);
    } else if (type === 'kamikaze') {
      this.setTexture('enemy_scout_0');
      this.setScale(EntityConfig.Enemy.scaleBase);
      this.hp = GameConfig.Enemy.HP * 1.5;
      this.setTint(0xff0000);
    } else if (type === 'zigzag') {
      this.setTexture('enemy_scout_1');
      this.setScale(EntityConfig.Enemy.scaleBase);
      this.hp = GameConfig.Enemy.HP;
      this.setTint(0xff00ff);
    }

    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.exhaustEmitter.start();
    this.startX = x;
    this.timeOffset = Phaser.Math.Between(0, 1000);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(EntityConfig.Enemy.diveSpeed); // Faster falling like in Crisis Force
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    // Movement based on type
    if (this.enemyType === 'scout_0') {
      this.x =
        this.startX + Math.sin((time + this.timeOffset) * EntityConfig.Enemy.scout0Freq) * 60;
    } else if (this.enemyType === 'scout_1') {
      // Dive straight down, faster
      this.y += delta * EntityConfig.Enemy.scout1YDelta;
    } else if (this.enemyType === 'carrier') {
      // Slow hover
      this.x =
        this.startX + Math.sin((time + this.timeOffset) * EntityConfig.Enemy.carrierFreq) * 30;
      this.y += delta * EntityConfig.Enemy.carrierYDelta; // very slow descent
    } else if (this.enemyType === 'kamikaze') {
      // Accelerate towards player
      if (this.target && this.target.active) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const speed = EntityConfig.Enemy.diveSpeed * 1.5;
        this.x += Math.cos(angle) * speed * (delta / 1000);
        this.y += Math.sin(angle) * speed * (delta / 1000);
      } else {
        this.y += delta * EntityConfig.Enemy.scout1YDelta * 1.5;
      }
    } else if (this.enemyType === 'zigzag') {
      // Sharp zigzags
      this.y += delta * EntityConfig.Enemy.scout1YDelta * 0.8;
      const cycle = ((time + this.timeOffset) % 2000) / 2000;
      this.x = this.startX + (cycle < 0.5 ? 1 : -1) * 80 * (cycle < 0.25 || cycle >= 0.75 ? 1 : -1);
    }

    if (
      this.y > 0 &&
      this.canFire(time) &&
      this.enemyType !== 'carrier' &&
      this.enemyType !== 'kamikaze'
    ) {
      EventBus.emit('enemy_fire', this.x, this.y + 20, EntityConfig.Enemy.projectileSpeed);
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
    EventBus.emit('enemy_destroyed', GameConfig.Enemy.Points, this.x, this.y);

    if (this.enemyType === 'carrier') {
      // Hit-stop for juicy effect on elite kills
      this.scene.physics.world.isPaused = true;
      setTimeout(() => {
        if (this.scene && this.scene.physics) {
          this.scene.physics.world.isPaused = false;
        }
      }, 40);

      // Carriers drop weapons!
      EventBus.emit('spawn_powerup', this.x, this.y, 'weapon');
    } else {
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
  }

  canFire(time: number): boolean {
    if (time > this.lastFired + GameConfig.Enemy.FireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
  }
}
