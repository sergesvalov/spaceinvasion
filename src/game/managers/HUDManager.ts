export class HUDManager {
  private hudEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private healthEl!: HTMLElement;

  public createHUD(initialHealth: number) {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;

    this.hudEl = document.createElement('div');
    this.hudEl.className = 'hud';
    
    this.scoreEl = document.createElement('div');
    this.scoreEl.textContent = 'Score: 0';
    
    this.healthEl = document.createElement('div');
    this.healthEl.textContent = `HP: ${initialHealth}`;
    
    this.hudEl.appendChild(this.scoreEl);
    this.hudEl.appendChild(this.healthEl);
    uiContainer.appendChild(this.hudEl);
  }

  public update(score: number, health: number) {
    if (this.scoreEl) this.scoreEl.textContent = `Score: ${score}`;
    if (this.healthEl) this.healthEl.textContent = `HP: ${health}`;
  }

  public show() {
    if (this.hudEl) this.hudEl.style.display = 'flex';
  }

  public hide() {
    if (this.hudEl) this.hudEl.style.display = 'none';
  }

  public destroy() {
    if (this.hudEl) this.hudEl.remove();
  }
}
