import Phaser from 'phaser';

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
    const defaultColor = options?.color || '#00aaff';
    const hoverColor = options?.hoverColor || '#ffaa00';
    const defaultBg = options?.backgroundColor || '#111111';
    const hoverBg = options?.hoverBackgroundColor || '#333333';

    const btn = scene.add.text(x, y, text, {
      fontSize: options?.fontSize || '24px',
      color: defaultColor,
      backgroundColor: defaultBg,
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => btn.setStyle({ color: hoverColor, backgroundColor: hoverBg }))
      .on('pointerout', () => btn.setStyle({ color: defaultColor, backgroundColor: defaultBg }))
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
