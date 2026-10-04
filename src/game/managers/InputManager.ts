import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EntityConfig } from '../config/EntityConfig';
import { EventBus } from '../../services/EventBus';

export class InputManager {
  private scene: Phaser.Scene;
  private player: Player;
  private lastTapTime: number = 0;
  public isActive: boolean = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  private pointerIsDown: boolean = false;
  private lastPointerPos: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  public setupInput() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.wasd = this.scene.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isActive) return;

      if (pointer.rightButtonDown()) {
        EventBus.emit('transform_request');
        return;
      }

      const currentTime = this.scene.time.now;
      if (currentTime - this.lastTapTime < 300) {
        EventBus.emit('transform_request');
      }
      this.lastTapTime = currentTime;

      this.pointerIsDown = true;
      this.lastPointerPos = { x: pointer.x, y: pointer.y };
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isActive || !this.pointerIsDown) return;

      const dx = pointer.x - this.lastPointerPos.x;
      const dy = pointer.y - this.lastPointerPos.y;

      this.player.x += dx * 1.5;
      this.player.y += dy * 1.5;

      this.lastPointerPos = { x: pointer.x, y: pointer.y };
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.pointerIsDown = false;

      const swipeTime = pointer.upTime - pointer.downTime;
      const dx = pointer.upX - pointer.downX;
      const dy = pointer.upY - pointer.downY;

      // Keep dash feature for quick swipes!
      if (swipeTime < 300 && (Math.abs(dx) > 100 || Math.abs(dy) > 100)) {
        const len = Math.sqrt(dx * dx + dy * dy);
        EventBus.emit('dash_request', { dx: dx / len, dy: dy / len });
      }
    });

    const spaceBar = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceBar?.on('down', () => {
      if (this.isActive) {
        EventBus.emit('shield_request');
      }
    });

    const bKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    bKey?.on('down', () => {
      if (this.isActive) {
        EventBus.emit('bomb_request');
      }
    });

    const eKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    eKey?.on('down', () => {
      if (this.isActive) {
        EventBus.emit('transform_request');
      }
    });
  }

  public update() {
    if (!this.isActive || this.player.isDashing) return;

    const speed = EntityConfig.Player.speed;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += speed;

    if (vx !== 0 || vy !== 0) {
      body.setVelocity(vx, vy);
    } else {
      body.setVelocity(0, 0);
    }

    // Boundary check since we modify .x and .y directly in touch drag
    const halfWidth = 18;
    const halfHeight = 18;
    if (this.player.x < halfWidth) this.player.x = halfWidth;
    if (this.player.x > this.scene.scale.width - halfWidth)
      this.player.x = this.scene.scale.width - halfWidth;
    if (this.player.y < halfHeight) this.player.y = halfHeight;
    if (this.player.y > this.scene.scale.height - halfHeight)
      this.player.y = this.scene.scale.height - halfHeight;
  }
}
