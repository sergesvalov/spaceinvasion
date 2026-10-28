import { t } from '../../services/i18n';

export class BossBarUI {
  private bossBarContainer: HTMLElement;
  private bossBarFill: HTMLElement;
  private bossPctEl: HTMLElement;
  private warningOverlayEl: HTMLElement;
  private warningTimer?: number;

  constructor(hudEl: HTMLElement) {
    this.bossBarContainer = hudEl.querySelector('#hud-boss-bar-container') as HTMLElement;
    this.bossBarFill = hudEl.querySelector('#hud-boss-bar-fill') as HTMLElement;
    this.bossPctEl = hudEl.querySelector('#hud-boss-pct') as HTMLElement;
    this.warningOverlayEl = hudEl.querySelector('#hud-warning-overlay') as HTMLElement;
  }

  /** Hazard-striped "WARNING" band across the playfield before the boss enters. */
  public showWarning(durationMs: number) {
    if (!this.warningOverlayEl) return;
    this.warningOverlayEl.innerHTML = `<div class="warning-text"><b>${t('boss.warning')}</b>${t('boss.approaching')}</div>`;
    this.warningOverlayEl.classList.add('active');

    if (this.warningTimer) clearTimeout(this.warningTimer);
    this.warningTimer = window.setTimeout(() => {
      this.warningOverlayEl.classList.remove('active');
      this.warningOverlayEl.innerHTML = '';
    }, durationMs);
  }

  public show() {
    this.bossBarContainer?.classList.add('visible');
  }

  public hide() {
    this.bossBarContainer?.classList.remove('visible');
  }

  public update(currentHp: number, maxHp: number) {
    if (!this.bossBarFill) return;
    const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    this.bossBarFill.style.width = `${pct}%`;
    if (this.bossPctEl) this.bossPctEl.textContent = `${Math.ceil(pct)}%`;

    this.bossBarFill.classList.toggle('high', pct > 60);
    this.bossBarFill.classList.toggle('med', pct > 30 && pct <= 60);
    this.bossBarFill.classList.toggle('low', pct <= 30);
  }

  public destroy() {
    if (this.warningTimer) clearTimeout(this.warningTimer);
  }
}
