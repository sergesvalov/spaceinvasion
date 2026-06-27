import Phaser from 'phaser';

export interface LevelPhase {
  textureKey: string;
  duration: number; // Duration of this phase in milliseconds
  spawnRateModifier: number; // E.g., 1.0 is normal, 0.5 is twice as fast
}

export class LevelManager {
  private scene: Phaser.Scene;
  private backgrounds: Phaser.GameObjects.TileSprite[] = [];
  private phases: LevelPhase[];
  private currentPhaseIndex: number = 0;
  private phaseStartTime: number = 0;
  
  private isLevelComplete: boolean = false;
  private onBossPhaseCallback: () => void;
  private fogOverlay!: Phaser.GameObjects.Rectangle;
  private cloudsEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private transitionTriggered: boolean = false;

  constructor(scene: Phaser.Scene, phases: LevelPhase[], onBossPhase: () => void) {
    this.scene = scene;
    this.phases = phases;
    this.onBossPhaseCallback = onBossPhase;
  }

  public setupBackgrounds() {
    const { width, height } = this.scene.scale;
    
    // Always add starfield at the very back
    const starBg = this.scene.add.tileSprite(width / 2, height / 2, width, height, 'starfield');
    starBg.setDepth(-200);
    this.backgrounds.push(starBg);

    this.phases.forEach((phase, index) => {
      const bg = this.scene.add.tileSprite(width / 2, height / 2, width, height, phase.textureKey);
      bg.setAlpha(index === 0 ? 1 : 0);
      bg.setDepth(-100 + index); // Ensure they are behind game objects
      
      // Make backgrounds slightly darker so they don't blend with bullets too much
      bg.setTint(0xbbbbbb);
      
      this.backgrounds.push(bg);
    });

    // Fog overlay
    this.fogOverlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0xeeeeee);
    this.fogOverlay.setDepth(-40); // Behind game objects but above backgrounds
    this.fogOverlay.setAlpha(0);

    // Cloud emitter for transitions
    this.cloudsEmitter = this.scene.add.particles(0, 0, 'cloud_particle', {
      x: { min: 0, max: width },
      y: -50,
      lifespan: 2500,
      speedY: { min: 400, max: 700 },
      speedX: { min: -50, max: 50 },
      scale: { start: 0.4, end: 2 },
      alpha: { start: 0.5, end: 0 },
      tint: 0xdddddd,
      blendMode: 'NORMAL',
      frequency: 30
    });
    this.cloudsEmitter.setDepth(-30); // Above fog overlay
    this.cloudsEmitter.stop();
  }

  public startLevel(time: number) {
    this.phaseStartTime = time;
    this.currentPhaseIndex = 0;
    this.isLevelComplete = false;
  }

  public update(time: number, delta: number) {
    // Scroll all backgrounds
    this.backgrounds.forEach((bg) => {
      bg.tilePositionY -= 0.5 * delta;
    });

    if (this.isLevelComplete) return;

    const currentPhase = this.phases[this.currentPhaseIndex];
    if (!currentPhase) return;

    const timeInPhase = time - this.phaseStartTime;

    if (timeInPhase > currentPhase.duration) {
      // Move to next phase
      this.currentPhaseIndex++;
      this.phaseStartTime = time;
      this.transitionTriggered = false; // Reset for next phase
      
      if (this.currentPhaseIndex >= this.phases.length) {
        // Boss Phase!
        this.isLevelComplete = true; // Technically level phases are complete
        this.onBossPhaseCallback();
      }
    } else {
      // Start transition a few seconds before phase ends
      const transitionTime = 4000;
      if (timeInPhase > currentPhase.duration - transitionTime && !this.transitionTriggered && this.currentPhaseIndex + 1 < this.phases.length) {
        this.transitionTriggered = true;
        
        // Start clouds
        this.cloudsEmitter.start();

        // Fade in fog overlay to hide the background swap
        this.scene.tweens.add({
          targets: this.fogOverlay,
          alpha: 1,
          duration: transitionTime / 2,
          yoyo: true, // Fade back to 0 automatically
          onYoyo: () => {
            // Swap backgrounds at peak fog
            const currentBg = this.backgrounds[this.currentPhaseIndex + 1];
            const nextBg = this.backgrounds[this.currentPhaseIndex + 2];
            
            if (currentBg) currentBg.setAlpha(0);
            if (nextBg) nextBg.setAlpha(1);
            
            // Stop emitting new clouds, existing ones will drift off
            this.cloudsEmitter.stop();
          }
        });
      }
    }
  }
  
  public getCurrentSpawnModifier(): number {
    if (this.isLevelComplete) return 999999; // Stop spawning
    const currentPhase = this.phases[this.currentPhaseIndex];
    return currentPhase ? currentPhase.spawnRateModifier : 1;
  }

  public getCurrentPhaseKey(): string | null {
    if (this.isLevelComplete) return null;
    const currentPhase = this.phases[this.currentPhaseIndex];
    return currentPhase ? currentPhase.textureKey : null;
  }
}
