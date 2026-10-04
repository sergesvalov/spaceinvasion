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
    },
  ): Phaser.GameObjects.Text {
    const defaultColor = options?.color || StyleConfig.Button.DefaultColor;
    const hoverColor = options?.hoverColor || StyleConfig.Button.HoverColor;
    const defaultBg = options?.backgroundColor || StyleConfig.Button.DefaultBg;
    const hoverBg = options?.hoverBackgroundColor || StyleConfig.Button.HoverBg;

    const btn = scene.add
      .text(x, y, text, {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: options?.fontSize || '16px', // Smaller base font to fit 270px width
        color: defaultColor,
        backgroundColor: defaultBg,
        padding: { x: 10, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        btn.setStyle({ color: hoverBg, backgroundColor: hoverColor });
      })
      .on('pointerout', () => {
        btn.setStyle({ color: defaultColor, backgroundColor: defaultBg });
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
