import { StyleConfig } from '../config/StyleConfig';

export class FloatingTextManager {
  public static show(scene: Phaser.Scene, x: number, y: number, text: string, color: string) {
    const txt = scene.add.text(x, y, text, {
      fontFamily: StyleConfig.Fonts.Main,
      fontSize: '20px',
      fontStyle: 'bold',
      color: color,
      stroke: StyleConfig.Colors.Black,
      strokeThickness: 3
    }).setOrigin(0.5);
    
    scene.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => txt.destroy()
    });
  }
}
