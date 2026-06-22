import Phaser from 'phaser';
import { AnalyticsService } from '../../services/AnalyticsService';

export type PlayerForm = 'fighter' | 'mecha';

export class Player extends Phaser.GameObjects.Container {
  private form: PlayerForm = 'fighter';
  private visual: Phaser.GameObjects.Graphics;
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

    this.visual = scene.add.graphics();
    this.add(this.visual);
    
    this.drawFighter();
  }

  private drawFighter() {
    this.visual.clear();
    this.visual.fillStyle(0x00aaff, 1);
    // Draw a simple triangle for fighter
    this.visual.fillTriangle(0, -20, -15, 15, 15, 15);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(30, 35);
      body.setOffset(-15, -20);
    }
  }

  private drawMecha() {
    this.visual.clear();
    this.visual.fillStyle(0xffaa00, 1);
    // Draw a blockier shape for mecha
    this.visual.fillRect(-15, -15, 30, 30);
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(30, 30);
      body.setOffset(-15, -15);
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
      this.drawFighter();
    } else {
      this.drawMecha();
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
