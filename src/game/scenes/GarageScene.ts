import Phaser from 'phaser';
import { GameState } from '../../services/GameState';

export class GarageScene extends Phaser.Scene {
  private sparksEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  
  private REPAIR_COST = 1000;
  private SHIELD_COST = 5; // Antimatter
  private BOMB_COST = 2500; // Credits
  private DRONE_COST = 15; // Antimatter

  private domElements: HTMLElement[] = [];

  constructor() {
    super({ key: 'GarageScene' });
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const { width, height } = this.scale;

    // Hologram Background
    const bg = this.add.image(width / 2, height / 2, 'game_atlas', 'hangar');
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    bg.setTint(0x004488); // Blueish holographic tint
    bg.setAlpha(0.6);

    // Scanlines
    const scanlines = this.add.graphics();
    scanlines.fillStyle(0x000000, 0.4);
    for (let i = 0; i < height; i += 4) {
      scanlines.fillRect(0, i, width, 1);
    }

    // Sparks Emitter for damage
    this.sparksEmitter = this.add.particles(width / 2, height / 2, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 200, max: 340 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      gravityY: 400,
      lifespan: 800,
      tint: [0xffffff, 0xffff00, 0xff0000],
      frequency: 50
    });

    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      const garageDiv = document.createElement('div');
      garageDiv.className = 'garage-overlay';
      garageDiv.innerHTML = `
        <div class="ui-panel garage-panel">
          <h1 class="garage-title">GARAGE</h1>
          <div class="garage-layout">
            <div class="garage-stats">
              <div class="stat-item"><span class="stat-label">ANTIMATTER</span> <span id="gar-am" class="stat-value text-am">0</span></div>
              <div class="stat-item"><span class="stat-label">CREDITS</span> <span id="gar-cr" class="stat-value text-cr">0</span></div>
              <div class="stat-item"><span class="stat-label">SHIP HP</span> <span id="gar-hp" class="stat-value text-hp">0</span></div>
              <div class="stat-item"><span class="stat-label">SHIELDS</span> <span id="gar-sh" class="stat-value text-sh">0</span></div>
              <div class="stat-item"><span class="stat-label">BOMBS</span> <span id="gar-bm" class="stat-value text-bm">0</span></div>
              <div class="stat-item"><span class="stat-label">WEAPON</span> <span id="gar-wp" class="stat-value text-wp">NONE</span></div>
              <div class="stat-item"><span class="stat-label">DRONE</span> <span id="gar-dr" class="stat-value text-dr">NONE</span></div>
            </div>
            <div class="garage-actions">
              <button id="btn-sw-wp" class="btn-primary btn-garage-action">SWITCH WEAPON</button>
              <button id="btn-buy-bm" class="btn-primary btn-garage-action">BUY BOMB</button>
              <button id="btn-buy-sh" class="btn-primary btn-garage-action">BUY SHIELD</button>
              <button id="btn-buy-dr" class="btn-primary btn-garage-action">BUY DRONE</button>
              <button id="btn-repair" class="btn-primary btn-garage-action btn-repair">REPAIR</button>
            </div>
          </div>
          <div class="garage-footer">
             <button id="btn-gar-back" class="btn-secondary">BACK TO MENU</button>
          </div>
        </div>
      `;
      uiContainer.appendChild(garageDiv);
      this.domElements.push(garageDiv);

      document.getElementById('btn-gar-back')?.addEventListener('click', () => {
        this.triggerHaptic('light');
        this.scene.start('MenuScene');
      });

      document.getElementById('btn-sw-wp')?.addEventListener('click', () => this.handleSwitchWeapon());
      document.getElementById('btn-buy-bm')?.addEventListener('click', () => this.handleBuyBomb());
      document.getElementById('btn-buy-sh')?.addEventListener('click', () => this.handleBuyShield());
      document.getElementById('btn-buy-dr')?.addEventListener('click', () => this.handleBuyDrone());
      document.getElementById('btn-repair')?.addEventListener('click', () => this.handleRepair());
    }

    this.events.once('shutdown', () => {
      this.domElements.forEach(el => el.remove());
      this.domElements = [];
    });

    this.updateUI();
  }

  private handleRepair() {
    const state = GameState.getInstance();
    if (state.currentHp < state.maxHp && state.credits >= this.REPAIR_COST) {
      state.spendCredits(this.REPAIR_COST);
      state.repair(1);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      if (state.credits < this.REPAIR_COST) this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private handleBuyBomb() {
    const state = GameState.getInstance();
    if (state.credits >= this.BOMB_COST) {
      state.spendCredits(this.BOMB_COST);
      state.addBomb(1);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private handleBuyDrone() {
    const state = GameState.getInstance();
    if (!state.hasDrone && state.antimatter >= this.DRONE_COST) {
      state.spendAntimatter(this.DRONE_COST);
      state.setHasDrone(true);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private handleSwitchWeapon() {
    const state = GameState.getInstance();
    const weapons: Array<'plasma' | 'ion' | 'wave'> = ['plasma', 'ion', 'wave'];
    const currentIndex = weapons.indexOf(state.equippedWeapon);
    const nextIndex = (currentIndex + 1) % weapons.length;
    state.setEquippedWeapon(weapons[nextIndex]);
    this.triggerHaptic('light');
    this.updateUI();
  }

  private triggerHaptic(type: 'light' | 'error') {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'light') {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      } else {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }

  private handleBuyShield() {
    const state = GameState.getInstance();
    if (state.antimatter >= this.SHIELD_COST) {
      state.spendAntimatter(this.SHIELD_COST);
      state.addShield(1);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private updateUI() {
    const state = GameState.getInstance();

    const setContent = (id: string, content: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = content;
    };

    const updateBtn = (id: string, text: string, canAfford: boolean, isMaxedOut: boolean = false) => {
      const btn = document.getElementById(id) as HTMLButtonElement;
      if (!btn) return;
      btn.textContent = text;
      
      if (isMaxedOut) {
        btn.disabled = true;
        btn.className = 'btn-primary btn-garage-action disabled maxed';
      } else if (!canAfford) {
        btn.disabled = false;
        btn.className = 'btn-primary btn-garage-action cant-afford';
      } else {
        btn.disabled = false;
        btn.className = 'btn-primary btn-garage-action';
      }
    };
    
    setContent('gar-am', state.antimatter.toString());
    setContent('gar-cr', state.credits.toString());
    setContent('gar-hp', `${state.currentHp} / ${state.maxHp}`);
    setContent('gar-sh', state.shields.toString());
    setContent('gar-bm', state.bombs.toString());
    setContent('gar-wp', state.equippedWeapon.toUpperCase());
    setContent('gar-dr', state.hasDrone ? 'EQUIPPED' : 'NONE');

    updateBtn('btn-sw-wp', `SWITCH WEAPON: ${state.equippedWeapon.toUpperCase()}`, true);
    updateBtn('btn-buy-bm', `BUY BOMB (${this.BOMB_COST} CR)`, state.credits >= this.BOMB_COST);
    updateBtn('btn-buy-sh', `BUY SHIELD (${this.SHIELD_COST} AM)`, state.antimatter >= this.SHIELD_COST);
    updateBtn('btn-buy-dr', state.hasDrone ? 'DRONE EQUIPPED' : `BUY DRONE (${this.DRONE_COST} AM)`, state.antimatter >= this.DRONE_COST, state.hasDrone);
    
    const needsRepair = state.currentHp < state.maxHp;
    updateBtn('btn-repair', needsRepair ? `REPAIR (${this.REPAIR_COST} CR)` : 'FULLY REPAIRED', state.credits >= this.REPAIR_COST, !needsRepair);

    if (!needsRepair) {
      this.sparksEmitter?.stop();
    } else {
      if (!this.sparksEmitter?.on) this.sparksEmitter?.start();
      const damage = state.maxHp - state.currentHp;
      this.sparksEmitter?.setFrequency(150 / damage);
    }
  }
}
