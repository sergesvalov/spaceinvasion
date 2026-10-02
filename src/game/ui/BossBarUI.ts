export class BossBarUI {
  private bossBarContainer: HTMLElement;
  private bossBarFill: HTMLElement;
  private warningOverlayEl: HTMLElement;

  constructor(hudEl: HTMLElement) {
    this.bossBarContainer = hudEl.querySelector('#hud-boss-bar-container') as HTMLElement;
    this.bossBarFill = hudEl.querySelector('#hud-boss-bar-fill') as HTMLElement;
    this.warningOverlayEl = hudEl.querySelector('#hud-warning-overlay') as HTMLElement;
  }

  public show() {
    if (this.bossBarContainer) this.bossBarContainer.style.display = 'block';
    
    if (this.warningOverlayEl) {
      this.warningOverlayEl.classList.add('active');
      const warningText = document.createElement('div');
      warningText.className = 'warning-text';
      warningText.textContent = 'WARNING: BOSS APPROACHING';
      this.warningOverlayEl.appendChild(warningText);
      
      setTimeout(() => {
        if (this.warningOverlayEl) {
          this.warningOverlayEl.classList.remove('active');
          this.warningOverlayEl.innerHTML = '';
        }
      }, 3000);
    }
  }

  public hide() {
    if (this.bossBarContainer) this.bossBarContainer.style.display = 'none';
  }

  public update(currentHp: number, maxHp: number) {
    if (!this.bossBarFill) return;
    const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    this.bossBarFill.style.width = `${pct}%`;

    // Remove previous classes
    this.bossBarFill.classList.remove('high', 'med', 'low');

    if (pct > 60) {
      this.bossBarFill.classList.add('high');
    } else if (pct > 30) {
      this.bossBarFill.classList.add('med');
    } else {
      this.bossBarFill.classList.add('low');
    }
  }
}
