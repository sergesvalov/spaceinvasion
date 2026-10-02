import { EventBus } from '../../services/EventBus';

export class PauseMenuUI {
  private pauseBtnEl: HTMLElement;
  private pauseOverlayEl: HTMLElement;
  private resumeBtnEl: HTMLElement;
  private menuBtnEl: HTMLElement | null;

  constructor(hudEl: HTMLElement) {
    this.pauseBtnEl = hudEl.querySelector('#hud-pause-btn') as HTMLElement;
    this.pauseOverlayEl = hudEl.querySelector('#hud-pause-overlay') as HTMLElement;
    this.resumeBtnEl = hudEl.querySelector('#hud-resume-btn') as HTMLElement;
    this.menuBtnEl = hudEl.querySelector('#hud-menu-btn');

    this.attachEvents();
  }

  private attachEvents() {
    const preventDefaultAndStop = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };

    if (this.pauseBtnEl) {
      this.pauseBtnEl.addEventListener('pointerdown', (e) => {
        preventDefaultAndStop(e);
        EventBus.emit('toggle_pause');
      });
    }

    if (this.resumeBtnEl) {
      this.resumeBtnEl.addEventListener('pointerdown', (e) => {
        preventDefaultAndStop(e);
        EventBus.emit('toggle_pause');
      });
    }

    if (this.menuBtnEl) {
      this.menuBtnEl.addEventListener('pointerdown', (e) => {
        preventDefaultAndStop(e);
        EventBus.emit('quit_to_menu');
      });
    }
  }

  public showOverlay() {
    if (this.pauseOverlayEl) this.pauseOverlayEl.style.display = 'flex';
    if (this.pauseBtnEl) this.pauseBtnEl.style.display = 'none';
  }

  public hideOverlay() {
    if (this.pauseOverlayEl) this.pauseOverlayEl.style.display = 'none';
    if (this.pauseBtnEl) this.pauseBtnEl.style.display = 'block';
  }
}
