import Phaser from 'phaser';
import { MainMenuUI } from '../../ui/MainMenuUI';

export class MenuScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private ui!: MainMenuUI;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const { width, height } = this.scale;

    // Draw the scrolling background
    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'starfield');

    this.ui = new MainMenuUI({
      onPlay: () => {
        import('../../services/StoryManager').then(({ StoryManager }) => {
          StoryManager.getInstance().showBriefing('level_1', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('MapScene', { level: 1 });
            });
          });
        });
      },
      onGarage: () => {
        this.scene.start('GarageScene');
      },
      onAIDemo: () => {
        (window as any).__AI_DEMO_MODE__ = true;
        (window as any).__START_GAME__();
      },
      onExit: async () => {
        if ((window as any).Telegram?.WebApp?.initData) {
          (window as any).Telegram.WebApp.close();
        } else if ((window as any).Capacitor?.isNativePlatform()) {
          try {
            const { App } = await import('@capacitor/app');
            await App.exitApp();
          } catch (e) {
            console.error('Failed to exit Capacitor app', e);
          }
        } else {
          window.close();
        }
      },
    });

    this.ui.mount();

    // Export for E2E tests
    (window as any).__START_GAME__ = () => {
      this.ui.hide();
      import('../../services/StoryManager').then(({ StoryManager }) => {
        StoryManager.getInstance().showBriefing('level_1', () => {
          this.cameras.main.fadeOut(10, 0, 0, 0); // Fast fade for tests
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MapScene', { level: 1 });
          });
        });
      });
    };

    this.events.once('shutdown', () => {
      this.ui.unmount();
    });
  }

  update(_time: number, delta: number) {
    this.background.tilePositionY -= 0.5 * delta;
  }
}
