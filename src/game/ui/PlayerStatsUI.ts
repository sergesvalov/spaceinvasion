import { GameState } from '../../services/GameState';
import { GameConfig } from '../config/GameConfig';
import { EventBus } from '../../services/EventBus';
import { Haptics } from '../../services/Haptics';
import { TutorialUI } from './TutorialUI';

export class PlayerStatsUI {
  private scoreEl: HTMLElement;
  private recordEl: HTMLElement;
  private antimatterEl: HTMLElement;
  private amBlockEl: HTMLElement;
  private hpBlockEl: HTMLElement;
  private healthContainerEl: HTMLElement;
  private vignetteEl: HTMLElement;
  private mechaBtnEl: HTMLElement;
  private shieldBtnEl: HTMLElement;
  private bombBtnEl: HTMLElement;
  private shieldCountEl: HTMLElement;
  private bombCountEl: HTMLElement;

  private segments: HTMLElement[] = [];
  private lastHealth = -1;
  private targetScore = 0;
  private displayedScore = 0;
  private scoreRaf = 0;
  private readonly hiScoreAtStart = GameState.getInstance().hiScore;
  private recordShown = false;
  private mechaActive = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private busHandlers: [string, (...args: any[]) => void][] = [];

  constructor(
    hudEl: HTMLElement,
    private tutorial: TutorialUI,
  ) {
    const q = (sel: string) => hudEl.querySelector(sel) as HTMLElement;
    this.scoreEl = q('#hud-score');
    this.recordEl = q('#hud-record');
    this.antimatterEl = q('#hud-antimatter');
    this.amBlockEl = q('#hud-am');
    this.hpBlockEl = q('#hud-hp');
    this.healthContainerEl = q('#hud-health-container');
    this.vignetteEl = q('#hud-vignette');
    this.mechaBtnEl = q('#hud-mecha-btn');
    this.shieldBtnEl = q('#hud-shield-btn');
    this.bombBtnEl = q('#hud-bomb-btn');
    this.shieldCountEl = q('#hud-shield-count');
    this.bombCountEl = q('#hud-bomb-count');

    this.attachEvents();
  }

  private attachEvents() {
    const bindAction = (el: HTMLElement, action: () => void) => {
      el?.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        Haptics.impact('medium');
        action();
      });
    };

    bindAction(this.mechaBtnEl, () => EventBus.emit('transform_request'));
    bindAction(this.shieldBtnEl, () => EventBus.emit('shield_request'));
    bindAction(this.bombBtnEl, () => EventBus.emit('bomb_request'));

    this.onBus('mecha_started', (ms: number) => {
      this.mechaActive = true;
      this.runTimer(this.mechaBtnEl, ms);
    });
    this.onBus('mecha_ended', () => {
      this.mechaActive = false;
      this.stopTimer(this.mechaBtnEl);
    });
    this.onBus('shield_started', (ms: number) => this.runTimer(this.shieldBtnEl, ms));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onBus(event: string, fn: (...args: any[]) => void) {
    EventBus.on(event as any, fn as any, this);
    this.busHandlers.push([event, fn]);
  }

  /** Draining bar along the bottom of an ability button. */
  private runTimer(btn: HTMLElement, ms: number) {
    const bar = btn?.querySelector('.hud-action-timer') as HTMLElement | null;
    if (!bar) return;
    btn.classList.add('active');
    bar.getAnimations().forEach((a) => a.cancel());
    const anim = bar.animate([{ width: '100%' }, { width: '0%' }], {
      duration: ms,
      easing: 'linear',
      fill: 'forwards',
    });
    anim.onfinish = () => btn.classList.remove('active');
  }

  private stopTimer(btn: HTMLElement) {
    btn?.classList.remove('active');
    btn
      ?.querySelector('.hud-action-timer')
      ?.getAnimations()
      .forEach((a) => a.cancel());
  }

  /** Pause/resume ability timers together with the scene. */
  public setPaused(paused: boolean) {
    this.healthContainerEl
      ?.closest('.hud')
      ?.querySelectorAll('.hud-action-timer')
      .forEach((el) => el.getAnimations().forEach((a) => (paused ? a.pause() : a.play())));
  }

  public update(score: number, health: number, antimatter: number = 0) {
    this.updateScore(score);
    this.updateHealth(health);

    const state = GameState.getInstance();
    const mechaReady = antimatter >= GameConfig.Player.MechaCost;

    if (this.antimatterEl) this.antimatterEl.textContent = `${antimatter}`;
    this.amBlockEl?.classList.toggle('ready', mechaReady);
    if (this.mechaBtnEl) {
      this.mechaBtnEl.classList.toggle('ready', mechaReady && !this.mechaActive);
    }
    if (mechaReady) this.tutorial.onMechaReady();

    const shields = state.shields;
    this.shieldBtnEl?.classList.toggle(
      'hidden',
      shields <= 0 && !this.shieldBtnEl.classList.contains('active'),
    );
    if (this.shieldCountEl) this.shieldCountEl.textContent = `${shields}`;
    if (shields > 0) this.tutorial.onShieldOwned();

    const bombs = state.bombs;
    this.bombBtnEl?.classList.toggle('hidden', bombs <= 0);
    if (this.bombCountEl) this.bombCountEl.textContent = `${bombs}`;
  }

  private updateScore(score: number) {
    this.targetScore = score;
    if (!this.recordShown && this.hiScoreAtStart > 0 && score > this.hiScoreAtStart) {
      this.recordShown = true;
      this.recordEl?.classList.add('show');
    }
    if (this.scoreRaf || this.displayedScore === score) return;

    // Roll the counter towards the target every frame instead of only on the
    // next HUD update, so the shown score never lags behind the real one.
    const step = () => {
      const diff = this.targetScore - this.displayedScore;
      if (Math.abs(diff) < 5) this.displayedScore = this.targetScore;
      else this.displayedScore += Math.ceil(diff * 0.2);
      if (this.scoreEl) this.scoreEl.textContent = `${this.displayedScore}`;

      if (this.displayedScore !== this.targetScore) {
        this.scoreRaf = requestAnimationFrame(step);
      } else {
        this.scoreRaf = 0;
        this.scoreEl?.classList.remove('bump');
      }
    };
    this.scoreEl?.classList.add('bump');
    this.scoreRaf = requestAnimationFrame(step);
  }

  private updateHealth(health: number) {
    const maxHp = GameState.getInstance().maxHp;
    if (this.segments.length !== maxHp && this.healthContainerEl) {
      this.healthContainerEl.innerHTML = '';
      this.segments = Array.from({ length: maxHp }, () => {
        const seg = document.createElement('div');
        seg.className = 'health-segment';
        this.healthContainerEl.appendChild(seg);
        return seg;
      });
    }

    this.segments.forEach((seg, i) => {
      const wasActive = seg.classList.contains('active');
      const isActive = i < health;
      seg.classList.toggle('active', isActive);
      if (wasActive && !isActive) {
        seg.classList.remove('lost');
        void seg.offsetWidth; // restart the animation
        seg.classList.add('lost');
      }
    });

    const critical = health === 1;
    this.healthContainerEl?.classList.toggle('danger', critical);
    this.hpBlockEl?.classList.toggle('danger', critical);

    if (this.vignetteEl) {
      if (this.lastHealth > health && health > 0) {
        this.vignetteEl.classList.remove('hit');
        void this.vignetteEl.offsetWidth;
        this.vignetteEl.classList.add('hit');
        this.vignetteEl.addEventListener(
          'animationend',
          () => this.vignetteEl.classList.toggle('critical', health === 1),
          { once: true },
        );
      }
      if (!critical) this.vignetteEl.classList.remove('critical');
      else if (this.lastHealth === -1) this.vignetteEl.classList.add('critical');
    }
    this.lastHealth = health;
  }

  public destroy() {
    if (this.scoreRaf) cancelAnimationFrame(this.scoreRaf);
    for (const [event, fn] of this.busHandlers) EventBus.off(event as any, fn, this);
    this.busHandlers = [];
  }
}
