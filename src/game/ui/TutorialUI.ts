import { GameConfig } from '../config/GameConfig';
import { t, I18nKey } from '../../services/i18n';

type HintId = 'drag' | 'mecha' | 'shield';

const STORAGE_KEY = 'si_tutorial';
const HINT_MS = 4000;

/**
 * First-run contextual hints. Each hint is shown once ever, at the moment it
 * becomes relevant (start of the first run, first time mecha is affordable,
 * first time a shield is in stock), so nothing has to be explained up front.
 */
export class TutorialUI {
  private el: HTMLElement;
  private seen: Set<HintId>;
  private queue: HintId[] = [];
  private current?: HintId;
  private timer?: number;
  private readonly enabled = !GameConfig.Runtime.isE2ETestMode && !GameConfig.Runtime.isAIDemoMode;
  private readonly isTouch = window.matchMedia?.('(pointer: coarse)').matches ?? false;

  constructor(hudEl: HTMLElement) {
    this.el = hudEl.querySelector('#hud-tutorial') as HTMLElement;
    this.seen = new Set(this.load());
  }

  public start(level: number) {
    if (level === 1) this.request('drag');
  }

  public onMechaReady() {
    this.request('mecha');
  }

  public onShieldOwned() {
    this.request('shield');
  }

  private request(id: HintId) {
    if (!this.enabled || !this.el || this.seen.has(id) || this.current === id) return;
    if (this.queue.includes(id)) return;
    this.queue.push(id);
    if (!this.current) this.next();
  }

  private next() {
    const id = this.queue.shift();
    this.current = id;
    if (!id) {
      this.el.classList.remove('show', 'bottom');
      return;
    }
    this.seen.add(id);
    this.save();

    const key: Record<HintId, [I18nKey, I18nKey]> = {
      drag: ['tutorial.drag', 'tutorial.keys'],
      mecha: ['tutorial.mecha', 'tutorial.mechaKeys'],
      shield: ['tutorial.shield', 'tutorial.shieldKeys'],
    };
    const text = t(key[id][this.isTouch ? 0 : 1]);
    const finger = id === 'drag' && this.isTouch ? '<div class="hud-tutorial-finger"></div>' : '';

    this.el.innerHTML = `${finger}<div class="hud-tutorial-text">${text}</div>`;
    this.el.classList.toggle('bottom', id !== 'drag');
    this.el.classList.remove('show');
    void this.el.offsetWidth;
    this.el.classList.add('show');

    this.timer = window.setTimeout(() => this.next(), HINT_MS);
  }

  private load(): HintId[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.seen]));
    } catch {
      /* storage unavailable */
    }
  }

  public destroy() {
    if (this.timer) clearTimeout(this.timer);
  }
}
