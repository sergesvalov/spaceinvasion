import Phaser from 'phaser';
import { Player } from './Player';
import { BaseEntity } from './BaseEntity';
import { GameConfig } from '../config/GameConfig';
import { EntityManager } from '../managers/EntityManager';

export class AAGun extends BaseEntity {
  private lastFired: number = 0;
  private entityManager!: EntityManager;
  private player!: Player;
  private fireRateMs: number = GameConfig.AAGun.FireRate;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'aagun');

    // Scale down the generated asset if needed
    this.setScale(0.15); 
    this.setDepth(-10); // Sit on top of buildings but below flying ships

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(200, 200); // adjust as needed based on scale
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
    this.lastFired = time; // Reset fire timer when spawned
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      // To match background scroll speed exactly, velocityY should be 0.5 * 1000 = 500
      body.setVelocityY(scrollSpeed);
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

    // Only fire if on screen
    if (this.y > 0 && time > this.lastFired + this.fireRateMs) {
      this.fireAtNearestEnemy(time);
    }
  }

  private fireAtNearestEnemy(time: number) {
    // AAGun is hostile, so it targets the player
    let target: Phaser.GameObjects.Sprite | null = null;

    if (this.player && this.player.active) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
      if (dist < 800) { // Max range
        target = this.player as unknown as Phaser.GameObjects.Sprite;
      }
    }

    if (target) {
      this.lastFired = time;
      
      const proj = this.entityManager.getAAGunProjectile();
      if (proj) {
        proj.fire(this.x, this.y - 20, 0, GameConfig.AAGun.Damage); // Fire upwards initially, then correct velocity
        
        // Calculate velocity vector
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const speed = 600;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const body = proj.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(vx, vy);
        }
      }
    }
  }
}
