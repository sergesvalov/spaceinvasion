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
  private bossBarLabel!: HTMLElement;
  private pauseBtnEl!: HTMLElement;
  private pauseOverlayEl!: HTMLElement;
  private resumeBtnEl!: HTMLElement;
  private warningOverlayEl!: HTMLElement;

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
    this.healthContainerEl.className = 'health-segments-container';
    
    // We will dynamically add segments in update()
    
    this.hudEl.appendChild(statsContainer);
    this.hudEl.appendChild(this.healthContainerEl);

    // Pause button
    this.pauseBtnEl = document.createElement('div');
    this.pauseBtnEl.className = 'hud-pause-btn';
    this.pauseBtnEl.textContent = '⏸';
    this.pauseBtnEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      EventBus.emit('toggle_pause');
    });
    this.hudEl.appendChild(this.pauseBtnEl);

    // Pause Overlay
    this.pauseOverlayEl = document.createElement('div');
    this.pauseOverlayEl.className = 'pause-overlay';
    this.pauseOverlayEl.style.display = 'none';

    const pauseTitle = document.createElement('div');
    pauseTitle.className = 'pause-title';
    pauseTitle.textContent = 'PAUSED';

    this.resumeBtnEl = document.createElement('div');
    this.resumeBtnEl.className = 'pause-resume-btn';
    this.resumeBtnEl.textContent = 'RESUME';
    this.resumeBtnEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      EventBus.emit('toggle_pause');
    });

    this.pauseOverlayEl.appendChild(pauseTitle);
    this.pauseOverlayEl.appendChild(this.resumeBtnEl);
    this.hudEl.appendChild(this.pauseOverlayEl);

    this.shieldBtnEl = document.createElement('div');
    this.shieldBtnEl.className = 'hud-shield-btn';


    this.shieldBtnEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault(); // Prevent double triggering on mobile
      EventBus.emit('shield_request');
    });

    this.hudEl.appendChild(this.shieldBtnEl);

    // Bomb Button
    this.bombBtnEl = document.createElement('div');
    this.bombBtnEl.className = 'hud-bomb-btn';


    this.bombBtnEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault(); 
      EventBus.emit('bomb_request');
    });

    this.hudEl.appendChild(this.bombBtnEl);

    // Warning Overlay
    this.warningOverlayEl = document.createElement('div');
    this.warningOverlayEl.className = 'warning-overlay';
    this.hudEl.appendChild(this.warningOverlayEl);

    // Boss HP bar
    this.bossBarContainer = document.createElement('div');
    this.bossBarContainer.className = 'boss-bar-container';

    this.bossBarLabel = document.createElement('div');
    this.bossBarLabel.className = 'boss-bar-label';
    this.bossBarLabel.textContent = '⚠ BOSS';

    const bossBarTrack = document.createElement('div');
    bossBarTrack.className = 'boss-bar-track';

    this.bossBarFill = document.createElement('div');
    this.bossBarFill.className = 'boss-bar-fill';

    bossBarTrack.appendChild(this.bossBarFill);
    this.bossBarContainer.appendChild(this.bossBarLabel);
    this.bossBarContainer.appendChild(bossBarTrack);
    this.hudEl.appendChild(this.bossBarContainer);

    uiContainer.appendChild(this.hudEl);
    
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

    if (pct > 60) {
      this.bossBarFill.style.backgroundColor = '#ff2200';
      this.bossBarFill.style.boxShadow = '0 0 12px #ff2200';
    } else if (pct > 30) {
      this.bossBarFill.style.backgroundColor = '#ff8800';
      this.bossBarFill.style.boxShadow = '0 0 12px #ff8800';
    } else {
      this.bossBarFill.style.backgroundColor = '#ffcc00';
      this.bossBarFill.style.boxShadow = '0 0 12px #ffcc00, 0 0 20px #ff4400';
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
}
