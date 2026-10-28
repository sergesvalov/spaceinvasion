import Phaser from 'phaser';
import { AudioManager } from '../../services/AudioManager';

/** Roll a text object's number up from 0 with ticking, arcade-style. */
export function countUp(
  scene: Phaser.Scene,
  text: Phaser.GameObjects.Text,
  to: number,
  format: (n: number) => string = (n) => `${n}`,
  duration = 600,
): Promise<void> {
  return new Promise((resolve) => {
    if (to <= 0) {
      text.setText(format(to));
      resolve();
      return;
    }
    const counter = { v: 0 };
    let lastTick = 0;
    scene.tweens.add({
      targets: counter,
      v: to,
      duration,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        text.setText(format(Math.round(counter.v)));
        if (tween.elapsed - lastTick > 60) {
          lastTick = tween.elapsed;
          AudioManager.getInstance().playUiTick();
        }
      },
      onComplete: () => {
        text.setText(format(to));
        resolve();
      },
    });
  });
}
