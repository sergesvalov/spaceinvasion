import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { GameConfig } from '../config/GameConfig';
import { BossMovementComponent } from './components/BossMovementComponent';
import { BossAttackComponent } from './components/BossAttackComponent';
import { EventBus } from '../../services/EventBus';
import { EntityManager } from '../managers/EntityManager';
import { BossPart } from './BossPart';
import { getHpMultiplier, getStage } from '../config/WaveConfig';

export class Boss extends BaseEntity {
  private exhaustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private movementComponent: BossMovementComponent;
  private attackComponent: BossAttackComponent;
  public parts: BossPart[] = [];
  /** Stage 1..4 that picks the boss's look and attack patterns (New Game+ loops it). */
  public readonly stage: number;
  public readonly maxHp: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private entityManager: EntityManager,
    level: number,
    onSpawnKamikaze: (x: number, y: number) => void,
  ) {
    const stage = getStage(level);
    const texture = stage === 4 ? 'boss_mech' : 'boss';
    super(scene, x, y, texture);
    this.stage = stage;
    this.maxHp = GameConfig.Boss.HP * (stage === 4 ? 2.5 : 1) * getHpMultiplier(level);

    // Adjust scale depending on the texture
    if (stage === 4) {
      this.setScale(1); // boss_mech.png is pre-scaled to 256px by scripts/optimize-assets.cjs
      this.setAngle(180); // Rotate to face downwards towards the player
    } else {
      this.setScale(3.3);
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
    }

    this.exhaustEmitter = scene.add.particles(0, 0, 'cloud_particle', {
      speedY: { min: -100, max: -300 }, // boss points down, engine is at the top
      speedX: { min: -20, max: 20 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: 'NORMAL',
      lifespan: 600,
      tint: [0xff0000, 0xff5500],
      frequency: 30,
    });
    this.exhaustEmitter.startFollow(this, 0, -30);
    this.exhaustEmitter.stop(); // default stopped until spawned

    this.movementComponent = new BossMovementComponent(this);
    this.attackComponent = new BossAttackComponent(
      this,
      entityManager.enemyProjectiles.getGroup(),
      onSpawnKamikaze,
    );
  }

  spawn(x: number, y: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.hp = this.maxHp;
    this.clearTint();

    this.movementComponent.spawn(x, y);
    this.exhaustEmitter.start();

    this.parts = [];
    const t1 = this.entityManager.getBossPart();
    if (t1) {
      t1.spawn(this, -50, 30, 'turret');
      this.parts.push(t1);
    }
    const t2 = this.entityManager.getBossPart();
    if (t2) {
      t2.spawn(this, 50, 30, 'turret');
      this.parts.push(t2);
    }
    const gen = this.entityManager.getBossPart();
    if (gen) {
      gen.spawn(this, 0, -40, 'generator');
      this.parts.push(gen);
    }
  }

  onPartDestroyed(part: BossPart) {
    this.parts = this.parts.filter((p) => p !== part);
    this.takeDamage(20);
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
      EventBus.emit(
        'spawn_antimatter',
        this.x,
        this.y,
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-50, 50),
      );
    }
    EventBus.emit('boss_destroyed');
  }
}
