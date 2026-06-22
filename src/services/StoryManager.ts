import { AnalyticsService } from './AnalyticsService';

const LORE_DATA: Record<string, { title: string; text: string }> = {
  'level_1': {
    title: 'INCOMING TRANSMISSION',
    text: 'Пилот, связь установлена. Вражеский флот вошел в сектор Альфа. Ваша задача - перехватить их до того, как они достигнут врат. Помните: ваша меха-форма отлично справляется с тяжелыми целями, а истребитель создан для маневров. Удачи.'
  }
};

export class StoryManager {
  private static instance: StoryManager;
  private overlayEl!: HTMLDivElement;
  private titleEl!: HTMLDivElement;
  private textEl!: HTMLDivElement;
  private hintEl!: HTMLDivElement;

  private isTyping = false;
  private currentFullText = '';
  private typeInterval?: number;
  private resolveBriefing?: () => void;

  private constructor() {
    this.createUI();
  }

  public static getInstance(): StoryManager {
    if (!StoryManager.instance) {
      StoryManager.instance = new StoryManager();
    }
    return StoryManager.instance;
  }

  private createUI() {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;

    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'story-overlay';
    
    this.titleEl = document.createElement('div');
    this.titleEl.className = 'story-title';
    
    this.textEl = document.createElement('div');
    this.textEl.className = 'story-text';
    
    this.hintEl = document.createElement('div');
    this.hintEl.className = 'story-hint';
    this.hintEl.textContent = 'Нажмите для продолжения...';

    this.overlayEl.appendChild(this.titleEl);
    this.overlayEl.appendChild(this.textEl);
    this.overlayEl.appendChild(this.hintEl);
    uiContainer.appendChild(this.overlayEl);

    this.overlayEl.addEventListener('pointerdown', () => this.handleTap());
  }

  public showBriefing(levelId: string, onComplete: () => void): void {
    console.log(`[StoryManager] Showing briefing for level: ${levelId}`);
    AnalyticsService.getInstance().logEvent('story_briefing_shown', { levelId });
    
    const data = LORE_DATA[levelId] || { title: 'UNKNOWN', text: 'No data.' };
    this.resolveBriefing = onComplete;
    this.titleEl.textContent = data.title;
    this.textEl.textContent = '';
    this.currentFullText = data.text;
    
    this.overlayEl.classList.add('active');
    this.startTyping();
  }

  private startTyping() {
    this.isTyping = true;
    let charIndex = 0;
    
    this.typeInterval = window.setInterval(() => {
      if (charIndex < this.currentFullText.length) {
        this.textEl.textContent += this.currentFullText.charAt(charIndex);
        charIndex++;
      } else {
        this.completeTyping();
      }
    }, 30);
  }

  private completeTyping() {
    if (this.typeInterval) clearInterval(this.typeInterval);
    this.isTyping = false;
    this.textEl.textContent = this.currentFullText;
  }

  private handleTap() {
    if (this.isTyping) {
      // Skip typing effect
      this.completeTyping();
    } else {
      // Close briefing
      this.overlayEl.classList.remove('active');
      if (this.resolveBriefing) {
        this.resolveBriefing();
        this.resolveBriefing = undefined;
      }
    }
  }
}
