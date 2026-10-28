import Phaser from 'phaser';
import { zzfx, ZZFX } from 'zzfx';

export class AudioManager {
  private static instance: AudioManager;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
      // Adjust default volume to match previous wav volumes
      ZZFX.volume = 0.3;
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
    // Keep for backward compatibility with music or other sounds if needed, but not used for sfx anymore
    if (this.isSoundEnabled()) {
      scene.sound.play(key, config);
    }
  }

  public playPew(_scene: Phaser.Scene, config?: { volume?: number; rate?: number }) {
    if (!this.isSoundEnabled()) return;

    // Base pew parameters
    const v = (config?.volume || 1.0) * ZZFX.volume;
    const r = config?.rate || 1.0;
    const freq = 1046 * r; // C6

    // Simple synth pew: zzfx(volume, randomness, freq, attack, decay, pitch jump, pitch shape, shape, noise, etc...)
    zzfx(v, 0.05, freq, 0.01, 0.1, 0, 0, 0.5, 0, 0, -100, 0, 0, 0, 0, 0, 0, 0.5, 0, 0);
  }

  public playExplosion(_scene: Phaser.Scene, config?: { volume?: number; rate?: number }) {
    if (!this.isSoundEnabled()) return;

    const v = (config?.volume || 1.0) * ZZFX.volume;

    // Simple noise explosion
    zzfx(v, 0.1, 100, 0.05, 0.5, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0);
  }

  // UI feedback: short synth blips that don't need a Phaser scene
  public playUiClick() {
    if (!this.isSoundEnabled()) return;
    zzfx(ZZFX.volume * 0.5, 0, 1400, 0, 0.01, 0.03, 2);
  }

  public playUiConfirm() {
    if (!this.isSoundEnabled()) return;
    zzfx(ZZFX.volume * 0.6, 0, 660, 0, 0.04, 0.12, 0, 1, 0, 0, 330, 0.04);
  }

  public playUiDeny() {
    if (!this.isSoundEnabled()) return;
    zzfx(ZZFX.volume * 0.6, 0, 140, 0, 0.06, 0.1, 2);
  }

  public playUiTick() {
    if (!this.isSoundEnabled()) return;
    zzfx(ZZFX.volume * 0.25, 0, 2200, 0, 0, 0.02);
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
    switch (type) {
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
