import Phaser from 'phaser';
import { EntityManager } from './EntityManager';

import { Boss } from '../entities/Boss';
import { Player } from '../entities/Player';
import { PowerUpType } from '../entities/PowerUp';

export class EntitySpawner {
  private scene: Phaser.Scene;
  private entityManager: EntityManager;
  private boss: Boss;
  private player: Player;

  private lastEnemySpawn: number = 0;
  private lastAAGunSpawn: number = 0;
  private lastAlienAAGunSpawn: number = 0;
  private lastPowerUpSpawn: number = 0;
  private spawnCount: number = 0;
  private alienAAGunCount: number = 0;

  constructor(scene: Phaser.Scene, entityManager: EntityManager, boss: Boss, player: Player) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.boss = boss;
    this.player = player;
  }

  public update(
    time: number,
    isPlaying: boolean,
    spawnRateModifier: number = 1.0,
    currentPhaseKey: string | null = null,
  ) {
    if (!isPlaying) return;

    const spawnDelay = 2000 * spawnRateModifier;

    // Spawn enemies
    if (time > this.lastEnemySpawn + spawnDelay) {
      this.lastEnemySpawn = time;
      this.spawnCount++;
      // Alternate between random and pattern-based spawns
      let startX: number;
      if (this.spawnCount % 5 === 0) {
        startX = this.scene.scale.width / 2;
      } else if (this.spawnCount % 5 === 1) {
        startX = 50 + this.scene.scale.width / 4;
      } else if (this.spawnCount % 5 === 2) {
        startX = this.scene.scale.width - 50 - this.scene.scale.width / 4;
      } else {
        startX = Phaser.Math.Between(50, this.scene.scale.width - 50);
      }

      // Determine which enemy to spawn based on level phase
      if (currentPhaseKey === 'bg_ocean') {
        const oceanEnemy = this.entityManager.getOceanEnemy();
        if (oceanEnemy) oceanEnemy.spawn(startX, -50);
      } else {
        const enemy = this.entityManager.getEnemy();
        if (enemy) enemy.spawn(startX, -50);
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
        gun.spawn(x, -100, 1500, time);
      }
    }
  }

  public spawnAlienAAGun(time: number, currentPhaseKey: string | null) {
    if (currentPhaseKey !== 'bg_night_city') {
      this.alienAAGunCount = 0;
      return;
    }

    if (this.alienAAGunCount >= 8) return;

    // Spawns one every 4500ms during the 36000ms bg_night_city phase
    if (time > this.lastAlienAAGunSpawn + 4500) {
      this.lastAlienAAGunSpawn = time;
      this.alienAAGunCount++;
      const gun = this.entityManager.getAlienAAGun();
      if (gun) {
        gun.setReferences(this.entityManager, this.player);
        const x = Phaser.Math.Between(100, this.scene.scale.width - 100);
        gun.spawn(x, -100, 1500, time);
      }
    }
  }
}
