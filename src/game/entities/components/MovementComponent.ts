import Phaser from 'phaser';
import { Player } from '../Player';

export class MovementComponent {
  public isDashing: boolean = false;
  private lastDashTime: number = 0;

  constructor(private player: Player, private scene: Phaser.Scene) {}

  public dash(dx: number, dy: number, time: number) {
    if (this.player.getForm() !== 'mecha') return;
    if (time - this.lastDashTime < 1500) return; // 1.5s cooldown
    if (this.isDashing) return;

    this.lastDashTime = time;
    this.isDashing = true;
    
    this.scene.cameras.main.shake(150, 0.01);
    
    // Ghost trail effect
    this.scene.time.addEvent({
      delay: 30,
      repeat: 5,
      callback: () => {
        const sprite = this.player.getSprite();
        const ghost = this.scene.add.sprite(this.player.x, this.player.y, sprite.texture.key);
        ghost.setScale(sprite.scaleX, sprite.scaleY);
        ghost.setTint(0x00ffff);
        this.scene.tweens.add({
          targets: ghost,
          alpha: 0,
          scale: sprite.scaleX * 1.2,
          duration: 300,
          onComplete: () => ghost.destroy()
        });
      }
    });

    this.scene.tweens.add({
      targets: this.player,
      x: this.player.x + dx * 150,
      y: this.player.y + dy * 150,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.isDashing = false;
      }
    });
  }
}
