import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EntityManager } from './EntityManager';
import { Boss } from '../entities/Boss';
import { EventBus } from '../../services/EventBus';
import { Enemy } from '../entities/Enemy';
import { EnemyProjectile } from '../entities/EnemyProjectile';

export class Autopilot {
  private scene: Phaser.Scene;
  private player: Player;
  private entityManager: EntityManager;
  private boss: Boss;
  private isEnabled: boolean = false;
  
  private targetX: number;
  private targetY: number;

  constructor(scene: Phaser.Scene, player: Player, entityManager: EntityManager, boss: Boss) {
    this.scene = scene;
    this.player = player;
    this.entityManager = entityManager;
    this.boss = boss;
    this.targetX = player.x;
    this.targetY = player.y;
  }

  public enable() {
    this.isEnabled = true;
    console.log('[Autopilot] Engaged!');
  }

  public update(time: number, delta: number) {
    if (!this.isEnabled) return;

    // Try to transform if we have antimatter
    if (Phaser.Math.Between(0, 100) > 95) {
      EventBus.emit('transform_request');
    }

    // Determine target position based on threats
    let threats: {x: number, y: number, danger: number}[] = [];

    // Add projectiles as threats
    this.entityManager.enemyProjectiles.getChildren().forEach((child) => {
      const p = child as EnemyProjectile;
      if (p.active) {
        threats.push({ x: p.x, y: p.y, danger: 1000 });
      }
    });

    // Add enemies as threats
    this.entityManager.enemies.getChildren().forEach((child) => {
      const e = child as Enemy;
      if (e.active) {
        threats.push({ x: e.x, y: e.y, danger: 500 });
      }
    });

    // Move logic: Find a safe spot
    // Very simple AI: Just stay in the center to shoot the boss, but dodge bullets horizontally
    
    let desiredX = this.scene.scale.width / 2;
    let desiredY = this.scene.scale.height - 150; // Stay near bottom

    let speed = 0.1;

    // Repulsion from threats
    threats.forEach(t => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
      if (dist < 150) {
        // Run away!
        const angle = Phaser.Math.Angle.Between(t.x, t.y, this.player.x, this.player.y);
        const force = (150 - dist) * 5; // The closer it is, the harder we push
        desiredX += Math.cos(angle) * force;
        desiredY += Math.sin(angle) * force;
        speed = 0.5; // Move much faster when dodging
      }
    });

    // Clamp to screen bounds
    desiredX = Phaser.Math.Clamp(desiredX, 50, this.scene.scale.width - 50);
    desiredY = Phaser.Math.Clamp(desiredY, 50, this.scene.scale.height - 50);

    // Smooth movement
    this.player.x += (desiredX - this.player.x) * speed;
    this.player.y += (desiredY - this.player.y) * speed;
  }
}
