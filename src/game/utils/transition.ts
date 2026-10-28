import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';

const leaving = new WeakSet<Phaser.Scene>();

/**
 * Fade the camera to black, then start another scene. Repeated calls while a
 * fade is running are ignored, so double taps can't start a scene twice.
 */
export function fadeToScene(
  scene: Phaser.Scene,
  key: string,
  data?: object,
  ms: number = StyleConfig.TransitionMs,
) {
  if (leaving.has(scene)) return;
  leaving.add(scene);
  scene.events.once('shutdown', () => leaving.delete(scene));

  scene.cameras.main.fadeOut(ms, 0, 0, 0);
  scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(key, data));
}

export function fadeIn(scene: Phaser.Scene, ms: number = StyleConfig.TransitionMs) {
  scene.cameras.main.fadeIn(ms, 0, 0, 0);
}
