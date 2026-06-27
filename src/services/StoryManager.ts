import { AnalyticsService } from './AnalyticsService';

import { StorySlide, LORE_DATA } from '../data/StoryData';

export class StoryManager {
  private static instance: StoryManager;
  private overlayEl!: HTMLDivElement;
  private titleEl!: HTMLDivElement;
  private textEl!: HTMLDivElement;
  private hintEl!: HTMLDivElement;
  private imageEl!: HTMLImageElement;

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
    
    this.imageEl = document.createElement('img');
    this.imageEl.className = 'story-image';
    
    this.titleEl = document.createElement('div');
    this.titleEl.className = 'story-title';
    
    this.textEl = document.createElement('div');
    this.textEl.className = 'story-text';
    
    this.hintEl = document.createElement('div');
    this.hintEl.className = 'story-hint';
    this.hintEl.textContent = 'Нажмите для продолжения...';

    this.overlayEl.appendChild(this.imageEl);
    this.overlayEl.appendChild(this.titleEl);
    this.overlayEl.appendChild(this.textEl);
    this.overlayEl.appendChild(this.hintEl);
    uiContainer.appendChild(this.overlayEl);

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
    const w = window as any;
    if (w.__E2E_TEST_MODE__ || w.__AI_DEMO_MODE__) {
      if (onComplete) onComplete();
      return;
    }
    
    this.currentSlides = LORE_DATA[levelId] || [{ title: 'UNKNOWN', text: 'No data.' }];
    this.currentSlideIndex = 0;
    this.resolveBriefing = onComplete;
    
    this.overlayEl.classList.add('active');
    this.showCurrentSlide();
  }
  
  private showCurrentSlide() {
    const slide = this.currentSlides[this.currentSlideIndex];
    
    this.titleEl.textContent = slide.title;
    this.textEl.textContent = '';
    this.currentFullText = slide.text;
    
    if (slide.image) {
      this.imageEl.src = slide.image;
      this.imageEl.style.display = 'block';
    } else {
      this.imageEl.style.display = 'none';
    }
    
    this.startTyping();
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
        // Close briefing
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
  }
}
