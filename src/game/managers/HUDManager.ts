import { GameState } from '../../services/GameState';
import { EventBus } from '../../services/EventBus';
import { GameConfig } from '../config/GameConfig';
import { StyleConfig } from '../config/StyleConfig';

export class HUDManager {
  private hudEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private currentDisplayedScore: number = 0;
  private antimatterEl!: HTMLElement;
  private healthContainerEl!: HTMLElement;
  private shieldBtnEl!: HTMLElement;
  private bombBtnEl!: HTMLElement;
  private bossBarContainer!: HTMLElement;
  private bossBarFill!: HTMLElement;
  private pauseBtnEl!: HTMLElement;
  private pauseOverlayEl!: HTMLElement;
  private resumeBtnEl!: HTMLElement;
  private warningOverlayEl!: HTMLElement;

  public createHUD(initialHealth: number) {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;

    this.hudEl = document.createElement('div');
    this.hudEl.className = 'hud';
    this.hudEl.innerHTML = `
      <div class="hud-top-bar">
        <div class="hud-health-module ui-panel">
          <div id="hud-health-container" class="health-segments-container"></div>
        </div>
        
        <div class="hud-stats-module ui-panel">
          <div id="hud-score" class="hud-stat">SCORE: 0</div>
          <div id="hud-antimatter" class="hud-stat">ANTIMATTER: 0</div>
        </div>
        
        <div id="hud-pause-btn" class="hud-pause-btn ui-panel">⏸</div>
      </div>
      
      <div id="hud-pause-overlay" class="pause-overlay" style="display: none;">
        <div class="ui-panel pause-panel">
          <div class="pause-title">PAUSED</div>
          <button id="hud-resume-btn" class="btn-primary">RESUME MISSION</button>
          <button id="hud-menu-btn" class="btn-primary" style="margin-top: 15px;">MAIN MENU</button>
        </div>
      </div>

      <div class="hud-actions-container">
        <button id="hud-shield-btn" class="btn-hud-action shield-action" style="display: none;">SHIELD (0)</button>
        <button id="hud-bomb-btn" class="btn-hud-action bomb-action" style="display: none;">BOMB (0)</button>
      </div>
      
      <div id="hud-warning-overlay" class="warning-overlay"></div>
      
      <div id="hud-boss-bar-container" class="boss-bar-container" style="display: none;">
        <div class="boss-bar-label">⚠ BOSS ENTITY DETECTED</div>
        <div class="boss-bar-track"><div id="hud-boss-bar-fill" class="boss-bar-fill"></div></div>
      </div>
    `;

    uiContainer.appendChild(this.hudEl);

    // Grab references
    this.scoreEl = this.hudEl.querySelector('#hud-score') as HTMLElement;
    this.antimatterEl = this.hudEl.querySelector('#hud-antimatter') as HTMLElement;
    this.healthContainerEl = this.hudEl.querySelector('#hud-health-container') as HTMLElement;
    this.pauseBtnEl = this.hudEl.querySelector('#hud-pause-btn') as HTMLElement;
    this.pauseOverlayEl = this.hudEl.querySelector('#hud-pause-overlay') as HTMLElement;
    this.resumeBtnEl = this.hudEl.querySelector('#hud-resume-btn') as HTMLElement;
    this.shieldBtnEl = this.hudEl.querySelector('#hud-shield-btn') as HTMLElement;
    this.bombBtnEl = this.hudEl.querySelector('#hud-bomb-btn') as HTMLElement;
    this.warningOverlayEl = this.hudEl.querySelector('#hud-warning-overlay') as HTMLElement;
    this.bossBarContainer = this.hudEl.querySelector('#hud-boss-bar-container') as HTMLElement;
    this.bossBarFill = this.hudEl.querySelector('#hud-boss-bar-fill') as HTMLElement;

    // Attach event listeners
    const preventDefaultAndStop = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };

    this.pauseBtnEl.addEventListener('pointerdown', (e) => {
      preventDefaultAndStop(e);
      EventBus.emit('toggle_pause');
    });

    this.resumeBtnEl.addEventListener('pointerdown', (e) => {
      preventDefaultAndStop(e);
      EventBus.emit('toggle_pause');
    });

    const menuBtnEl = this.hudEl.querySelector('#hud-menu-btn');
    menuBtnEl?.addEventListener('pointerdown', (e) => {
      preventDefaultAndStop(e);
      EventBus.emit('quit_to_menu');
    });

    this.shieldBtnEl.addEventListener('pointerdown', (e) => {
      preventDefaultAndStop(e);
      EventBus.emit('shield_request');
    });

    this.bombBtnEl.addEventListener('pointerdown', (e) => {
      preventDefaultAndStop(e);
      EventBus.emit('bomb_request');
    });

    this.update(0, initialHealth, 0);
  }

  public update(score: number, health: number, antimatter: number = 0) {
    if (this.scoreEl) {
      if (this.currentDisplayedScore !== score) {
        // Animate score update logic
        const diff = score - this.currentDisplayedScore;
        this.currentDisplayedScore += Math.ceil(diff * 0.2); // Smooth follow
        if (Math.abs(score - this.currentDisplayedScore) < 5) {
          this.currentDisplayedScore = score;
        }
        this.scoreEl.textContent = `SCORE: ${this.currentDisplayedScore}`;
        
        // Pop effect
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
      this.healthContainerEl.innerHTML = ''; // clear segments
      
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

  public show() {
    if (this.hudEl) this.hudEl.style.display = 'flex';
  }

  public hide() {
    if (this.hudEl) this.hudEl.style.display = 'none';
  }

  public showBossBar() {
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

  public hideBossBar() {
    if (this.bossBarContainer) this.bossBarContainer.style.display = 'none';
  }

  public updateBossBar(currentHp: number, maxHp: number) {
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

  public destroy() {
    if (this.hudEl) this.hudEl.remove();
  }

  public showPauseOverlay() {
    if (this.pauseOverlayEl) this.pauseOverlayEl.style.display = 'flex';
    if (this.pauseBtnEl) this.pauseBtnEl.style.display = 'none';
  }

  public hidePauseOverlay() {
    if (this.pauseOverlayEl) this.pauseOverlayEl.style.display = 'none';
    if (this.pauseBtnEl) this.pauseBtnEl.style.display = 'block';
  }

  public showFloatingText(scene: Phaser.Scene, x: number, y: number, text: string, color: string) {
    const txt = scene.add.text(x, y, text, {
      fontFamily: StyleConfig.Fonts.Main,
      fontSize: '20px',
      fontStyle: 'bold',
      color: color,
      stroke: StyleConfig.Colors.Black,
      strokeThickness: 3
    }).setOrigin(0.5);
    
    scene.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => txt.destroy()
    });
  }

  public showAchievement(title: string, desc: string) {
    const achEl = document.createElement('div');
    achEl.className = 'achievement-toast ui-panel';
    achEl.style.position = 'absolute';
    achEl.style.top = '20px';
    achEl.style.left = '50%';
    achEl.style.transform = 'translateX(-50%) translateY(-100px)';
    achEl.style.zIndex = '1000';
    achEl.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    achEl.style.display = 'flex';
    achEl.style.flexDirection = 'column';
    achEl.style.alignItems = 'center';
    achEl.style.background = 'rgba(0, 50, 20, 0.8)';
    achEl.style.border = '1px solid #00ff00';
    
    achEl.innerHTML = `
      <div style="color: #00ff00; font-weight: bold; font-size: 14px; margin-bottom: 4px;">🏆 ACHIEVEMENT UNLOCKED</div>
      <div style="color: #ffffff; font-weight: bold; font-size: 18px;">${title}</div>
      <div style="color: #cccccc; font-size: 12px; text-align: center;">${desc}</div>
    `;

    document.getElementById('ui-container')?.appendChild(achEl);

    // Slide in
    setTimeout(() => {
      achEl.style.transform = 'translateX(-50%) translateY(0)';
    }, 50);

    // Slide out and remove
    setTimeout(() => {
      achEl.style.transform = 'translateX(-50%) translateY(-150px)';
      setTimeout(() => achEl.remove(), 500);
    }, 4000);
  }
}
