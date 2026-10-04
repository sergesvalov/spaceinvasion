import { LevelManager } from './LevelManager';
import { EntitySpawner } from './EntitySpawner';
import { GameController } from './GameController';

export class WaveManager {
  constructor(
    private levelManager: LevelManager,
    private entitySpawner: EntitySpawner,
    private gameController: GameController,
  ) {}

  public update(time: number, delta: number) {
    this.levelManager.update(time, delta);

    if (!this.gameController.getIsPlaying()) return;

    const levelProgress = this.levelManager.getLevelProgress(time);
    this.entitySpawner.spawnAAGun(time, levelProgress);

    const currentPhaseKey = this.levelManager.getCurrentPhaseKey();
    this.entitySpawner.spawnAlienAAGun(time, currentPhaseKey);

    const baseModifier = this.levelManager.getCurrentSpawnModifier();
    // Decrease modifier (increase spawn rate) by 5% per 1000 points, capped at 0.3 (30% of original time)
    const scoreModifier = Math.max(
      0.3,
      1 - Math.floor(this.gameController.getScore() / 1000) * 0.05,
    );
    const ddaModifier = this.gameController.getDDAModifier(time);

    const finalModifier = baseModifier * scoreModifier * ddaModifier;

    this.entitySpawner.update(
      time,
      true, // GameController already checked isPlaying
      finalModifier,
      currentPhaseKey,
    );
  }
}
