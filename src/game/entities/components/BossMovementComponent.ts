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
      body.setVelocityY(17);
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
      const isPhase2 = this.boss.getData('phase2');
      let speedMultiplier = isPhase2 ? 0.002125 : 0.00085;
      let widthMultiplier = isPhase2 ? 120 : 80;

      if (this.boss.level === 2) {
        speedMultiplier *= 1.3;
        widthMultiplier *= 1.2;
      } else if (this.boss.level >= 3) {
        speedMultiplier *= 1.6;
        widthMultiplier *= 1.5;
      }

      this.boss.x =
        this.startX + Math.sin((time + this.timeOffset) * speedMultiplier) * widthMultiplier;
    }
  }
}
