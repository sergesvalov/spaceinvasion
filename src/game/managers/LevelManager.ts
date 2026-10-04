import Phaser from 'phaser';

export interface LevelPhase {
  textureKey: string; // We'll interpret this as a biome/theme ('bg_city', 'bg_suburbs', 'bg_mountains')
  duration: number;
  spawnRateModifier: number;
}

export class LevelManager {
  private scene: Phaser.Scene;
  private phases: LevelPhase[];
  private currentPhaseIndex: number = 0;
  private phaseStartTime: number = 0;

  private isLevelComplete: boolean = false;
  private onBossPhaseCallback: () => void;

  private scrollSpeed = 1.5;
  private activeBg!: Phaser.GameObjects.TileSprite;
  private nextBg!: Phaser.GameObjects.TileSprite;
  private resizeHandler!: (gameSize: Phaser.Structs.Size) => void;

  constructor(scene: Phaser.Scene, phases: LevelPhase[], onBossPhase: () => void) {
    this.scene = scene;
    this.phases = phases;
    this.onBossPhaseCallback = onBossPhase;
  }

  public setupBackgrounds() {
    const { width, height } = this.scene.scale;

    // Starfield at the very back
    const starBg = this.scene.add.tileSprite(width / 2, height / 2, width, height, 'starfield');
    starBg.setDepth(-200);

    // Initial background
    const initialKey = this.phases[0] ? this.phases[0].textureKey : 'bg_city';

    this.nextBg = this.scene.add.tileSprite(width / 2, height / 2, width, height, initialKey);
    this.nextBg.setDepth(-101);
    this.nextBg.setAlpha(0);
    this.nextBg.setTint(0xbbbbbb);

    this.activeBg = this.scene.add.tileSprite(width / 2, height / 2, width, height, initialKey);
    this.activeBg.setDepth(-100);
    this.activeBg.setAlpha(1.0);
    this.activeBg.setTint(0xbbbbbb);

    // Handle resize events
    this.resizeHandler = (gameSize: Phaser.Structs.Size) => {
      const { width, height } = gameSize;
      starBg.setPosition(width / 2, height / 2);
      starBg.setSize(width, height);
      this.activeBg.setPosition(width / 2, height / 2);
      this.activeBg.setSize(width, height);
      this.nextBg.setPosition(width / 2, height / 2);
      this.nextBg.setSize(width, height);
    };

    this.scene.scale.on('resize', this.resizeHandler, this);
  }

  public destroy() {
    this.scene.scale.off('resize', this.resizeHandler, this);
  }

  public startLevel(time: number) {
    this.phaseStartTime = time;
    this.currentPhaseIndex = 0;
    this.isLevelComplete = false;
  }

  public update(time: number, delta: number) {
    // Scroll starfield
    const starBg = this.scene.children.list.find(
      (c) => (c as any).texture?.key === 'starfield',
    ) as Phaser.GameObjects.TileSprite;
    if (starBg) {
      starBg.tilePositionY -= this.scrollSpeed * 0.2 * delta;
    }

    // Scroll active backgrounds
    if (this.activeBg) {
      this.activeBg.tilePositionY -= this.scrollSpeed * delta;
    }
    if (this.nextBg && this.nextBg.alpha > 0) {
      this.nextBg.tilePositionY -= this.scrollSpeed * delta;
    }

    if (this.isLevelComplete) return;

    const currentPhase = this.phases[this.currentPhaseIndex];
    if (!currentPhase) return;

    const timeInPhase = time - this.phaseStartTime;

    // Check if we need to transition texture soon (3 seconds before phase ends)
    if (timeInPhase > currentPhase.duration - 3000) {
      const nextPhase = this.phases[this.currentPhaseIndex + 1];
      if (nextPhase && this.nextBg.texture.key !== nextPhase.textureKey) {
        if (this.scene.textures.exists(nextPhase.textureKey)) {
          this.nextBg.setTexture(nextPhase.textureKey);
          // Sync scroll position
          this.nextBg.tilePositionY = this.activeBg.tilePositionY;
        }
      }

      // Crossfade
      if (nextPhase && this.nextBg.alpha < 1.0) {
        this.nextBg.setAlpha(this.nextBg.alpha + 0.001 * delta);
        this.activeBg.setAlpha(this.activeBg.alpha - 0.001 * delta);
      }
    }

    // Phase shift
    if (timeInPhase > currentPhase.duration) {
      this.currentPhaseIndex++;
      this.phaseStartTime = time;

      // Swap backgrounds logic if we crossfaded
      if (this.nextBg.alpha > 0) {
        const temp = this.activeBg;
        this.activeBg = this.nextBg;
        this.nextBg = temp;
        this.nextBg.setAlpha(0);
        this.activeBg.setAlpha(1.0);
      }

      if (this.currentPhaseIndex >= this.phases.length) {
        this.isLevelComplete = true;
        this.onBossPhaseCallback();
      }
    }
  }

  public getCurrentSpawnModifier(): number {
    if (this.isLevelComplete) return 999999;
    const currentPhase = this.phases[this.currentPhaseIndex];
    return currentPhase ? currentPhase.spawnRateModifier : 1;
  }

  public getCurrentPhaseKey(): string | null {
    if (this.isLevelComplete) return null;
    const currentPhase = this.phases[this.currentPhaseIndex];
    return currentPhase ? currentPhase.textureKey : null;
  }

  public getLevelProgress(time: number): number {
    if (this.isLevelComplete) return 1.0;

    let totalDuration = 0;
    for (const phase of this.phases) {
      totalDuration += phase.duration;
    }

    let timePassed = 0;
    for (let i = 0; i < this.currentPhaseIndex; i++) {
      timePassed += this.phases[i].duration;
    }
    timePassed += time - this.phaseStartTime;

    return Phaser.Math.Clamp(timePassed / totalDuration, 0, 1);
  }
}
