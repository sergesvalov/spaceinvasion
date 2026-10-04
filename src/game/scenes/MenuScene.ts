import Phaser from 'phaser';
import { AudioManager } from '../../services/AudioManager';

export class MenuScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const { width, height } = this.scale;

    // Draw the scrolling background
    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'starfield');

    // Export for E2E tests
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

    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      const menuDiv = document.createElement('div');
      menuDiv.className = 'main-menu-overlay';
      menuDiv.innerHTML = `
        <div class="main-menu-panel ui-panel">
          <h1 class="main-menu-title">SPACE INVASION</h1>
          <div class="main-menu-buttons">
            <button id="btn-play" class="btn-primary">START MISSION</button>
            <button id="btn-garage" class="btn-primary">GARAGE</button>
            <button id="btn-settings" class="btn-primary">SETTINGS</button>
            <button id="btn-ai" class="btn-primary">AI DEMO</button>
            <button id="btn-exit" class="btn-primary">EXIT</button>
          </div>
        </div>
        <div id="settings-panel" class="settings-panel ui-panel" style="display: none;">
          <h2>SETTINGS</h2>
          <button id="btn-toggle-sound" class="btn-primary">SOUND: ON</button>
          <button id="btn-close-settings" class="btn-primary">CLOSE</button>
        </div>
      `;
      uiContainer.appendChild(menuDiv);

      const haptic = () => {
        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
          (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
      };

      const bindButton = (id: string, handler: () => void) => {
        document.getElementById(id)?.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          haptic();
          handler();
        });
      };

      bindButton('btn-play', () => {
        // Trigger normal play which uses fade out
        import('../../services/StoryManager').then(({ StoryManager }) => {
          StoryManager.getInstance().showBriefing('level_1', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.scene.start('MapScene', { level: 1 });
            });
          });
        });
      });

      bindButton('btn-garage', () => {
        this.scene.start('GarageScene');
      });

      const settingsPanel = document.getElementById('settings-panel');
      bindButton('btn-settings', () => {
        if (settingsPanel)
          settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
      });

      bindButton('btn-ai', () => {
        (window as any).__AI_DEMO_MODE__ = true;
        (window as any).__START_GAME__();
      });

      bindButton('btn-exit', async () => {
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
      });

      // Settings Logic
      const btnSound = document.getElementById('btn-toggle-sound');
      const updateSoundBtn = () => {
        if (btnSound) {
          btnSound.textContent = `SOUND: ${AudioManager.getInstance().isSoundEnabled() ? 'ON' : 'OFF'}`;
        }
      };
      updateSoundBtn();

      bindButton('btn-toggle-sound', () => {
        AudioManager.getInstance().toggleSoundEnabled();
        updateSoundBtn();
      });

      bindButton('btn-close-settings', () => {
        if (settingsPanel) settingsPanel.style.display = 'none';
      });

      this.events.once('shutdown', () => {
        menuDiv.remove();
      });
    }
  }

  update(_time: number, delta: number) {
    this.background.tilePositionY -= 0.5 * delta;
  }
}
