export const EntityConfig = {
  Background: {
    scrollSpeed: 1.05, // reduced by 30% from 1.5
  },
  Player: {
    scale: 2.2,
    speed: 212.5,
  },
  Enemy: {
    scaleBase: 1.1,
    scaleCarrier: 1.65,
    diveSpeed: 212.5,
    scout0Freq: 0.00255,
    scout1YDelta: 0.085,
    carrierFreq: 0.00085,
    carrierYDelta: 0.017,
    projectileSpeed: 255,
  },
  Boss: {
    scale: 3.3,
    scaleTurret: 1.65,
    scaleGenerator: 2.2,
    movementY: 17,
    sineSpeedPhase1: 0.00085,
    sineSpeedPhase2: 0.002125,
    projectileSpeedPhase1: 212.5,
    projectileSpeedPhase2: 297.5,
  },
  Projectiles: {
    scale: 1.15,
    fighterSpeed: -510,
    mechaSpeed: -340,
    beamSpeed: -850,
    homingSpeed: 425,
  },
  PowerUp: {
    scale: 1.15,
    fallSpeed: 170,
  },
  Antimatter: {
    scale: 1.15,
    fallSpeed: 212.5,
  },
  Drone: {
    scale: 1.15,
    projectileSpeed: 340,
  },
  AAGun: {
    scale: 1.1,
    projectileSpeed: 510,
    scrollSpeedModifier: 0.85,
  },
  AlienAAGun: {
    scale: 1.1,
    projectileSpeed: 340,
  },
  OceanEnemy: {
    scale: 1.1,
    diveSpeed: 297.5,
    sineFreq: 0.00425,
    projectileSpeed: 255,
  },
};
