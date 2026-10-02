import Phaser from 'phaser';
import { Boss } from '../Boss';

export class BossMovementComponent {
  private startX: number = 0;
  private timeOffset: number = 0;
  
  constructor(private boss: Boss) {}

  public spawn(x: number, y: number) {
    this.startX = x;
    this.timeOffset = Phaser.Math.Between(0, 1000);
    const body = this.boss.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      // Moves slowly down until it reaches top of screen
      body.setVelocityY(20);
    }
  }

  public update(time: number) {
    const body = this.boss.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Stop moving down once fully on screen
    if (this.boss.y > 100 && body.velocity.y > 0) {
      body.setVelocityY(0);
    }

    // Sinewave horizontal movement
    if (this.boss.y >= 100) {
       this.boss.x = this.startX + Math.sin((time + this.timeOffset) * 0.001) * 80;
    }
  }
}
