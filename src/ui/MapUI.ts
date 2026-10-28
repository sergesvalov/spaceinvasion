import { UIComponent } from './UIComponent';
import { t, I18nKey } from '../services/i18n';

export interface MapUIOptions {
  sector: number; // 1-4
  loop: number; // 0 for the first campaign, 1+ for New Game+
  onLaunch: () => void;
}

/** Bottom sheet on the campaign map: which sector is next and a LAUNCH button. */
export class MapUI extends UIComponent {
  constructor(private opts: MapUIOptions) {
    super('ui-container');
    this.container.className = 'map-overlay';
  }

  protected template(): string {
    const s = this.opts.sector;
    const loop = this.opts.loop > 0 ? ` · ${t('map.loop', { n: this.opts.loop + 1 })}` : '';
    return `
      <div class="ui-panel map-card">
        <div class="map-card-kicker">${t('map.sector', { n: s })}${loop}</div>
        <div class="map-card-title">${t(`map.s${s}` as I18nKey)}</div>
        <div class="map-card-text">${t(`map.s${s}.brief` as I18nKey)}</div>
        <button id="btn-launch" class="btn-cta">${t('map.launch')} ▶</button>
      </div>
    `;
  }

  protected setupBindings(): void {
    this.bindButton('#btn-launch', () => this.opts.onLaunch());
  }
}
