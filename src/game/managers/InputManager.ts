import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class InputManager {
  private scene: Phaser.Scene;
  private player: Player;
  private lastTapTime: number = 0;
  public isActive: boolean = false;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  public setupInput() {
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.isActive) {
        this.player.x = Phaser.Math.Linear(this.player.x, pointer.x, 0.5);
        this.player.y = Phaser.Math.Linear(this.player.y, pointer.y - 50, 0.5);
      }
    });

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isActive) return;
      if (pointer.rightButtonDown()) {
        this.player.switchForm();
      } else {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastTapTime < 300) {
          this.player.switchForm();
        }
        this.lastTapTime = currentTime;
        this.player.x = pointer.x;
        this.player.y = pointer.y - 50;
      }
    });
  }
}
