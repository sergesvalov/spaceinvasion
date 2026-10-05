import Phaser from 'phaser';
import { EntityManager } from './EntityManager';
import { Boss } from '../entities/Boss';
import { Player } from '../entities/Player';
import { PowerUpType } from '../entities/PowerUp';
import { EnemyType } from '../entities/Enemy';
import { GameConfig } from '../config/GameConfig';
import { EntityConfig } from '../config/EntityConfig';
import { AdStadium } from '../entities/AdStadium';

export class EntitySpawner {
  private scene: Phaser.Scene;
  private entityManager: EntityManager;
  private boss: Boss;
  private player: Player;

  private lastAAGunSpawn: number = 0;
  private lastAlienAAGunSpawn: number = 0;
  private lastPowerUpSpawn: number = 0;
  private alienAAGunCount: number = 0;

  constructor(scene: Phaser.Scene, entityManager: EntityManager, boss: Boss, player: Player) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.boss = boss;
    this.player = player;
  }

  public update(time: number, isPlaying: boolean) {
    if (!isPlaying) return;

    // We only spawn random powerups here now. Waves are handled by WaveManager.
    if (time > this.lastPowerUpSpawn + Phaser.Math.Between(15000, 25000)) {
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

  public spawnSpecificEnemy(x: number, y: number, type: EnemyType) {
    const enemy = this.entityManager.getEnemy();
    if (enemy) {
      enemy.setTarget(this.player);
      enemy.spawn(x, y, type);
    }
  }

  public spawnAAGun(time: number, progress: number) {
    if (progress > 0.6) return;
    const baseDelay = 1500;
    const maxDelay = 5000;
    const delay = Phaser.Math.Linear(baseDelay, maxDelay, progress / 0.6);

    if (time > this.lastAAGunSpawn + delay) {
      this.lastAAGunSpawn = time;
      const gun = this.entityManager.getAAGun();
      if (gun) {
        gun.setReferences(this.entityManager, this.boss);
        const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
        gun.spawn(x, -100, EntityConfig.Background.scrollSpeed * 1000, time);
      }
    }
  }

  public spawnAlienAAGun(time: number, currentPhaseKey: string | null) {
    if (currentPhaseKey !== 'bg_night_city') {
      this.alienAAGunCount = 0;
      return;
    }

    if (this.alienAAGunCount >= GameConfig.AlienAAGun.MaxCount) return;

    if (time > this.lastAlienAAGunSpawn + GameConfig.Spawns.AlienAAGunDelay) {
      this.lastAlienAAGunSpawn = time;
      this.alienAAGunCount++;
      const gun = this.entityManager.getAlienAAGun();
      if (gun) {
        gun.setReferences(this.entityManager, this.player);
        const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
        gun.spawn(x, -100, EntityConfig.Background.scrollSpeed * 1000, time);
      }
    }
  }

  public spawnStadium() {
    const stadium = new AdStadium(this.scene, this.scene.scale.width / 2, -150);
    stadium.spawn(this.scene.scale.width / 2, -150, EntityConfig.Background.scrollSpeed * 1000);
  }
}
