import { UIComponent } from './UIComponent';
import { AudioManager } from '../services/AudioManager';

export interface MainMenuCallbacks {
  onPlay: () => void;
  onGarage: () => void;
  onAIDemo: () => void;
  onExit: () => void;
}

export class MainMenuUI extends UIComponent {
  constructor(private callbacks: MainMenuCallbacks) {
    super('ui-container');
    this.container.className = 'main-menu-overlay';
  }

  protected template(): string {
    return `
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
  }

  protected setupBindings(): void {
    this.bindButton('#btn-play', () => {
      this.container.style.display = 'none';
      this.callbacks.onPlay();
    });

    this.bindButton('#btn-garage', () => this.callbacks.onGarage());

    const settingsPanel = this.$('#settings-panel');
    this.bindButton('#btn-settings', () => {
      if (settingsPanel) {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
      }
    });

    this.bindButton('#btn-ai', () => this.callbacks.onAIDemo());
    this.bindButton('#btn-exit', () => this.callbacks.onExit());

    // Settings logic
    this.updateSoundBtn();
    this.bindButton('#btn-toggle-sound', () => {
      AudioManager.getInstance().toggleSoundEnabled();
      this.updateSoundBtn();
    });

    this.bindButton('#btn-close-settings', () => {
      if (settingsPanel) settingsPanel.style.display = 'none';
    });
  }

  private updateSoundBtn(): void {
    const btnSound = this.$('#btn-toggle-sound');
    if (btnSound) {
      btnSound.textContent = `SOUND: ${AudioManager.getInstance().isSoundEnabled() ? 'ON' : 'OFF'}`;
    }
  }

  public hide(): void {
    this.container.style.display = 'none';
  }
}
