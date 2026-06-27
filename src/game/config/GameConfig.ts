export const GameConfig = {
  Player: {
    FireRateFighter: 150,
    FireRateMecha: 300,
    DamageFighter: 1,
    DamageMecha: 1.5,
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
    FireRate: 1500,
    Damage: 5,
    MaxRange: 800,
  },
  Levels: {
    1: [
      { textureKey: 'bg_city', duration: 20000, spawnRateModifier: 1.0 },
      { textureKey: 'bg_suburbs', duration: 20000, spawnRateModifier: 0.8 },
      { textureKey: 'bg_mountains', duration: 20000, spawnRateModifier: 0.5 }
    ],
    2: [
      { textureKey: 'bg_anime_city', duration: 30000, spawnRateModifier: 0.7 },
      { textureKey: 'bg_anime_city', duration: 30000, spawnRateModifier: 0.4 }
    ]
  }
};
