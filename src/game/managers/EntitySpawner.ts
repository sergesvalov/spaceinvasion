import Phaser from 'phaser';
import { EntityManager } from './EntityManager';

import { Boss } from '../entities/Boss';
import { PowerUpType } from '../entities/PowerUp';

export class EntitySpawner {
  private scene: Phaser.Scene;
  private entityManager: EntityManager;
  private boss: Boss;
  
  private lastEnemySpawn: number = 0;
  private lastAAGunSpawn: number = 0;
  private lastPowerUpSpawn: number = 0;
  private spawnCount: number = 0;

  constructor(scene: Phaser.Scene, entityManager: EntityManager, boss: Boss) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.boss = boss;
  }

  public update(time: number, isPlaying: boolean, spawnRateModifier: number = 1.0) {
    if (!isPlaying) return;

    const spawnDelay = 2000 * spawnRateModifier;

    // Spawn enemies
    if (time > this.lastEnemySpawn + spawnDelay) {
      this.lastEnemySpawn = time;
      this.spawnCount++;
      const enemy = this.entityManager.getEnemy();
      if (enemy) {
        let startX: number;
        // Alternate between random and pattern-based spawns
        if (this.spawnCount % 5 === 0) {
           // Center
           startX = this.scene.scale.width / 2;
        } else if (this.spawnCount % 5 === 1) {
           // Left sweep
           startX = 50 + (this.scene.scale.width / 4);
        } else if (this.spawnCount % 5 === 2) {
           // Right sweep
           startX = this.scene.scale.width - 50 - (this.scene.scale.width / 4);
        } else {
           // Random
           startX = Phaser.Math.Between(50, this.scene.scale.width - 50);
        }
        enemy.spawn(startX, -50);
      }
    }



    // Spawn powerups
    if (time > this.lastPowerUpSpawn + Phaser.Math.Between(10000, 20000)) {
      this.lastPowerUpSpawn = time;
      const powerUp = this.entityManager.getPowerUp();
      if (powerUp) {
        const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
        const rand = Phaser.Math.FloatBetween(0, 1);
        let type: PowerUpType = 'weapon';
        if (rand < 0.2) type = 'spread';
        else if (rand < 0.4) type = 'homing';
        else if (rand < 0.7) type = 'health';
        
        powerUp.spawn(x, -50, type);
      }
    }
  }

  public spawnAAGun(time: number, progress: number) {
    if (progress > 0.6) return; // Stop spawning after 60% of the level
    
    // Spawn delay increases from 1500ms (at start) to 5000ms (at 60%)
    const baseDelay = 1500;
    const maxDelay = 5000;
    const delay = Phaser.Math.Linear(baseDelay, maxDelay, progress / 0.6);
    
    if (time > this.lastAAGunSpawn + delay) {
      this.lastAAGunSpawn = time;
      const gun = this.entityManager.getAAGun();
      if (gun) {
        gun.setReferences(this.entityManager, this.boss);
        const x = Phaser.Math.Between(100, this.scene.scale.width - 100);
        gun.spawn(x, -100, 500, time);
      }
    }
  }
}
