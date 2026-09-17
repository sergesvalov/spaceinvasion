import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { AudioManager } from '../../services/AudioManager';

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
    Button.create(this, width / 2, height * 0.4, 'PLAY', () => {
      import('../../services/StoryManager').then(({ StoryManager }) => {
        StoryManager.getInstance().showBriefing('level_1', () => {
          this.cameras.main.fadeOut(1000, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MapScene', { level: 1 });
          });
        });
      });
    });

    // Экспортируем функцию для E2E тестов
    (window as any).__START_GAME__ = () => {
      import('../../services/StoryManager').then(({ StoryManager }) => {
        StoryManager.getInstance().showBriefing('level_1', () => {
          this.cameras.main.fadeOut(10, 0, 0, 0); // Fast fade for tests
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MapScene', { level: 1 });
          });
        });
      });
    };

    // Garage Button
    Button.create(this, width / 2, height * 0.5, 'GARAGE', () => {
      this.scene.start('GarageScene');
    });

    // Settings Button
    Button.create(this, width / 2, height * 0.6, 'SETTINGS', () => {
      this.settingsContainer.setVisible(!this.settingsContainer.visible);
    });

    // AI Test Button
    Button.create(this, width / 2, height * 0.7, 'AI TEST', () => {
      (window as any).__AI_DEMO_MODE__ = true;
      (window as any).__START_GAME__();
    });

    // Exit Button
    Button.create(this, width / 2, height * 0.8, 'EXIT', async () => {
      // Telegram WebApp
      if ((window as any).Telegram?.WebApp?.initData) {
        (window as any).Telegram.WebApp.close();
      } 
      // Capacitor (Android/iOS)
      else if ((window as any).Capacitor?.isNativePlatform()) {
        try {
          const { App } = await import('@capacitor/app');
          await App.exitApp();
        } catch (e) {
          console.error('Failed to exit Capacitor app', e);
        }
      } 
      // Browser Fallback
      else {
        window.close();
      }
    });

    // Settings Panel
    this.createSettingsPanel(width, height);
  }


  private createSettingsPanel(width: number, height: number) {
    this.settingsContainer = this.add.container(width / 2, height * 0.95);
    this.settingsContainer.setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 0.9);
    bg.fillRoundedRect(-100, -40, 200, 80, 10);
    this.settingsContainer.add(bg);

    // Sound toggle logic
    const isSoundEnabled = AudioManager.getInstance().isSoundEnabled();
    this.soundText = this.add.text(0, 0, `Sound: ${isSoundEnabled ? 'ON' : 'OFF'}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.soundText.on('pointerdown', () => {
      const next = AudioManager.getInstance().toggleSoundEnabled();
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
