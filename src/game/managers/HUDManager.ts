import { GameState } from '../../services/GameState';

export class HUDManager {
  private hudEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private antimatterEl!: HTMLElement;
  private healthContainerEl!: HTMLElement;
  private healthFillEl!: HTMLElement;

  public createHUD(initialHealth: number) {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;

    this.hudEl = document.createElement('div');
    this.hudEl.className = 'hud';
    
    const statsContainer = document.createElement('div');
    statsContainer.className = 'hud-stats';
    
    this.scoreEl = document.createElement('div');
    this.scoreEl.textContent = 'Score: 0';
    
    this.antimatterEl = document.createElement('div');
    this.antimatterEl.textContent = 'Antimatter: 0';
    
    statsContainer.appendChild(this.scoreEl);
    statsContainer.appendChild(this.antimatterEl);
    
    this.healthContainerEl = document.createElement('div');
    this.healthContainerEl.className = 'health-bar-container';
    
    this.healthFillEl = document.createElement('div');
    this.healthFillEl.className = 'health-bar-fill';
    
    this.healthContainerEl.appendChild(this.healthFillEl);
    
    this.hudEl.appendChild(statsContainer);
    this.hudEl.appendChild(this.healthContainerEl);
    uiContainer.appendChild(this.hudEl);
    
    this.update(0, initialHealth, 0);
  }

  public update(score: number, health: number, antimatter: number = 0) {
    if (this.scoreEl) this.scoreEl.textContent = `Score: ${score}`;
    if (this.antimatterEl) {
      this.antimatterEl.textContent = `Antimatter: ${antimatter}`;
      if (antimatter >= 5) {
        this.antimatterEl.style.color = '#ffdd00';
        this.antimatterEl.style.textShadow = '0 0 10px #ffaa00';
        this.antimatterEl.innerHTML = `Antimatter: ${antimatter} <span style="font-size: 0.8em; color: #ffaa00;">[DOUBLE-TAP TO TRANSFORM]</span>`;
      } else {
        this.antimatterEl.style.color = '';
        this.antimatterEl.style.textShadow = '';
      }
    }
    
    if (this.healthFillEl) {
      const maxHp = GameState.getInstance().maxHp;
      const percentage = Math.max(0, Math.min(100, (health / maxHp) * 100));
      this.healthFillEl.style.width = `${percentage}%`;
      
      if (percentage > 50) {
        this.healthFillEl.style.backgroundColor = '#00ff00';
        this.healthFillEl.style.boxShadow = '0 0 10px #00ff00';
      } else if (percentage > 25) {
        this.healthFillEl.style.backgroundColor = '#ffff00';
        this.healthFillEl.style.boxShadow = '0 0 10px #ffff00';
      } else {
        this.healthFillEl.style.backgroundColor = '#ff0000';
        this.healthFillEl.style.boxShadow = '0 0 10px #ff0000';
      }
    }
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
