import Phaser from 'phaser';

/**
 * Fires a one-shot particle burst that cleans itself up.
 *
 * Phaser keeps an exploded emitter in the scene display list forever - it just
 * stops emitting - so creating one per explosion leaks a GameObject on every
 * kill. Scheduling a destroy once the last particle has faded keeps the display
 * list flat over a long run.
 */
export function burst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  quantity: number,
  config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig
): void {
  // Base emitter for the core explosion
  const coreEmitter = scene.add.particles(x, y, 'cloud_particle', {
    ...config,
    scale: { start: 0.5, end: 0 },
    alpha: { start: 0.8, end: 0 },
    blendMode: 'ADD',
    tint: [0xffffff, 0xffaa00, 0xff0000],
    speed: config.speed || { min: 50, max: 200 }
  });
  
  // Spark emitter for debris
  const sparkEmitter = scene.add.particles(x, y, 'particle', {
    ...config,
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    blendMode: 'ADD',
    tint: [0x00ffff, 0xffaa00],
    speed: (config.speed as number) * 1.5 || { min: 100, max: 400 },
    lifespan: (config.lifespan as number) * 0.8 || 800
  });

  coreEmitter.explode(quantity);
  sparkEmitter.explode(Math.floor(quantity * 1.5));

  const lifespan = typeof config.lifespan === 'number' ? config.lifespan : 1000;
  scene.time.delayedCall(lifespan + 100, () => {
    coreEmitter.destroy();
    sparkEmitter.destroy();
  });
}
