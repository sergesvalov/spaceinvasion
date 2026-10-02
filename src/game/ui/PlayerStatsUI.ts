import { GameState } from '../../services/GameState';
import { GameConfig } from '../config/GameConfig';
import { EventBus } from '../../services/EventBus';

export class PlayerStatsUI {
  private scoreEl: HTMLElement;
  private currentDisplayedScore: number = 0;
  private antimatterEl: HTMLElement;
  private healthContainerEl: HTMLElement;
  private shieldBtnEl: HTMLElement;
  private bombBtnEl: HTMLElement;

  constructor(hudEl: HTMLElement) {
    this.scoreEl = hudEl.querySelector('#hud-score') as HTMLElement;
    this.antimatterEl = hudEl.querySelector('#hud-antimatter') as HTMLElement;
    this.healthContainerEl = hudEl.querySelector('#hud-health-container') as HTMLElement;
    this.shieldBtnEl = hudEl.querySelector('#hud-shield-btn') as HTMLElement;
    this.bombBtnEl = hudEl.querySelector('#hud-bomb-btn') as HTMLElement;

    this.attachEvents();
  }

  private attachEvents() {
    const preventDefaultAndStop = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };

    if (this.shieldBtnEl) {
      this.shieldBtnEl.addEventListener('pointerdown', (e) => {
        preventDefaultAndStop(e);
        EventBus.emit('shield_request');
      });
    }

    if (this.bombBtnEl) {
      this.bombBtnEl.addEventListener('pointerdown', (e) => {
        preventDefaultAndStop(e);
        EventBus.emit('bomb_request');
      });
    }
  }

  public update(score: number, health: number, antimatter: number = 0) {
    if (this.scoreEl) {
      if (this.currentDisplayedScore !== score) {
        const diff = score - this.currentDisplayedScore;
        this.currentDisplayedScore += Math.ceil(diff * 0.2);
        if (Math.abs(score - this.currentDisplayedScore) < 5) {
          this.currentDisplayedScore = score;
        }
        this.scoreEl.textContent = `SCORE: ${this.currentDisplayedScore}`;
        
        this.scoreEl.style.transform = 'scale(1.2)';
        this.scoreEl.style.color = '#ffffff';
        setTimeout(() => {
          if (this.scoreEl) {
            this.scoreEl.style.transform = 'scale(1)';
            this.scoreEl.style.color = '#00ffcc';
          }
        }, 100);
      }
    }
    
    if (this.antimatterEl) {
      this.antimatterEl.textContent = `Antimatter: ${antimatter}`;
      if (antimatter >= GameConfig.Player.MechaCost) {
        this.antimatterEl.style.color = '#ffdd00';
        this.antimatterEl.style.textShadow = '0 0 10px #ffaa00';
        this.antimatterEl.innerHTML = `Antimatter: ${antimatter} <span style="font-size: 0.8em; color: #ffaa00;">[DOUBLE-TAP TO TRANSFORM]</span>`;
      } else {
        this.antimatterEl.style.color = '';
        this.antimatterEl.style.textShadow = '';
      }
    }
    
    if (this.healthContainerEl) {
      const maxHp = GameState.getInstance().maxHp;
      this.healthContainerEl.innerHTML = '';
      
      for (let i = 0; i < maxHp; i++) {
        const seg = document.createElement('div');
        seg.className = 'health-segment';
        if (i < health) {
          seg.classList.add('active');
          if (health <= 1) {
            seg.classList.add('danger');
          }
        }
        this.healthContainerEl.appendChild(seg);
      }
    }

    if (this.shieldBtnEl) {
      const shields = GameState.getInstance().shields;
      this.shieldBtnEl.textContent = `🛡️ SHIELD (${shields})`;
      this.shieldBtnEl.style.display = shields > 0 ? 'block' : 'none';
    }

    if (this.bombBtnEl) {
      const bombs = GameState.getInstance().bombs;
      this.bombBtnEl.textContent = `💣 BOMB (${bombs})`;
      this.bombBtnEl.style.display = bombs > 0 ? 'block' : 'none';
    }
  }
}
