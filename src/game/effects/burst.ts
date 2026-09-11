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
  const emitter = scene.add.particles(x, y, 'particle', config);
  emitter.explode(quantity);

  const lifespan = typeof config.lifespan === 'number' ? config.lifespan : 1000;
  scene.time.delayedCall(lifespan + 100, () => emitter.destroy());
}
