import Phaser from 'phaser';
import { StyleConfig } from '../config/StyleConfig';
import { AudioManager } from '../../services/AudioManager';
import { Haptics } from '../../services/Haptics';

export interface ButtonOptions {
  /** Width in game pixels (the canvas is 270 wide). */
  width?: number;
  /** Yellow call-to-action variant for the one action the screen is about. */
  primary?: boolean;
  fontSize?: string;
}

/**
 * Phaser twin of the DOM `.btn-primary`: black plate, 1px white frame and a
 * hard offset shadow that collapses when pressed. 32 game px tall, which is
 * ~46-48 CSS px at the usual 1.44-1.5 canvas scale - a comfortable thumb target.
 */
export class Button {
  public static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    options: ButtonOptions = {},
  ): Phaser.GameObjects.Container {
    const width = options.width ?? 180;
    const height = 32;
    const primary = !!options.primary;
    const S = StyleConfig.Button;
    const hex = (c: string) => Phaser.Display.Color.HexStringToColor(c).color;

    const shadow = scene.add
      .rectangle(2, 2, width, height, hex(primary ? S.PrimaryShadow : S.Shadow))
      .setOrigin(0.5);
    const plate = scene.add
      .rectangle(0, 0, width, height, hex(primary ? S.PrimaryBg : S.Bg))
      .setOrigin(0.5)
      .setStrokeStyle(1, hex(primary ? S.PrimaryBg : S.Border));
    const label = scene.add
      .text(0, 0, text, {
        fontFamily: StyleConfig.Fonts.Main,
        fontSize: options.fontSize ?? '8px',
        color: primary ? S.PrimaryText : S.TextColor,
        align: 'center',
      })
      .setOrigin(0.5);

    const btn = scene.add.container(x, y, [shadow, plate, label]);
    btn.setSize(width, height).setInteractive({ useHandCursor: true });

    const press = (down: boolean) => {
      plate.setPosition(down ? 2 : 0, down ? 2 : 0);
      label.setPosition(down ? 2 : 0, down ? 2 : 0);
      shadow.setVisible(!down);
    };

    btn
      .on('pointerover', () => plate.setStrokeStyle(1, hex(StyleConfig.Colors.NeonYellow)))
      .on('pointerout', () => {
        plate.setStrokeStyle(1, hex(primary ? S.PrimaryBg : S.Border));
        press(false);
      })
      .on('pointerdown', () => {
        press(true);
        Haptics.impact('light');
        AudioManager.getInstance().playUiClick();
      })
      .on('pointerup', () => {
        press(false);
        onClick();
      });

    return btn;
  }
}
