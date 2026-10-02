import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';

export class Button {
  public static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    options?: {
      fontSize?: string;
      color?: string;
      hoverColor?: string;
      backgroundColor?: string;
      hoverBackgroundColor?: string;
    }
  ): Phaser.GameObjects.Text {
    const defaultColor = options?.color || StyleConfig.Button.DefaultColor;
    const hoverColor = options?.hoverColor || StyleConfig.Button.HoverColor;
    const defaultBg = options?.backgroundColor || StyleConfig.Button.DefaultBg;
    const hoverBg = options?.hoverBackgroundColor || StyleConfig.Button.HoverBg;

    const btn = scene.add.text(x, y, text, {
      fontFamily: StyleConfig.Fonts.Main,
      fontSize: options?.fontSize || '24px',
      color: defaultColor,
      backgroundColor: defaultBg,
      padding: { x: 30, y: 15 },
      shadow: { color: defaultColor, blur: 5, fill: true }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        btn.setStyle({ color: hoverColor, backgroundColor: hoverBg, shadow: { color: hoverColor, blur: 15, fill: true } });
        scene.tweens.add({ targets: btn, scale: 1.1, duration: 100 });
      })
      .on('pointerout', () => {
        btn.setStyle({ color: defaultColor, backgroundColor: defaultBg, shadow: { color: defaultColor, blur: 5, fill: true } });
        scene.tweens.add({ targets: btn, scale: 1, duration: 100 });
      })
      .on('pointerdown', () => {
        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        onClick();
      });

    return btn;
  }
}
