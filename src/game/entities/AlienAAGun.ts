import Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import { Player } from './Player';
import { EntityManager } from '../managers/EntityManager';
import { GameConfig } from '../config/GameConfig';

export class AlienAAGun extends BaseEntity {
  private lastFired: number = 0;
  private entityManager!: EntityManager;
  private player!: Player;
  private fireRateMs: number = 1200; // Fires faster than normal enemies

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'alien_aagun');

    this.setScale(1.1);
    this.setDepth(-10); // Below flying objects, above ground

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
    }
  }

  setReferences(entityManager: EntityManager, player: Player) {
    this.entityManager = entityManager;
    this.player = player;
  }

  spawn(x: number, y: number, scrollSpeed: number, time: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.lastFired = time;
    this.hp = GameConfig.Enemy.HP * 5; // Very tanky building!
    this.clearTint();

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(scrollSpeed * 0.85);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    if (this.y > this.scene.scale.height + 150) {
      this.setActive(false);
      this.setVisible(false);
      return;
    }

    if (this.y > 0 && time > this.lastFired + this.fireRateMs) {
      this.fireAtPlayer(time);
    }
  }

  private fireAtPlayer(time: number) {
    if (!this.player || !this.player.active) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
    if (dist > 800) return; // Out of range

    this.lastFired = time;

    const proj = this.entityManager.enemyProjectiles.get();
    if (proj) {
      proj.fire(this.x, this.y - 20, 0); // initial vy=0 since we'll override below

      const angle = Phaser.Math.Angle.Between(this.x, this.y - 20, this.player.x, this.player.y);
      const speed = 340;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const body = proj.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(vx, vy);
      }
    }
  }
}
