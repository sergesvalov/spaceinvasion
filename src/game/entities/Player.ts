import Phaser from 'phaser';
import { AnalyticsService } from '../../services/AnalyticsService';

export type PlayerForm = 'fighter' | 'mecha';

export class Player extends Phaser.GameObjects.Container {
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
    // Scale down by 80% (0.2 -> 0.04) and set screen blend mode for transparent background
    this.sprite.setScale(0.04); 
    this.sprite.setBlendMode(Phaser.BlendModes.SCREEN);
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
    this.exhaustEmitter.startFollow(this, 0, 30);
    
    this.setFighterForm();
  }

  private setFighterForm() {
    // Later: this.sprite.play('fighter_idle');
    this.sprite.setTint(0xffffff); // Normal color
    
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setConfig({
        speedY: { min: 200, max: 400 },
        speedX: { min: -20, max: 20 },
        scale: { start: 1.5, end: 0 },
        tint: [0x00aaff, 0x0044ff]
      });
      this.exhaustEmitter.startFollow(this, 0, 30);
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(30, 35);
      body.setOffset(-15, -20);
    }
  }

  private setMechaForm() {
    // Later: this.sprite.play('transform_to_mecha');
    this.sprite.setTint(0xffaa00); // Temporary tint to show Mecha form
    
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setConfig({
        speedY: { min: 100, max: 200 },
        speedX: { min: -30, max: 30 },
        scale: { start: 2.5, end: 0 },
        tint: [0xffaa00, 0xff4400]
      });
      this.exhaustEmitter.startFollow(this, 0, 40);
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(40, 40);
      body.setOffset(-20, -20);
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
    const fireRate = this.form === 'fighter' ? 150 : 300;
    if (time > this.lastFired + fireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
  }
}
