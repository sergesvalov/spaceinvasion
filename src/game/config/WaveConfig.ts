import type { EnemyType } from '../entities/Enemy';

/** Number of distinct stages before New Game+ loops back to stage 1. */
export const STAGE_COUNT = 4;

/** Maps any level (including New Game+ levels 5, 6, ...) onto stage 1..4. */
export function getStage(level: number): number {
  return ((level - 1) % STAGE_COUNT) + 1;
}

/** How many times the player has looped through all stages (0 on the first run). */
export function getLoop(level: number): number {
  return Math.floor((level - 1) / STAGE_COUNT);
}

/** HP multiplier for enemies and bosses: +50% per New Game+ loop. */
export function getHpMultiplier(level: number): number {
  return 1 + 0.5 * getLoop(level);
}

export type WaveEnemy = EnemyType | 'ocean';

export interface WaveDef {
  at: number; // ms after level start
  pattern: 'V' | 'LINE' | 'SINGLE';
  enemy: WaveEnemy;
  count: number;
  spacing: number; // px between enemies
  x?: number; // wave centre, defaults to screen centre
}

export interface StageConfig {
  waves: WaveDef[];
  friendlyAAGuns: boolean; // Earth turrets that shoot at the invaders
  alienAAGuns: boolean; // Alien ground turrets that shoot at the player
  stadiumTimes: number[];
}

// All waves fire before the stage's last phase ends (see GameConfig.Levels),
// so the boss fight is not padded with leftover formations.
export const Stages: Record<number, StageConfig> = {
  // Earth: city and suburbs, defended by friendly AA turrets
  1: {
    friendlyAAGuns: true,
    alienAAGuns: false,
    stadiumTimes: [8000, 26000],
    waves: [
      { at: 2000, pattern: 'V', enemy: 'zigzag', count: 3, spacing: 35 },
      { at: 5000, pattern: 'LINE', enemy: 'scout_1', count: 4, spacing: 40 },
      { at: 9000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0 },
      { at: 12000, pattern: 'V', enemy: 'scout_0', count: 5, spacing: 25 },
      { at: 15000, pattern: 'V', enemy: 'kamikaze', count: 2, spacing: 80 },
      { at: 19000, pattern: 'LINE', enemy: 'zigzag', count: 5, spacing: 40 },
      { at: 23000, pattern: 'LINE', enemy: 'scout_1', count: 6, spacing: 30 },
      { at: 27000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0, x: 80 },
      { at: 29000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0, x: 190 },
      { at: 33000, pattern: 'V', enemy: 'kamikaze', count: 3, spacing: 40 },
    ],
  },
  // Ocean: dive bombers and alien platforms guarding the shield generators
  2: {
    friendlyAAGuns: false,
    alienAAGuns: true,
    stadiumTimes: [],
    waves: [
      { at: 2000, pattern: 'V', enemy: 'scout_0', count: 3, spacing: 35 },
      { at: 4000, pattern: 'SINGLE', enemy: 'ocean', count: 1, spacing: 0, x: 70 },
      { at: 5500, pattern: 'SINGLE', enemy: 'ocean', count: 1, spacing: 0, x: 200 },
      { at: 8000, pattern: 'LINE', enemy: 'zigzag', count: 4, spacing: 40 },
      { at: 11000, pattern: 'V', enemy: 'ocean', count: 3, spacing: 50 },
      { at: 14000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0 },
      { at: 17000, pattern: 'LINE', enemy: 'scout_1', count: 5, spacing: 35 },
      { at: 20000, pattern: 'V', enemy: 'kamikaze', count: 3, spacing: 40 },
      { at: 23000, pattern: 'LINE', enemy: 'ocean', count: 3, spacing: 80 },
      { at: 26000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0, x: 80 },
      { at: 27000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0, x: 190 },
      { at: 30000, pattern: 'V', enemy: 'ocean', count: 5, spacing: 40 },
      { at: 33000, pattern: 'V', enemy: 'kamikaze', count: 4, spacing: 25 },
    ],
  },
  // Orbit: pure dogfight against the retreating armada, nothing on the ground
  3: {
    friendlyAAGuns: false,
    alienAAGuns: false,
    stadiumTimes: [],
    waves: [
      { at: 1500, pattern: 'V', enemy: 'zigzag', count: 5, spacing: 30 },
      { at: 4000, pattern: 'LINE', enemy: 'scout_1', count: 6, spacing: 35 },
      { at: 7000, pattern: 'V', enemy: 'kamikaze', count: 3, spacing: 50 },
      { at: 9000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0 },
      { at: 12000, pattern: 'V', enemy: 'scout_0', count: 7, spacing: 22 },
      { at: 15000, pattern: 'LINE', enemy: 'zigzag', count: 5, spacing: 45 },
      { at: 18000, pattern: 'V', enemy: 'kamikaze', count: 4, spacing: 30 },
      { at: 21000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0, x: 70 },
      { at: 22000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0, x: 200 },
      { at: 25000, pattern: 'LINE', enemy: 'scout_1', count: 8, spacing: 28 },
      { at: 28000, pattern: 'V', enemy: 'zigzag', count: 5, spacing: 35 },
      { at: 31000, pattern: 'V', enemy: 'kamikaze', count: 5, spacing: 25 },
      { at: 34000, pattern: 'LINE', enemy: 'scout_1', count: 7, spacing: 30 },
      { at: 37000, pattern: 'V', enemy: 'scout_0', count: 5, spacing: 30 },
    ],
  },
  // Space station: hull turrets plus the densest formations in the game
  4: {
    friendlyAAGuns: false,
    alienAAGuns: true,
    stadiumTimes: [],
    waves: [
      { at: 2000, pattern: 'LINE', enemy: 'scout_1', count: 5, spacing: 40 },
      { at: 4500, pattern: 'V', enemy: 'zigzag', count: 5, spacing: 30 },
      { at: 7000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0 },
      { at: 10000, pattern: 'V', enemy: 'kamikaze', count: 4, spacing: 30 },
      { at: 13000, pattern: 'LINE', enemy: 'scout_1', count: 7, spacing: 30 },
      { at: 16000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0, x: 70 },
      { at: 16500, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0, x: 200 },
      { at: 20000, pattern: 'V', enemy: 'zigzag', count: 7, spacing: 22 },
      { at: 23000, pattern: 'V', enemy: 'kamikaze', count: 5, spacing: 25 },
      { at: 26000, pattern: 'LINE', enemy: 'scout_1', count: 8, spacing: 26 },
      { at: 29000, pattern: 'SINGLE', enemy: 'carrier', count: 1, spacing: 0 },
      { at: 32000, pattern: 'V', enemy: 'scout_0', count: 7, spacing: 22 },
      { at: 35000, pattern: 'V', enemy: 'kamikaze', count: 5, spacing: 25 },
      { at: 38000, pattern: 'LINE', enemy: 'zigzag', count: 6, spacing: 35 },
      { at: 41000, pattern: 'LINE', enemy: 'scout_1', count: 8, spacing: 26 },
    ],
  },
};
