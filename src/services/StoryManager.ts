import { AnalyticsService } from './AnalyticsService';

interface StorySlide {
  title: string;
  text: string;
  image?: string;
}

const LORE_DATA: Record<string, StorySlide[]> = {
  'level_1': [
    {
      title: 'INCOMING TRANSMISSION',
      text: '2084 год. Земля наслаждалась миром. Безмятежные побережья и мирные города даже не подозревали об угрозе, таящейся в глубинах космоса.',
      image: 'story/story_1.png'
    },
    {
      title: 'INCOMING TRANSMISSION',
      text: 'Они пришли без предупреждения. Безжалостный инопланетный флот обрушился на наши орбитальные рубежи, стирая в пыль передовые линии обороны.',
      image: 'story/story_2.png'
    },
    {
      title: 'INCOMING TRANSMISSION',
      text: 'База "Омега" — наш последний оплот. Твой экспериментальный истребитель-трансформер заряжен и ждет на полосе. Это технологическое чудо — наша единственная надежда.',
      image: 'story/story_3.png'
    },
    {
      title: 'INCOMING TRANSMISSION',
      text: 'Небеса пылают! Враг прорвал атмосферу и атакует базу! Пилот, судьба человечества в твоих руках. Взлетай и заставь их поплатиться!',
      image: 'story/story_4.png'
    }
  ]
};

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

    this.overlayEl.addEventListener('pointerdown', () => this.handleTap());
  }

  public showBriefing(levelId: string, onComplete: () => void): void {
    console.log(`[StoryManager] Showing briefing for level: ${levelId}`);
    AnalyticsService.getInstance().logEvent('story_briefing_shown', { levelId });
    
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
    
    if (this.typeInterval) clearInterval(this.typeInterval);
    
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
      // Next slide or finish
      this.currentSlideIndex++;
      if (this.currentSlideIndex < this.currentSlides.length) {
        this.showCurrentSlide();
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
}
