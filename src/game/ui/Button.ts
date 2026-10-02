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
    const defaultColor = options?.color || '#00ffcc';
    const hoverColor = options?.hoverColor || '#ffffff';
    const defaultBg = options?.backgroundColor || 'rgba(0, 50, 100, 0.4)';
    const hoverBg = options?.hoverBackgroundColor || 'rgba(0, 150, 255, 0.6)';

    const btn = scene.add.text(x, y, text, {
      fontFamily: 'Orbitron',
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
