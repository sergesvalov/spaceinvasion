import { UIComponent } from './UIComponent';
import { GameState } from '../services/GameState';

export interface GarageCallbacks {
  onBack: () => void;
  onRepair: () => void;
  onBuyBomb: () => void;
  onBuyShield: () => void;
  onBuyDrone: () => void;
  onSwitchWeapon: () => void;
}

export class GarageUI extends UIComponent {
  private REPAIR_COST = 1000;
  private SHIELD_COST = 5;
  private BOMB_COST = 2500;
  private DRONE_COST = 15;

  constructor(private callbacks: GarageCallbacks) {
    super('ui-container');
    this.container.className = 'garage-overlay';
  }

  protected template(): string {
    return `
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
  }

  protected setupBindings(): void {
    this.bindButton('#btn-gar-back', () => this.callbacks.onBack());
    this.bindButton('#btn-sw-wp', () => this.callbacks.onSwitchWeapon());
    this.bindButton('#btn-buy-bm', () => this.callbacks.onBuyBomb());
    this.bindButton('#btn-buy-sh', () => this.callbacks.onBuyShield());
    this.bindButton('#btn-buy-dr', () => this.callbacks.onBuyDrone());
    this.bindButton('#btn-repair', () => this.callbacks.onRepair());

    this.update();
  }

  public update(): void {
    if (!this.isMounted) return;

    const state = GameState.getInstance();

    const setContent = (id: string, content: string) => {
      const el = this.$('#' + id);
      if (el) el.textContent = content;
    };

    const updateBtn = (
      id: string,
      text: string,
      canAfford: boolean,
      isMaxedOut: boolean = false,
    ) => {
      const btn = this.$('#' + id) as HTMLButtonElement;
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
    updateBtn(
      'btn-buy-sh',
      `BUY SHIELD (${this.SHIELD_COST} AM)`,
      state.antimatter >= this.SHIELD_COST,
    );
    updateBtn(
      'btn-buy-dr',
      state.hasDrone ? 'DRONE EQUIPPED' : `BUY DRONE (${this.DRONE_COST} AM)`,
      state.antimatter >= this.DRONE_COST,
      state.hasDrone,
    );

    const needsRepair = state.currentHp < state.maxHp;
    updateBtn(
      'btn-repair',
      needsRepair ? `REPAIR (${this.REPAIR_COST} CR)` : 'FULLY REPAIRED',
      state.credits >= this.REPAIR_COST,
      !needsRepair,
    );
  }
}
