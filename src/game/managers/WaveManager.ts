import { LevelManager } from './LevelManager';
import { EntitySpawner } from './EntitySpawner';
import { GameController } from './GameController';
import { EnemyType } from '../entities/Enemy';

interface Wave {
  triggerTime: number; // relative to level start time
  pattern: 'V' | 'LINE' | 'SINGLE';
  enemyType: EnemyType;
  count: number;
  spacing: number; // space in px between enemies
  startX?: number; // center x position for wave
  fired: boolean;
}

export class WaveManager {
  private waves: Wave[] = [];
  private levelStartTime: number = 0;

  constructor(
    private levelManager: LevelManager,
    private entitySpawner: EntitySpawner,
    private gameController: GameController,
  ) {
    this.buildWaves();
  }

  private buildWaves() {
    this.waves = [
      // Phase 1 (0-18s)
      {
        triggerTime: 2000,
        pattern: 'V',
        enemyType: 'scout_0',
        count: 3,
        spacing: 30,
        fired: false,
      },
      {
        triggerTime: 5000,
        pattern: 'LINE',
        enemyType: 'scout_1',
        count: 4,
        spacing: 40,
        fired: false,
      },
      {
        triggerTime: 9000,
        pattern: 'SINGLE',
        enemyType: 'carrier',
        count: 1,
        spacing: 0,
        startX: 135,
        fired: false,
      },
      {
        triggerTime: 12000,
        pattern: 'V',
        enemyType: 'scout_0',
        count: 5,
        spacing: 25,
        fired: false,
      },
      {
        triggerTime: 16000,
        pattern: 'LINE',
        enemyType: 'scout_1',
        count: 5,
        spacing: 30,
        fired: false,
      },

      // Phase 2 (18-36s)
      {
        triggerTime: 20000,
        pattern: 'V',
        enemyType: 'scout_0',
        count: 5,
        spacing: 30,
        fired: false,
      },
      {
        triggerTime: 24000,
        pattern: 'LINE',
        enemyType: 'scout_1',
        count: 6,
        spacing: 30,
        fired: false,
      },
      {
        triggerTime: 28000,
        pattern: 'SINGLE',
        enemyType: 'carrier',
        count: 1,
        spacing: 0,
        startX: 80,
        fired: false,
      },
      {
        triggerTime: 32000,
        pattern: 'V',
        enemyType: 'scout_0',
        count: 5,
        spacing: 40,
        fired: false,
      },

      // Phase 3 (36-60s)
      {
        triggerTime: 38000,
        pattern: 'LINE',
        enemyType: 'scout_1',
        count: 7,
        spacing: 25,
        fired: false,
      },
      {
        triggerTime: 42000,
        pattern: 'V',
        enemyType: 'scout_0',
        count: 5,
        spacing: 30,
        fired: false,
      },
      {
        triggerTime: 46000,
        pattern: 'SINGLE',
        enemyType: 'carrier',
        count: 1,
        spacing: 0,
        startX: 200,
        fired: false,
      },
      {
        triggerTime: 50000,
        pattern: 'V',
        enemyType: 'scout_0',
        count: 7,
        spacing: 20,
        fired: false,
      },
      {
        triggerTime: 54000,
        pattern: 'LINE',
        enemyType: 'scout_1',
        count: 8,
        spacing: 20,
        fired: false,
      },
    ];
  }

  public update(time: number, delta: number) {
    this.levelManager.update(time, delta);

    if (this.levelStartTime === 0) {
      this.levelStartTime = time;
    }

    if (!this.gameController.getIsPlaying()) return;

    const levelProgress = this.levelManager.getLevelProgress(time);
    this.entitySpawner.spawnAAGun(time, levelProgress);

    const currentPhaseKey = this.levelManager.getCurrentPhaseKey();
    this.entitySpawner.spawnAlienAAGun(time, currentPhaseKey);

    const timeSinceStart = time - this.levelStartTime;

    for (const wave of this.waves) {
      if (!wave.fired && timeSinceStart >= wave.triggerTime) {
        wave.fired = true;
        this.spawnWave(wave);
      }
    }

    this.entitySpawner.update(time, true);
  }

  private spawnWave(wave: Wave) {
    const startX = wave.startX ?? 135;
    const spacing = wave.spacing;

    if (wave.pattern === 'SINGLE') {
      this.entitySpawner.spawnSpecificEnemy(startX, -30, wave.enemyType);
    } else if (wave.pattern === 'LINE') {
      const totalWidth = (wave.count - 1) * spacing;
      let x = startX - totalWidth / 2;
      for (let i = 0; i < wave.count; i++) {
        this.entitySpawner.spawnSpecificEnemy(x, -30, wave.enemyType);
        x += spacing;
      }
    } else if (wave.pattern === 'V') {
      const mid = Math.floor(wave.count / 2);
      for (let i = 0; i < wave.count; i++) {
        const offset = Math.abs(mid - i);
        const x = startX + (i - mid) * spacing;
        const y = -30 - offset * spacing;
        this.entitySpawner.spawnSpecificEnemy(x, y, wave.enemyType);
      }
    }
  }
}
