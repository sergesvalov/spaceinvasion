import { PlayerStatsUI } from '../ui/PlayerStatsUI';
import { PauseMenuUI } from '../ui/PauseMenuUI';
import { BossBarUI } from '../ui/BossBarUI';
import { ToastManager } from '../ui/ToastManager';
import { FloatingTextManager } from '../effects/FloatingTextManager';

export class HUDManager {
  private hudEl!: HTMLElement;
  private playerStatsUI!: PlayerStatsUI;
  private pauseMenuUI!: PauseMenuUI;
  private bossBarUI!: BossBarUI;

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

    // Initialize UI components
    this.playerStatsUI = new PlayerStatsUI(this.hudEl);
    this.pauseMenuUI = new PauseMenuUI(this.hudEl);
    this.bossBarUI = new BossBarUI(this.hudEl);

    this.update(0, initialHealth, 0);
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
    if (this.hudEl) this.hudEl.remove();
  }

  public showPauseOverlay() {
    this.pauseMenuUI.showOverlay();
  }

  public hidePauseOverlay() {
    this.pauseMenuUI.hideOverlay();
  }

  // Proxies for legacy usages
  public showFloatingText(scene: Phaser.Scene, x: number, y: number, text: string, color: string) {
    FloatingTextManager.show(scene, x, y, text, color);
  }

  public showAchievement(title: string, desc: string) {
    ToastManager.showAchievement(title, desc);
  }
}
