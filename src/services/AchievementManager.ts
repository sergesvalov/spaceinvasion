import { pick } from './i18n';

export class AchievementManager {
  private static instance: AchievementManager;
  private unlocked: Set<string> = new Set();
  private listeners: ((title: string, desc: string) => void)[] = [];

  private constructor() {
    this.loadState();
  }

  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  private loadState() {
    const saved = localStorage.getItem('si_achievements');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          this.unlocked = new Set(arr);
        }
      } catch (e) {
        console.error('Failed to load achievements', e);
      }
    }
  }

  private saveState() {
    localStorage.setItem('si_achievements', JSON.stringify(Array.from(this.unlocked)));
  }

  public onAchievementUnlocked(callback: (title: string, desc: string) => void) {
    this.listeners.push(callback);
  }

  public offAchievementUnlocked(callback: (title: string, desc: string) => void) {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }

  public checkScoreAchievements(score: number) {
    if (score >= 1000 && !this.unlocked.has('score_1000')) {
      this.unlock('score_1000', {
        ru: ['Первая кровь', 'Набери 1 000 очков за один забег'],
        en: ['First Blood', 'Score 1,000 points in one run'],
      });
    }
    if (score >= 5000 && !this.unlocked.has('score_5000')) {
      this.unlock('score_5000', {
        ru: ['Ас космоса', 'Набери 5 000 очков за один забег'],
        en: ['Space Ace', 'Score 5,000 points in one run'],
      });
    }
    if (score >= 10000 && !this.unlocked.has('score_10000')) {
      this.unlock('score_10000', {
        ru: ['Неудержимый', 'Набери 10 000 очков за один забег'],
        en: ['Unstoppable', 'Score 10,000 points in one run'],
      });
    }
  }

  public checkKamikazeKill() {
    if (!this.unlocked.has('kamikaze_kill')) {
      this.unlock('kamikaze_kill', {
        ru: ['Мухобойка', 'Уничтожь камикадзе-дрон босса'],
        en: ['Fly Swatter', 'Destroy a boss kamikaze drone'],
      });
    }
  }

  public checkBossDefeat() {
    if (!this.unlocked.has('boss_kill')) {
      this.unlock('boss_kill', {
        ru: ['Защитник Земли', 'Уничтожь крейсер пришельцев'],
        en: ['Earth Defender', 'Destroy the alien cruiser'],
      });
    }
  }

  public checkMechaTransform() {
    if (!this.unlocked.has('mecha_transform')) {
      this.unlock('mecha_transform', {
        ru: ['Время героев', 'Трансформируйся в меха'],
        en: ['Hero Time', 'Transform into the mecha'],
      });
    }
  }

  private unlock(id: string, text: { ru: [string, string]; en: [string, string] }) {
    this.unlocked.add(id);
    this.saveState();
    const [title, desc] = pick(text);
    this.listeners.forEach((l) => l(title, desc));
  }
}
