import { LevelManager } from './LevelManager';
import { EntitySpawner } from './EntitySpawner';
import { GameController } from './GameController';
import { StageConfig, WaveDef } from '../config/WaveConfig';

export class WaveManager {
  private waves: (WaveDef & { fired: boolean })[];
  private pendingStadiums: number[];
  private levelStartTime: number = 0;

  constructor(
    private levelManager: LevelManager,
    private entitySpawner: EntitySpawner,
    private gameController: GameController,
    private stage: StageConfig,
  ) {
    this.waves = stage.waves.map((w) => ({ ...w, fired: false }));
    this.pendingStadiums = [...stage.stadiumTimes];
  }

  public update(time: number, delta: number) {
    this.levelManager.update(time, delta);

    if (this.levelStartTime === 0) {
      this.levelStartTime = time;
    }

    if (!this.gameController.getIsPlaying()) return;

    if (this.stage.friendlyAAGuns) {
      this.entitySpawner.spawnAAGun(time, this.levelManager.getLevelProgress(time));
    }

    // Ground turrets only make sense while the level scrolls, not during the boss fight
    if (this.stage.alienAAGuns && this.levelManager.getCurrentPhaseKey() !== null) {
      this.entitySpawner.spawnAlienAAGun(time);
    }

    const timeSinceStart = time - this.levelStartTime;

    for (const wave of this.waves) {
      if (!wave.fired && timeSinceStart >= wave.at) {
        wave.fired = true;
        this.spawnWave(wave);
      }
    }

    while (this.pendingStadiums.length > 0 && timeSinceStart >= this.pendingStadiums[0]) {
      this.pendingStadiums.shift();
      this.entitySpawner.spawnStadium();
    }

    this.entitySpawner.update(time, true);
  }

  private spawnWave(wave: WaveDef) {
    const startX = wave.x ?? 135;
    const spacing = wave.spacing;

    if (wave.pattern === 'SINGLE') {
      this.entitySpawner.spawnWaveEnemy(startX, -30, wave.enemy);
    } else if (wave.pattern === 'LINE') {
      const totalWidth = (wave.count - 1) * spacing;
      let x = startX - totalWidth / 2;
      for (let i = 0; i < wave.count; i++) {
        this.entitySpawner.spawnWaveEnemy(x, -30, wave.enemy);
        x += spacing;
      }
    } else if (wave.pattern === 'V') {
      const mid = Math.floor(wave.count / 2);
      for (let i = 0; i < wave.count; i++) {
        const offset = Math.abs(mid - i);
        const x = startX + (i - mid) * spacing;
        const y = -30 - offset * spacing;
        this.entitySpawner.spawnWaveEnemy(x, y, wave.enemy);
      }
    }
  }
}
