import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { EntityManager } from './EntityManager';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private entityManager: EntityManager;
  private lastEnemySpawn: number = 0;

  constructor(scene: Phaser.Scene, entityManager: EntityManager) {
    this.scene = scene;
    this.entityManager = entityManager;
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
  }
}
