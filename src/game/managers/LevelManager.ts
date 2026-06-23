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
      
      if (this.currentPhaseIndex >= this.phases.length) {
        // Boss Phase!
        this.isLevelComplete = true; // Technically level phases are complete
        this.onBossPhaseCallback();
      }
    } else {
      // Handle crossfade if we are near the end of the phase (last 3000ms)
      const crossfadeTime = 3000;
      if (timeInPhase > currentPhase.duration - crossfadeTime && this.currentPhaseIndex + 1 < this.phases.length) {
        // +1 because starfield is at index 0, so backgrounds for phases are offset by 1
        const nextBg = this.backgrounds[this.currentPhaseIndex + 2]; 
        if (nextBg) {
           const alpha = (timeInPhase - (currentPhase.duration - crossfadeTime)) / crossfadeTime;
           nextBg.setAlpha(alpha);
        }
      }
    }
  }
  
  public getCurrentSpawnModifier(): number {
    if (this.isLevelComplete) return 999999; // Stop spawning
    const currentPhase = this.phases[this.currentPhaseIndex];
    return currentPhase ? currentPhase.spawnRateModifier : 1;
  }
}
