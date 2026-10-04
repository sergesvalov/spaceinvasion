import Phaser from 'phaser';
import { AnalyticsService } from '../../services/AnalyticsService';
import { EntityConfig } from '../config/EntityConfig';
import { EntityManager } from '../managers/EntityManager';
import { burst } from '../effects/burst';

import { GameState } from '../../services/GameState';
import {
  PlayerContext,
  PlayerStateComponent,
  FighterState,
  MechaState,
} from './components/PlayerStateComponent';
import { WeaponComponent } from './components/WeaponComponent';
import { MovementComponent } from './components/MovementComponent';
import { ShieldComponent } from './components/ShieldComponent';

export type PlayerForm = 'fighter' | 'mecha';

export class Player extends Phaser.GameObjects.Container {
  /** 18px NES sprite x2 = 36px (~13% of the 270px-wide virtual screen). */
  public static readonly SPRITE_SCALE = EntityConfig.Player.scale;
  /** Forgiving shmup-style hitbox, smaller than the visible ship. */
  public static readonly HITBOX_SIZE = 24;
  public weaponLevel: number;
  private form: PlayerForm = 'fighter';
  private sprite: Phaser.GameObjects.Sprite;
  private shieldGraphics: Phaser.GameObjects.Graphics;
  private exhaustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private currentStateComponent: PlayerStateComponent;
  private fighterState: FighterState;
  private mechaState: MechaState;

  private weaponComponent: WeaponComponent;
  private movementComponent: MovementComponent;
  private shieldComponent: ShieldComponent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.weaponLevel = GameState.getInstance().weaponLevel;

    // A Container has no size by default (displayOriginX = 0), so Arcade would
    // create a 64x64 body anchored at the top-left corner of the ship. Size it
    // BEFORE enabling physics so the hitbox is small and centered.
    this.setSize(Player.HITBOX_SIZE, Player.HITBOX_SIZE);

    // We add an arcade physics body to the container
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCollideWorldBounds(true);
    }

    this.sprite = scene.add.sprite(0, 0, 'player_fighter');
    this.sprite.setScale(Player.SPRITE_SCALE);
    this.add(this.sprite);

    this.shieldGraphics = scene.add.graphics();
    this.shieldGraphics.lineStyle(4, 0x0038ce, 1); // Thick blue NES border
    this.shieldGraphics.strokeRect(-24, -24, 48, 48);
    this.shieldGraphics.lineStyle(2, 0xffffffff, 1); // Inner white highlight
    this.shieldGraphics.strokeRect(-21, -21, 42, 42);
    this.shieldGraphics.setVisible(false);
    this.add(this.shieldGraphics);

    this.exhaustEmitter = scene.add.particles(0, 0, 'particle', {
      speedY: { min: 200, max: 400 },
      speedX: { min: -20, max: 20 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'NORMAL',
      lifespan: 300,
      tint: [0x00aaff, 0x0044ff],
      frequency: 20,
    });
    this.exhaustEmitter.startFollow(this, 0, 20);

    this.fighterState = new FighterState();
    this.mechaState = new MechaState();

    this.currentStateComponent = this.fighterState;
    this.currentStateComponent.enter(this.getPlayerContext());

    this.weaponComponent = new WeaponComponent(this, scene);
    this.movementComponent = new MovementComponent(this, scene);
    this.shieldComponent = new ShieldComponent(this, scene);
  }

  public getSprite() {
    return this.sprite;
  }

  public get isDashing(): boolean {
    return this.movementComponent.isDashing;
  }

  private getPlayerContext(): PlayerContext {
    return {
      x: this.x,
      y: this.y,
      sprite: this.sprite,
      body: this.body as Phaser.Physics.Arcade.Body,
      exhaustEmitter: this.exhaustEmitter,
      shieldGraphics: this.shieldGraphics,
      scene: this.scene,
    };
  }

  public transformToMecha() {
    if (this.form === 'mecha') return;
    this.form = 'mecha';
    AnalyticsService.getInstance().formSwitch('mecha');

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }

    this.currentStateComponent.exit(this.getPlayerContext());
    this.currentStateComponent = this.mechaState;
    this.currentStateComponent.enter(this.getPlayerContext());
  }

  public revertToFighter() {
    if (this.form === 'fighter') return;
    this.form = 'fighter';
    AnalyticsService.getInstance().formSwitch('fighter');

    this.currentStateComponent.exit(this.getPlayerContext());
    this.currentStateComponent = this.fighterState;
    this.currentStateComponent.enter(this.getPlayerContext());
  }

  public getForm(): PlayerForm {
    return this.form;
  }

  public dash(dx: number, dy: number, time: number) {
    this.movementComponent.dash(dx, dy, time);
  }

  public activatePurchasedShield() {
    this.shieldComponent.activatePurchasedShield();
  }

  public isShielded(): boolean {
    return this.shieldComponent.isShielded();
  }

  public setTempWeapon(type: 'spread' | 'homing', duration: number) {
    this.weaponComponent.setTempWeapon(type, duration);
  }

  public canFire(time: number): boolean {
    return this.weaponComponent.canFire(time);
  }

  public canFireSwarm(time: number): boolean {
    return this.weaponComponent.canFireSwarm(time);
  }

  public fireSwarm(entityManager: EntityManager) {
    this.weaponComponent.fireSwarm(entityManager);
  }

  public updateMelee(entityManager: EntityManager, time: number) {
    this.currentStateComponent.update(this.getPlayerContext(), entityManager, time);
  }

  public explode() {
    this.setVisible(false);
    this.exhaustEmitter.stop();

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setEnable(false);
    }

    // Main fiery explosion
    burst(this.scene, this.x, this.y, 100, {
      speed: { min: 100, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 3, end: 0 },
      blendMode: 'NORMAL',
      lifespan: 800,
      tint: [0xffaa00, 0xff0000, 0xffff00, 0xffffff],
    });

    // Shockwave ring
    burst(this.scene, this.x, this.y, 1, {
      speed: 600,
      scale: { start: 0, end: 15 },
      alpha: { start: 0.8, end: 0 },
      blendMode: 'NORMAL',
      lifespan: 400,
      tint: 0xffdd00,
    });

    // Debris
    burst(this.scene, this.x, this.y, 30, {
      speed: { min: 50, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1500,
      tint: 0x555555,
    });
  }

  public fire(entityManager: EntityManager) {
    this.weaponComponent.fire(entityManager);
  }

  public updateVisuals() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      const vx = body.velocity.x;
      const targetRotation = (vx / 200) * 0.25;
      this.sprite.rotation += (targetRotation - this.sprite.rotation) * 0.2;
    }
  }
}
