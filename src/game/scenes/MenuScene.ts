import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private settingsContainer!: Phaser.GameObjects.Container;
  private soundText!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Draw the scrolling background
    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'starfield');

    // Title
    this.add.text(width / 2, height * 0.3, 'SPACE INVASION', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Play Button
    this.createButton(width / 2, height * 0.45, 'PLAY', () => {
      this.scene.start('GameScene');
    });

    // Garage Button
    this.createButton(width / 2, height * 0.55, 'GARAGE', () => {
      this.scene.start('GarageScene');
    });

    // Settings Button
    this.createButton(width / 2, height * 0.65, 'SETTINGS', () => {
      this.settingsContainer.setVisible(!this.settingsContainer.visible);
    });

    // Exit Button
    this.createButton(width / 2, height * 0.75, 'EXIT', () => {
      if (window.Telegram?.WebApp) {
        (window.Telegram.WebApp as any).close();
      } else {
        alert('Exit game not supported in this environment');
      }
    });

    // Settings Panel
    this.createSettingsPanel(width, height);
  }

  private createButton(x: number, y: number, text: string, onClick: () => void) {
    const btn = this.add.text(x, y, text, {
      fontSize: '24px',
      color: '#00aaff',
      backgroundColor: '#111111',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => btn.setStyle({ color: '#ffaa00', backgroundColor: '#333333' }))
      .on('pointerout', () => btn.setStyle({ color: '#00aaff', backgroundColor: '#111111' }))
      .on('pointerdown', () => {
        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        onClick();
      });

    return btn;
  }

  private createSettingsPanel(width: number, height: number) {
    this.settingsContainer = this.add.container(width / 2, height * 0.85);
    this.settingsContainer.setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 0.9);
    bg.fillRoundedRect(-100, -40, 200, 80, 10);
    this.settingsContainer.add(bg);

    // Sound toggle logic
    const isSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.soundText = this.add.text(0, 0, `Sound: ${isSoundEnabled ? 'ON' : 'OFF'}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.soundText.on('pointerdown', () => {
      const current = localStorage.getItem('soundEnabled') !== 'false';
      const next = !current;
      localStorage.setItem('soundEnabled', next.toString());
      this.soundText.setText(`Sound: ${next ? 'ON' : 'OFF'}`);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    });

    this.settingsContainer.add(this.soundText);
  }

  update(_time: number, delta: number) {
    this.background.tilePositionY -= 0.5 * delta;
  }
}
