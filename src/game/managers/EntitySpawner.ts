import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { EntityManager } from './EntityManager';

import { Boss } from '../entities/Boss';
import { Player } from '../entities/Player';

export class EntitySpawner {
  private scene: Phaser.Scene;
  private entityManager: EntityManager;
  private boss: Boss;
  private player: Player;
  
  private lastEnemySpawn: number = 0;
  private lastAAGunSpawn: number = 0;
  private lastPowerUpSpawn: number = 0;

  constructor(scene: Phaser.Scene, entityManager: EntityManager, boss: Boss, player: Player) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.boss = boss;
    this.player = player;
  }

  public update(time: number, isPlaying: boolean, spawnRateModifier: number = 1.0) {
    if (!isPlaying) return;

    const spawnDelay = 2000 * spawnRateModifier;

    // Spawn enemies
    if (time > this.lastEnemySpawn + spawnDelay) {
      this.lastEnemySpawn = time;
      const enemy = this.entityManager.getEnemy();
      if (enemy) {
        const startX = Phaser.Math.Between(50, this.scene.scale.width - 50);
        enemy.spawn(startX, -50);
      }
    }

    // Enemy firing
    this.entityManager.enemies.children.iterate((child) => {
      const enemy = child as Enemy;
      if (enemy.active && enemy.canFire(time) && enemy.y > 0) {
        const ep = this.entityManager.getEnemyProjectile();
        if (ep) {
          ep.fire(enemy.x, enemy.y + 20, 300);
        }
      }
      return true;
    });

    // Spawn powerups
    if (time > this.lastPowerUpSpawn + Phaser.Math.Between(10000, 20000)) {
      this.lastPowerUpSpawn = time;
      const powerUp = this.entityManager.getPowerUp();
      if (powerUp) {
        const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
        const type = Phaser.Math.FloatBetween(0, 1) > 0.5 ? 'health' : 'weapon';
        powerUp.spawn(x, -50, type);
      }
    }
  }

  public spawnAAGun(time: number) {
    if (time > this.lastAAGunSpawn + 3000) {
      this.lastAAGunSpawn = time;
      const gun = this.entityManager.getAAGun();
      if (gun) {
        gun.setReferences(this.entityManager, this.player);
        const x = Phaser.Math.Between(100, this.scene.scale.width - 100);
        gun.spawn(x, -100, 500);
      }
    }
  }
}
