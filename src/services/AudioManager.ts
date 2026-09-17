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
}
