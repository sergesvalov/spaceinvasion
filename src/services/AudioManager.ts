import Phaser from 'phaser';

export class AudioManager {
  private static instance: AudioManager;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public isSoundEnabled(): boolean {
    return localStorage.getItem('soundEnabled') !== 'false';
  }

  public setSoundEnabled(enabled: boolean): void {
    localStorage.setItem('soundEnabled', enabled.toString());
  }

  public toggleSoundEnabled(): boolean {
    const next = !this.isSoundEnabled();
    this.setSoundEnabled(next);
    return next;
  }

  public play(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (this.isSoundEnabled()) {
      scene.sound.play(key, config);
    }
  }

  public playPew(scene: Phaser.Scene, config?: Phaser.Types.Sound.SoundConfig) {
    this.play(scene, 'pew', config);
  }

  public playExplosion(scene: Phaser.Scene, config?: Phaser.Types.Sound.SoundConfig) {
    this.play(scene, 'explosion', config);
  }
  
  // High-level semantic methods
  public playShieldSound(scene: Phaser.Scene) {
    this.playPew(scene, { volume: 0.5, rate: 0.8 });
  }

  public playBombSound(scene: Phaser.Scene) {
    this.playExplosion(scene, { volume: 1.0 });
  }

  public playTransformSound(scene: Phaser.Scene) {
    this.playPew(scene, { volume: 0.5, rate: 0.5 });
  }

  public playDamageSound(scene: Phaser.Scene) {
    this.playPew(scene, { volume: 0.5, rate: 0.2 });
  }

  public playPowerupSound(scene: Phaser.Scene, type: 'health' | 'weapon' | 'spread') {
    switch(type) {
      case 'health':
        this.playPew(scene, { volume: 0.5, rate: 2.0 });
        break;
      case 'weapon':
        this.playPew(scene, { volume: 0.5, rate: 1.5 });
        break;
      default:
        this.playPew(scene, { volume: 0.8, rate: 1.0 });
        break;
    }
  }

  public playEnemyDestroyed(scene: Phaser.Scene) {
    this.playExplosion(scene, { volume: 0.3 });
  }

  public playPlayerDestroyed(scene: Phaser.Scene) {
    this.playExplosion(scene, { volume: 0.8 });
  }
}
