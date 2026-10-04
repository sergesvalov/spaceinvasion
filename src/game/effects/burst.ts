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
  config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig,
): void {
  // Core explosion cloud
  const coreEmitter = scene.add.particles(x, y, 'cloud_particle', {
    ...config,
    scale: { start: 0.8, end: 0 },
    alpha: { start: 1, end: 0 },
    blendMode: 'NORMAL',
    tint: [0xffffff, 0xff8800, 0xff0000],
    speed: config.speed || { min: 80, max: 250 },
    lifespan: config.lifespan || 600,
  });

  // Spark emitter for debris
  const sparkEmitter = scene.add.particles(x, y, 'particle', {
    ...config,
    scale: { start: 1.5, end: 0 },
    alpha: { start: 1, end: 0 },
    blendMode: 'NORMAL',
    tint: [0x00ffff, 0xffaa00, 0xffffff],
    speed: (config.speed as number) * 2 || { min: 200, max: 600 },
    lifespan: (config.lifespan as number) * 0.8 || 500,
  });

  // Add shockwave ring
  const ringColor = config.tint
    ? Array.isArray(config.tint)
      ? config.tint[0]
      : config.tint
    : 0xffaa00;
  const ring = scene.add.graphics();
  ring.setPosition(x, y);

  const ringRadius = quantity * 1.5;
  ring.lineStyle(4, ringColor as number, 1);
  ring.strokeCircle(0, 0, ringRadius);

  scene.tweens.add({
    targets: ring,
    scale: { from: 0.2, to: 3 },
    alpha: { from: 1, to: 0 },
    duration: 400,
    ease: 'Cubic.easeOut',
    onComplete: () => ring.destroy(),
  });

  coreEmitter.explode(quantity);
  sparkEmitter.explode(Math.floor(quantity * 2));

  const lifespan = typeof config.lifespan === 'number' ? config.lifespan : 1000;
  scene.time.delayedCall(lifespan + 200, () => {
    coreEmitter.destroy();
    sparkEmitter.destroy();
  });
}
