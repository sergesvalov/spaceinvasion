import Phaser from 'phaser';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameConfig } from '../config/GameConfig';

export type PlayerForm = 'fighter' | 'mecha';

export class Player extends Phaser.GameObjects.Container {
  public weaponLevel: number = 1;
  private form: PlayerForm = 'fighter';
  private sprite: Phaser.GameObjects.Sprite;
  private lastFired: number = 0;
  private exhaustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    
    // We add an arcade physics body to the container
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCollideWorldBounds(true);
      // Adjust hitbox size
      body.setSize(30, 30);
      body.setOffset(-15, -15);
    }

    this.sprite = scene.add.sprite(0, 0, 'ship');
    // Scale is increased by 30% from 0.04 to 0.052. True alpha transparency is now in the image.
    this.sprite.setScale(0.0624);
    this.add(this.sprite);

    this.exhaustEmitter = scene.add.particles(0, 0, 'particle', {
      speedY: { min: 200, max: 400 },
      speedX: { min: -20, max: 20 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      tint: [0x00aaff, 0x0044ff],
      frequency: 20
    });
    this.exhaustEmitter.startFollow(this, 0, 36);
    
    this.setFighterForm();
  }

  private setFighterForm() {
    this.sprite.setTint(0xffffff); // Normal color
    
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setConfig({
        speedY: { min: 200, max: 400 },
        speedX: { min: -20, max: 20 },
        scale: { start: 1.5, end: 0 },
        tint: [0x00aaff, 0x0044ff]
      });
      this.exhaustEmitter.startFollow(this, 0, 36);
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(36, 42);
      body.setOffset(-18, -24);
    }
  }

  private setMechaForm() {
    this.sprite.setTint(0xffaa00); // Temporary tint to show Mecha form
    
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setConfig({
        speedY: { min: 100, max: 200 },
        speedX: { min: -30, max: 30 },
        scale: { start: 2.5, end: 0 },
        tint: [0xffaa00, 0xff4400]
      });
      this.exhaustEmitter.startFollow(this, 0, 48);
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(48, 48);
      body.setOffset(-24, -24);
    }
  }

  public switchForm() {
    this.form = this.form === 'fighter' ? 'mecha' : 'fighter';
    AnalyticsService.getInstance().formSwitch(this.form);

    // Haptic feedback for Telegram WebApp
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    if (this.form === 'fighter') {
      this.setFighterForm();
    } else {
      this.setMechaForm();
    }
  }

  public getForm(): PlayerForm {
    return this.form;
  }
  
  public canFire(time: number): boolean {
    let fireRate = this.form === 'fighter' ? GameConfig.Player.FireRateFighter : GameConfig.Player.FireRateMecha;
    
    if (this.weaponLevel >= 2) {
      fireRate *= 0.6; // 40% faster fire rate for upgraded weapons
    }

    if (time > this.lastFired + fireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
  }

  public explode() {
    this.setVisible(false);
    this.exhaustEmitter.stop();
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setEnable(false);
    }

    // Main fiery explosion
    const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 100, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 3, end: 0 },
      blendMode: 'ADD',
      lifespan: 800,
      tint: [0xffaa00, 0xff0000, 0xffff00, 0xffffff],
      quantity: 100
    });
    emitter.explode(100);

    // Shockwave ring
    const shockwave = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: 600,
      scale: { start: 0, end: 15 },
      alpha: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 400,
      tint: 0xffdd00,
      quantity: 1
    });
    shockwave.explode(1);

    // Debris
    const debris = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1500,
      tint: 0x555555,
      quantity: 30
    });
    debris.explode(30);
  }
}
