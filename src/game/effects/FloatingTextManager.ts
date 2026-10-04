import { StyleConfig } from '../config/StyleConfig';

export class FloatingTextManager {
  public static show(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color: string,
    duration: number = 1000,
    scale: number = 1,
  ) {
    const txt = scene.add
      .text(x, y, text, {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: `${20 * scale}px`,
        fontStyle: 'bold',
        color: color,
        stroke: StyleConfig.Colors.Black,
        strokeThickness: 3 * scale,
      })
      .setOrigin(0.5);

    scene.tweens.add({
      targets: txt,
      y: y - 50 * scale,
      alpha: 0,
      duration: duration,
      onComplete: () => txt.destroy(),
    });
  }
}
