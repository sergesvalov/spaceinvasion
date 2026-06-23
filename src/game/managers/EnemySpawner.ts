import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { EnemyProjectile } from '../entities/EnemyProjectile';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemies: Phaser.Physics.Arcade.Group;
  private enemyProjectiles: Phaser.Physics.Arcade.Group;
  private lastEnemySpawn: number = 0;

  constructor(
    scene: Phaser.Scene,
    enemies: Phaser.Physics.Arcade.Group,
    enemyProjectiles: Phaser.Physics.Arcade.Group
  ) {
    this.scene = scene;
    this.enemies = enemies;
    this.enemyProjectiles = enemyProjectiles;
  }

  public update(time: number, isPlaying: boolean, spawnRateModifier: number = 1.0) {
    if (!isPlaying) return;

    const spawnDelay = 2000 * spawnRateModifier;

    // Spawn enemies
    if (time > this.lastEnemySpawn + spawnDelay) {
      this.lastEnemySpawn = time;
      const enemy = this.enemies.get() as Enemy;
      if (enemy) {
        const startX = Phaser.Math.Between(50, this.scene.scale.width - 50);
        enemy.spawn(startX, -50);
      }
    }

    // Enemy firing
    this.enemies.children.iterate((child) => {
      const enemy = child as Enemy;
      if (enemy.active && enemy.canFire(time) && enemy.y > 0) {
        const ep = this.enemyProjectiles.get() as EnemyProjectile;
        if (ep) {
          ep.fire(enemy.x, enemy.y + 20, 300);
        }
      }
      return true;
    });
  }
}
