export const GameConfig = {
  Player: {
    FireRateFighter: 150,
    FireRateMecha: 300,
    DamageFighter: 1,
    DamageMecha: 1.5,
    MechaCost: 5, // Antimatter spent per transformation
    MechaDuration: 15000,
  },
  Enemy: {
    HP: 1,
    FireRate: 1500,
    Points: 100,
    AntimatterDropChance: 0.15,
  },
  Boss: {
    HP: 100,
    BulletHellFireRate: 800,
    KamikazeSpawnRate: 5000,
    AntimatterDrops: 10,
    Points: 5000,
  },
  AAGun: {
    FireRate: 800,
    Damage: 5,
    MaxRange: 800,
  },
  Levels: {
    1: [
      { textureKey: 'bg_city', duration: 18000, spawnRateModifier: 1.0 },
      { textureKey: 'bg_suburbs', duration: 18000, spawnRateModifier: 0.8 },
      { textureKey: 'bg_mountains', duration: 24000, spawnRateModifier: 0.5 },
    ],
    2: [
      { textureKey: 'bg_night_city', duration: 36000, spawnRateModifier: 0.7 },
      { textureKey: 'bg_ocean', duration: 24000, spawnRateModifier: 0.4 },
    ],
  },
  Runtime: {
    get isE2ETestMode() {
      return !!(window as any).__E2E_TEST_MODE__;
    },
    get isAIDemoMode() {
      return !!(window as any).__AI_DEMO_MODE__;
    },
  },
};
