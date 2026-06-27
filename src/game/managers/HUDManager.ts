import { GameState } from '../../services/GameState';
import { EventBus } from '../../services/EventBus';

export class HUDManager {
  private hudEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private antimatterEl!: HTMLElement;
  private healthContainerEl!: HTMLElement;
  private healthFillEl!: HTMLElement;
  private shieldBtnEl!: HTMLElement;

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

    this.shieldBtnEl = document.createElement('div');
    this.shieldBtnEl.className = 'hud-shield-btn';
    this.shieldBtnEl.style.position = 'absolute';
    this.shieldBtnEl.style.bottom = '80px'; // Above potential ad banners or other UI
    this.shieldBtnEl.style.right = '20px';
    this.shieldBtnEl.style.padding = '15px 25px';
    this.shieldBtnEl.style.backgroundColor = 'rgba(0, 136, 255, 0.6)';
    this.shieldBtnEl.style.color = '#fff';
    this.shieldBtnEl.style.borderRadius = '8px';
    this.shieldBtnEl.style.cursor = 'pointer';
    this.shieldBtnEl.style.fontWeight = 'bold';
    this.shieldBtnEl.style.fontSize = '20px';
    this.shieldBtnEl.style.border = '2px solid #00ccff';
    this.shieldBtnEl.style.display = 'none';

    this.shieldBtnEl.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // Prevent double triggering on mobile
      EventBus.emit('shield_request');
    });

    this.hudEl.appendChild(this.shieldBtnEl);

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

    if (this.shieldBtnEl) {
      const shields = GameState.getInstance().shields;
      this.shieldBtnEl.textContent = `🛡️ SHIELD (${shields})`;
      this.shieldBtnEl.style.display = shields > 0 ? 'block' : 'none';
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
