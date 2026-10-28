import { PlayerStatsUI } from '../ui/PlayerStatsUI';
import { PauseMenuUI } from '../ui/PauseMenuUI';
import { BossBarUI } from '../ui/BossBarUI';
import { ToastManager } from '../ui/ToastManager';
import { TutorialUI } from '../ui/TutorialUI';
import { FloatingTextManager } from '../effects/FloatingTextManager';
import { GameConfig } from '../config/GameConfig';
import { t } from '../../services/i18n';

export class HUDManager {
  private hudEl!: HTMLElement;
  private playerStatsUI!: PlayerStatsUI;
  private pauseMenuUI!: PauseMenuUI;
  private bossBarUI!: BossBarUI;
  private tutorialUI!: TutorialUI;

  public createHUD(initialHealth: number, level: number = 1) {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;

    this.hudEl = document.createElement('div');
    this.hudEl.className = 'hud';
    this.hudEl.innerHTML = `
      <div id="hud-vignette" class="hud-vignette"></div>

      <div class="hud-top-bar">
        <div id="hud-hp" class="hud-hp">
          <span class="hud-label">HP</span>
          <div id="hud-health-container" class="health-segments-container"></div>
        </div>
        <div class="hud-score-block">
          <div id="hud-score" class="hud-score">0</div>
          <div id="hud-record" class="hud-record">${t('hud.newRecord')}</div>
        </div>
        <button id="hud-pause-btn" class="hud-pause-btn" aria-label="${t('pause.title')}"><span></span><span></span></button>
      </div>

      <div class="hud-sub-bar">
        <div id="hud-am" class="hud-am">
          <img class="am-icon" src="antimatter.png" alt="" />
          <span id="hud-antimatter">0</span>
        </div>
      </div>

      <div id="hud-boss-bar-container" class="boss-bar-container">
        <div class="boss-bar-label"><span>${t('boss.label')}</span><span id="hud-boss-pct">100%</span></div>
        <div class="boss-bar-track"><div id="hud-boss-bar-fill" class="boss-bar-fill high"></div></div>
      </div>

      <div id="hud-warning-overlay" class="warning-overlay"></div>
      <div id="hud-tutorial" class="hud-tutorial"></div>

      <div class="hud-actions hud-actions-left">
        <button id="hud-mecha-btn" class="hud-action mecha-action">
          <span class="hud-action-icon"><img src="mecha.png" alt="" /></span>
          <span>${t('hud.mecha')}</span>
          <span class="badge">${GameConfig.Player.MechaCost}</span>
          <div class="hud-action-timer"></div>
        </button>
      </div>

      <div class="hud-actions hud-actions-right">
        <button id="hud-bomb-btn" class="hud-action bomb-action hidden">
          <span class="hud-action-icon"><span class="icon-bomb"></span></span>
          <span>${t('hud.bomb')}</span>
          <span id="hud-bomb-count" class="badge">0</span>
        </button>
        <button id="hud-shield-btn" class="hud-action shield-action hidden">
          <span class="hud-action-icon"><span class="icon-shield"></span></span>
          <span>${t('hud.shield')}</span>
          <span id="hud-shield-count" class="badge">0</span>
          <div class="hud-action-timer"></div>
        </button>
      </div>

      <div id="hud-pause-overlay" class="pause-overlay" style="display: none;">
        <div class="ui-panel pause-panel">
          <div class="pause-title">${t('pause.title')}</div>
          <button id="hud-resume-btn" class="btn-cta">${t('pause.resume')}</button>
          <button id="hud-menu-btn" class="btn-primary">${t('pause.menu')}</button>
        </div>
      </div>
    `;

    uiContainer.appendChild(this.hudEl);

    // Initialize UI components
    this.tutorialUI = new TutorialUI(this.hudEl);
    this.playerStatsUI = new PlayerStatsUI(this.hudEl, this.tutorialUI);
    this.pauseMenuUI = new PauseMenuUI(this.hudEl);
    this.bossBarUI = new BossBarUI(this.hudEl);

    this.update(0, initialHealth, 0);
    this.tutorialUI.start(level);
  }

  public update(score: number, health: number, antimatter: number = 0) {
    this.playerStatsUI.update(score, health, antimatter);
  }

  public show() {
    if (this.hudEl) this.hudEl.style.display = 'flex';
  }

  public hide() {
    if (this.hudEl) this.hudEl.style.display = 'none';
  }

  public showBossWarning(durationMs: number) {
    this.bossBarUI.showWarning(durationMs);
  }

  public showBossBar() {
    this.bossBarUI.show();
  }

  public hideBossBar() {
    this.bossBarUI.hide();
  }

  public updateBossBar(currentHp: number, maxHp: number) {
    this.bossBarUI.update(currentHp, maxHp);
  }

  public destroy() {
    this.playerStatsUI?.destroy();
    this.tutorialUI?.destroy();
    this.bossBarUI?.destroy();
    if (this.hudEl) this.hudEl.remove();
  }

  public showPauseOverlay() {
    this.playerStatsUI.setPaused(true);
    this.pauseMenuUI.showOverlay();
  }

  public hidePauseOverlay() {
    this.playerStatsUI.setPaused(false);
    this.pauseMenuUI.hideOverlay();
  }

  // Proxies for legacy usages
  public showFloatingText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color: string,
    duration?: number,
    scale?: number,
  ) {
    FloatingTextManager.show(scene, x, y, text, color, duration, scale);
  }

  public showAchievement(title: string, desc: string) {
    ToastManager.showAchievement(title, desc);
  }
}
