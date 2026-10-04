export const GameConfig = {
  Player: {
    FireRateFighter: 120,
    FireRateMecha: 80,
    DamageFighter: 1,
    DamageMecha: 3,
    MechaCost: 3, // Antimatter spent per transformation
    MechaDuration: 12000,
    MeleeCooldown: 1000,
    MeleeRange: 150,
  },
  Enemy: {
    HP: 1,
    FireRate: 1500,
    Points: 100,
    AntimatterDropChance: 0.15,
  },
  Boss: {
    HP: 100,
    BulletHellFireRate: 400,
    KamikazeSpawnRate: 3000,
    AntimatterDrops: 10,
    Points: 5000,
  },
  AAGun: {
    FireRate: 800,
    Damage: 5,
    MaxRange: 800,
  },
  AlienAAGun: {
    FireRate: 1200,
    MaxRange: 800,
    MaxCount: 8,
  },
  Levels: {
    1: [
      { textureKey: 'bg_city', duration: 18000, spawnRateModifier: 0.8 },
      { textureKey: 'bg_suburbs', duration: 18000, spawnRateModifier: 0.6 },
    ],
    2: [{ textureKey: 'bg_ocean', duration: 36000, spawnRateModifier: 0.6 }],
    3: [{ textureKey: 'starfield', duration: 40000, spawnRateModifier: 0.5 }],
  },
  Spawns: {
    AAGunDelay: 3000,
    AlienAAGunDelay: 4500,
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
