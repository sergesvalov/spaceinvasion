import { AnalyticsService } from './AnalyticsService';

import { StorySlide, LORE_DATA, localizeSlide } from '../data/StoryData';
import { GameConfig } from '../game/config/GameConfig';
import { AudioManager } from './AudioManager';
import { t } from './i18n';

export class StoryManager {
  private static instance: StoryManager;
  private overlayEl!: HTMLDivElement;
  private titleEl!: HTMLDivElement;
  private textEl!: HTMLDivElement;
  private hintEl!: HTMLDivElement;
  private imageEl!: HTMLImageElement;
  private skipEl!: HTMLButtonElement;
  private progressEl!: HTMLDivElement;

  private isTyping = false;
  private currentFullText = '';
  private typeInterval?: number;
  private resolveBriefing?: () => void;

  private currentSlides: StorySlide[] = [];
  private currentSlideIndex = 0;

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

    // Full-bleed art behind a bottom text panel, so a slide reads like a comic
    // frame on a portrait phone and the art never pushes the text off-screen.
    this.imageEl = document.createElement('img');
    this.imageEl.className = 'story-image';
    this.imageEl.alt = '';

    const shadeEl = document.createElement('div');
    shadeEl.className = 'story-shade';

    this.skipEl = document.createElement('button');
    this.skipEl.className = 'story-skip';
    this.skipEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      AudioManager.getInstance().playUiClick();
      this.finish();
    });

    const panelEl = document.createElement('div');
    panelEl.className = 'story-panel';

    this.progressEl = document.createElement('div');
    this.progressEl.className = 'story-progress';

    this.titleEl = document.createElement('div');
    this.titleEl.className = 'story-title';

    this.textEl = document.createElement('div');
    this.textEl.className = 'story-text';

    this.hintEl = document.createElement('div');
    this.hintEl.className = 'story-hint';
    this.hintEl.textContent = '▶';

    panelEl.appendChild(this.progressEl);
    panelEl.appendChild(this.titleEl);
    panelEl.appendChild(this.textEl);
    panelEl.appendChild(this.hintEl);

    this.overlayEl.appendChild(this.imageEl);
    this.overlayEl.appendChild(shadeEl);
    this.overlayEl.appendChild(this.skipEl);
    this.overlayEl.appendChild(panelEl);
    uiContainer.appendChild(this.overlayEl);

    // Only pointerdown: it already covers mouse + touch. Adding touchstart/click
    // as well made a single tap fire handleTap() twice on phones.
    this.overlayEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.handleTap();
    });
  }

  public showBriefing(levelId: string, onComplete: () => void): void {
    console.log(`[StoryManager] Showing briefing for level: ${levelId}`);
    AnalyticsService.getInstance().logEvent('story_briefing_shown', { levelId });

    // Skip in E2E or AI Demo
    if (GameConfig.Runtime.isE2ETestMode || GameConfig.Runtime.isAIDemoMode) {
      if (onComplete) onComplete();
      return;
    }

    let finalLevelId = levelId;
    if (levelId.startsWith('level_')) {
      const parts = levelId.split('_');
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > 4) {
        const mappedNum = ((num - 1) % 4) + 1;
        parts[1] = mappedNum.toString();
        finalLevelId = parts.join('_');
      }
    }

    this.currentSlides = LORE_DATA[finalLevelId] || [
      { title: '...', text: '...', en: { title: '...', text: '...' } },
    ];
    this.currentSlideIndex = 0;
    this.resolveBriefing = onComplete;
    this.skipEl.textContent = `${t('story.skip')} ▶▶`;

    this.overlayEl.classList.add('active');
    this.showCurrentSlide();
  }

  private showCurrentSlide() {
    const slide = this.currentSlides[this.currentSlideIndex];
    const { title, text } = localizeSlide(slide);

    this.titleEl.textContent = title;
    this.textEl.textContent = '';
    this.currentFullText = text;
    this.hintEl.classList.remove('ready');
    this.renderProgress();

    if (slide.image) {
      this.imageEl.src = slide.image;
      this.imageEl.style.display = 'block';
    } else {
      this.imageEl.style.display = 'none';
    }

    // Warm the cache for the next frame so it doesn't pop in mid-transition.
    const next = this.currentSlides[this.currentSlideIndex + 1];
    if (next?.image) new Image().src = next.image;

    this.startTyping();
  }

  private renderProgress() {
    if (this.currentSlides.length < 2) {
      this.progressEl.innerHTML = '';
      return;
    }
    this.progressEl.innerHTML = this.currentSlides
      .map((_, i) => `<span class="${i === this.currentSlideIndex ? 'on' : ''}"></span>`)
      .join('');
  }

  private startTyping() {
    this.isTyping = true;
    let charIndex = 0;

    if (this.typeInterval) clearTimeout(this.typeInterval);

    const typeNextChar = () => {
      if (!this.isTyping) return;
      if (charIndex < this.currentFullText.length) {
        const char = this.currentFullText.charAt(charIndex);
        charIndex++;

        let delay = 30; // base speed

        if (char === '|') {
          // It's a dramatic pause, don't append it to text
          delay = 500;
        } else {
          this.textEl.textContent += char;

          if (char === '.' || char === '!' || char === '?') delay = 300;
          else if (char === ',') delay = 150;
        }

        this.typeInterval = window.setTimeout(typeNextChar, delay);
      } else {
        this.completeTyping();
      }
    };

    typeNextChar();
  }

  private completeTyping() {
    if (this.typeInterval) clearTimeout(this.typeInterval);
    this.isTyping = false;
    this.textEl.textContent = this.currentFullText.replace(/\|/g, '');
    this.hintEl.classList.add('ready');
  }

  private handleTap() {
    if (this.isTyping) {
      // Skip typing effect
      this.completeTyping();
    } else {
      // Next slide or finish
      this.currentSlideIndex++;
      if (this.currentSlideIndex < this.currentSlides.length) {
        this.showCurrentSlide();
      } else {
        this.finish();
      }
    }
  }

  private finish() {
    if (this.typeInterval) clearTimeout(this.typeInterval);
    this.isTyping = false;
    this.overlayEl.classList.remove('active');
    // Wait for CSS transition (0.5s) to complete before resolving
    setTimeout(() => {
      if (this.resolveBriefing) {
        this.resolveBriefing();
        this.resolveBriefing = undefined;
      }
    }, 500);
  }
}
