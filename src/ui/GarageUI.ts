import { UIComponent } from './UIComponent';
import { GameState } from '../services/GameState';
import { GameConfig } from '../game/config/GameConfig';
import { AudioManager } from '../services/AudioManager';
import { Haptics } from '../services/Haptics';
import { t, I18nKey } from '../services/i18n';

export type WeaponId = 'plasma' | 'ion' | 'wave';

export interface GarageCallbacks {
  onBack: () => void;
  // Purchase handlers return false when the player can't afford / can't buy
  onRepair: () => boolean;
  onBuyBomb: () => boolean;
  onBuyShield: () => boolean;
  onBuyDrone: () => boolean;
  onSelectWeapon: (weapon: WeaponId) => void;
}

// 1-5 pips, derived from WeaponStrategies (damage multiplier / fire-rate modifier)
const WEAPON_STATS: Record<WeaponId, { dmg: number; rate: number }> = {
  plasma: { dmg: 1, rate: 5 },
  ion: { dmg: 5, rate: 2 },
  wave: { dmg: 2, rate: 3 },
};

type Currency = 'am' | 'cr';

export class GarageUI extends UIComponent {
  constructor(private callbacks: GarageCallbacks) {
    super('ui-container');
    this.container.className = 'garage-overlay';
  }

  protected template(): string {
    const pips = (n: number) =>
      Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
    const weaponCards = (Object.keys(WEAPON_STATS) as WeaponId[])
      .map(
        (w) => `
        <button class="weapon-card" data-weapon="${w}">
          <span class="weapon-name">${t(`weapon.${w}` as I18nKey)}</span>
          <span class="stat-bar">${t('garage.dmg')}<span class="pips">${pips(WEAPON_STATS[w].dmg)}</span></span>
          <span class="stat-bar">${t('garage.rate')}<span class="pips">${pips(WEAPON_STATS[w].rate)}</span></span>
        </button>`,
      )
      .join('');

    const item = (id: string) => `
      <button id="${id}" class="btn-primary shop-item">
        <span class="shop-name"></span><span class="price"></span>
      </button>`;

    return `
      <div class="garage-header">
        <h1 class="garage-title">${t('garage.title')}</h1>
        <div class="garage-wallet">
          <div id="wallet-am" class="wallet-row text-am"><img class="am-icon" src="antimatter.png" alt="" /><span id="gar-am">0</span></div>
          <div id="wallet-cr" class="wallet-row text-cr"><span class="cr-icon"></span><span id="gar-cr">0</span></div>
        </div>
      </div>

      <div class="garage-stage">
        <div class="garage-hull"><span>${t('garage.hull')}</span><div id="gar-hp" class="health-segments-container"></div></div>
      </div>

      <div class="ui-panel garage-panel">
        <div class="garage-section-title">${t('garage.weapon')}</div>
        <div class="weapon-cards">${weaponCards}</div>
        <div class="garage-section-title">${t('garage.shop')}</div>
        <div class="shop-list">
          ${item('btn-repair')}
          ${item('btn-buy-sh')}
          ${item('btn-buy-bm')}
          ${item('btn-buy-dr')}
        </div>
      </div>

      <div class="garage-footer">
        <button id="btn-gar-back" class="btn-secondary">◀ ${t('garage.back')}</button>
      </div>
    `;
  }

  protected setupBindings(): void {
    this.bindButton('#btn-gar-back', () => this.callbacks.onBack());

    const buy = (id: string, currency: Currency, action: () => boolean) =>
      this.bindButton(`#${id}`, () => {
        if (action()) {
          AudioManager.getInstance().playUiConfirm();
          Haptics.notify('success');
        } else {
          this.deny(id, currency);
        }
      });
    buy('btn-repair', 'cr', this.callbacks.onRepair);
    buy('btn-buy-sh', 'am', this.callbacks.onBuyShield);
    buy('btn-buy-bm', 'cr', this.callbacks.onBuyBomb);
    buy('btn-buy-dr', 'am', this.callbacks.onBuyDrone);

    this.container.querySelectorAll<HTMLElement>('.weapon-card').forEach((card) => {
      card.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        AudioManager.getInstance().playUiClick();
        Haptics.impact('light');
        this.callbacks.onSelectWeapon(card.dataset.weapon as WeaponId);
      });
    });

    this.update();
  }

  /** Not enough money: shake the button and blink the currency that's short. */
  private deny(buttonId: string, currency: Currency) {
    AudioManager.getInstance().playUiDeny();
    Haptics.notify('error');
    for (const el of [this.$(`#${buttonId}`), this.$(`#wallet-${currency}`)]) {
      if (!el) continue;
      const cls = el.id.startsWith('wallet') ? 'flash' : 'shake';
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
    }
  }

  public update(): void {
    if (!this.isMounted) return;

    const state = GameState.getInstance();
    const shop = GameConfig.Shop;

    const setText = (id: string, content: string) => {
      const el = this.$('#' + id);
      if (el) el.textContent = content;
    };
    setText('gar-am', state.antimatter.toString());
    setText('gar-cr', state.credits.toString());

    const hp = this.$('#gar-hp');
    if (hp) {
      hp.classList.toggle('danger', state.currentHp <= 1);
      hp.innerHTML = Array.from(
        { length: state.maxHp },
        (_, i) => `<div class="health-segment ${i < state.currentHp ? 'active' : ''}"></div>`,
      ).join('');
    }

    this.container.querySelectorAll<HTMLElement>('.weapon-card').forEach((card) => {
      card.classList.toggle('equipped', card.dataset.weapon === state.equippedWeapon);
    });

    const setItem = (
      id: string,
      name: string,
      price: { amount: number; currency: Currency } | null,
      opts: { canAfford: boolean; maxed?: boolean; maxedLabel?: string; owned?: number },
    ) => {
      const btn = this.$('#' + id) as HTMLButtonElement | null;
      if (!btn) return;
      const owned = opts.owned !== undefined ? ` <span class="owned">×${opts.owned}</span>` : '';
      (btn.querySelector('.shop-name') as HTMLElement).innerHTML = `${name}${owned}`;
      const priceEl = btn.querySelector('.price') as HTMLElement;

      btn.classList.toggle('maxed', !!opts.maxed);
      btn.classList.toggle('cant-afford', !opts.maxed && !opts.canAfford);
      btn.disabled = !!opts.maxed;

      if (opts.maxed) {
        priceEl.className = 'price';
        priceEl.textContent = `✓ ${opts.maxedLabel ?? t('garage.owned')}`;
      } else if (price) {
        priceEl.className = `price ${price.currency}`;
        priceEl.innerHTML =
          price.currency === 'am'
            ? `<img class="am-icon" src="antimatter.png" alt="" />${price.amount}`
            : `<span class="cr-icon"></span>${price.amount}`;
      }
    };

    const needsRepair = state.currentHp < state.maxHp;
    setItem(
      'btn-repair',
      needsRepair ? t('garage.repair') : t('garage.repaired'),
      { amount: shop.RepairCost, currency: 'cr' },
      {
        canAfford: state.credits >= shop.RepairCost,
        maxed: !needsRepair,
        maxedLabel: t('garage.full'),
      },
    );
    setItem(
      'btn-buy-sh',
      t('garage.shield'),
      { amount: shop.ShieldCost, currency: 'am' },
      { canAfford: state.antimatter >= shop.ShieldCost, owned: state.shields },
    );
    setItem(
      'btn-buy-bm',
      t('garage.bomb'),
      { amount: shop.BombCost, currency: 'cr' },
      { canAfford: state.credits >= shop.BombCost, owned: state.bombs },
    );
    setItem(
      'btn-buy-dr',
      t('garage.drone'),
      { amount: shop.DroneCost, currency: 'am' },
      { canAfford: state.antimatter >= shop.DroneCost, maxed: state.hasDrone },
    );
  }
}
