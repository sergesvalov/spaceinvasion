import Phaser from 'phaser';
import { AnalyticsService } from '../../services/AnalyticsService';

export type PlayerForm = 'fighter' | 'mecha';

export class Player extends Phaser.GameObjects.Container {
  private form: PlayerForm = 'fighter';
  private sprite: Phaser.GameObjects.Sprite;
  private lastFired: number = 0;

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
    // Scale down the generated image as it might be too large
    this.sprite.setScale(0.2); 
    this.add(this.sprite);
    
    this.setFighterForm();
  }

  private setFighterForm() {
    // Later: this.sprite.play('fighter_idle');
    this.sprite.setTint(0xffffff); // Normal color
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(30, 35);
      body.setOffset(-15, -20);
    }
  }

  private setMechaForm() {
    // Later: this.sprite.play('transform_to_mecha');
    this.sprite.setTint(0xffaa00); // Temporary tint to show Mecha form
    
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
