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
  private stadium1Fired: boolean = false;
  private stadium2Fired: boolean = false;

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
        enemyType: 'zigzag', // New fast zigzag
        count: 3,
        spacing: 35,
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
        triggerTime: 15000,
        pattern: 'V',
        enemyType: 'kamikaze', // Kamikaze aiming at player
        count: 2,
        spacing: 80,
        fired: false,
      },

      // Phase 2 (18-36s)
      {
        triggerTime: 19000,
        pattern: 'LINE',
        enemyType: 'zigzag',
        count: 5,
        spacing: 40,
        fired: false,
      },
      {
        triggerTime: 23000,
        pattern: 'LINE',
        enemyType: 'scout_1',
        count: 6,
        spacing: 30,
        fired: false,
      },
      {
        triggerTime: 27000,
        pattern: 'SINGLE',
        enemyType: 'carrier',
        count: 1,
        spacing: 0,
        startX: 80,
        fired: false,
      },
      {
        triggerTime: 29000,
        pattern: 'SINGLE',
        enemyType: 'carrier',
        count: 1,
        spacing: 0,
        startX: 190,
        fired: false,
      },
      {
        triggerTime: 33000,
        pattern: 'V',
        enemyType: 'kamikaze',
        count: 3,
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
        triggerTime: 41000,
        pattern: 'V',
        enemyType: 'zigzag',
        count: 5,
        spacing: 30,
        fired: false,
      },
      {
        triggerTime: 45000,
        pattern: 'SINGLE',
        enemyType: 'carrier',
        count: 1,
        spacing: 0,
        startX: 135,
        fired: false,
      },
      {
        triggerTime: 49000,
        pattern: 'V',
        enemyType: 'kamikaze',
        count: 4,
        spacing: 20,
        fired: false,
      },
      {
        triggerTime: 53000,
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

    if (currentPhaseKey === 'bg_city' || currentPhaseKey === 'bg_suburbs') {
      if (!this.stadium1Fired && timeSinceStart >= 8000) {
        this.stadium1Fired = true;
        this.entitySpawner.spawnStadium();
      }
      if (!this.stadium2Fired && timeSinceStart >= 26000) {
        this.stadium2Fired = true;
        this.entitySpawner.spawnStadium();
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
