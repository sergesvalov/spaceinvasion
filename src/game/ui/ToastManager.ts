import { t } from '../../services/i18n';

const SHOW_MS = 3500;
const MAX_VISIBLE = 2;

/**
 * Achievement toasts: queued, stacked under the HUD top bar and drawn below
 * the story overlay, so they never cover a title, the briefing or each other.
 */
export class ToastManager {
  private static queue: { title: string; desc: string }[] = [];
  private static visible = 0;

  public static showAchievement(title: string, desc: string) {
    this.queue.push({ title, desc });
    this.pump();
  }

  private static stack(): HTMLElement | null {
    const ui = document.getElementById('ui-container');
    if (!ui) return null;
    let stack = ui.querySelector('.toast-stack') as HTMLElement | null;
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      ui.appendChild(stack);
    }
    return stack;
  }

  private static pump() {
    const stack = this.stack();
    while (stack && this.visible < MAX_VISIBLE && this.queue.length) {
      const { title, desc } = this.queue.shift()!;
      this.visible++;

      const el = document.createElement('div');
      el.className = 'achievement-toast';
      el.innerHTML = `
        <div class="toast-kicker">★ ${t('toast.achievement')}</div>
        <div class="toast-title"></div>
        <div class="toast-desc"></div>
      `;
      (el.querySelector('.toast-title') as HTMLElement).textContent = title;
      (el.querySelector('.toast-desc') as HTMLElement).textContent = desc;
      stack.appendChild(el);

      requestAnimationFrame(() => el.classList.add('in'));
      setTimeout(() => {
        el.classList.remove('in');
        setTimeout(() => {
          el.remove();
          this.visible--;
          this.pump();
        }, 300);
      }, SHOW_MS);
    }
  }
}
