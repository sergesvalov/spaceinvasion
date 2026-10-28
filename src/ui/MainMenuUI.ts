import { UIComponent } from './UIComponent';
import { AudioManager } from '../services/AudioManager';
import { GameState } from '../services/GameState';
import { getLang, setLang, t } from '../services/i18n';

export interface MainMenuCallbacks {
  onPlay: () => void;
  onContinue: (level: number) => void;
  onGarage: () => void;
  onAIDemo: () => void;
  onExit: () => void;
  onLanguageChanged: () => void;
}

/** Only hosts that can actually close the app get an EXIT button. */
const canExit = (): boolean =>
  !!(window as any).Telegram?.WebApp?.initData || !!(window as any).Capacitor?.isNativePlatform?.();

export class MainMenuUI extends UIComponent {
  constructor(private callbacks: MainMenuCallbacks) {
    super('ui-container');
    this.container.className = 'main-menu-overlay';
  }

  protected template(): string {
    const state = GameState.getInstance();
    const level = state.unlockedLevel;
    const hasProgress = level > 1;
    const continueBtn = hasProgress
      ? `<button id="btn-continue" class="btn-cta">${t('menu.continue', { n: level })}</button>`
      : '';
    const hiScore =
      state.hiScore > 0
        ? `<div class="menu-hiscore">${t('menu.hiScore')} ${state.hiScore}</div>`
        : '';
    const exitBtn = canExit()
      ? `<button id="btn-exit" class="btn-secondary">${t('menu.exit')}</button>`
      : '';

    return `
      <div class="menu-logo">
        <span class="menu-logo-top">SPACE</span>
        <span class="menu-logo-bottom">INVASION</span>
        <div class="menu-tagline">${t('menu.tagline')}</div>
        ${hiScore}
      </div>
      <div class="main-menu-buttons">
        ${continueBtn}
        <button id="btn-play" class="${hasProgress ? 'btn-primary' : 'btn-cta'}">${
          hasProgress ? t('menu.newGame') : t('menu.start')
        }</button>
        <div class="menu-row">
          <button id="btn-garage" class="btn-primary">${t('menu.garage')}</button>
          <button id="btn-settings" class="btn-primary">${t('menu.settings')}</button>
        </div>
        ${exitBtn}
      </div>
      <div id="settings-backdrop" class="settings-backdrop">
        <div class="settings-panel ui-panel">
          <h2>${t('settings.title')}</h2>
          <button id="btn-toggle-sound" class="btn-primary"></button>
          <button id="btn-toggle-lang" class="btn-primary">${t('settings.lang')}</button>
          <button id="btn-ai" class="btn-primary">${t('settings.aiDemo')}</button>
          <button id="btn-close-settings" class="btn-cta">${t('settings.close')}</button>
        </div>
      </div>
    `;
  }

  protected setupBindings(): void {
    this.bindButton('#btn-play', () => {
      this.container.style.display = 'none';
      this.callbacks.onPlay();
    });

    if (this.$('#btn-continue')) {
      this.bindButton('#btn-continue', () => {
        this.container.style.display = 'none';
        this.callbacks.onContinue(GameState.getInstance().unlockedLevel);
      });
    }

    this.bindButton('#btn-garage', () => this.callbacks.onGarage());

    const backdrop = this.$('#settings-backdrop');
    this.bindButton('#btn-settings', () => backdrop?.classList.add('open'));
    this.bindButton('#btn-close-settings', () => backdrop?.classList.remove('open'));

    this.bindButton('#btn-ai', () => this.callbacks.onAIDemo());
    if (this.$('#btn-exit')) this.bindButton('#btn-exit', () => this.callbacks.onExit());

    this.updateSoundBtn();
    this.bindButton('#btn-toggle-sound', () => {
      AudioManager.getInstance().toggleSoundEnabled();
      this.updateSoundBtn();
    });

    this.bindButton('#btn-toggle-lang', () => {
      setLang(getLang() === 'ru' ? 'en' : 'ru');
      this.callbacks.onLanguageChanged();
    });
  }

  private updateSoundBtn(): void {
    const btnSound = this.$('#btn-toggle-sound');
    if (btnSound) {
      const on = AudioManager.getInstance().isSoundEnabled();
      btnSound.textContent = t('settings.sound', { v: t(on ? 'settings.on' : 'settings.off') });
    }
  }

  public hide(): void {
    this.container.style.display = 'none';
  }
}
