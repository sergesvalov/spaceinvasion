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
      text: '2084 год.| Земля наслаждалась миром.| Безмятежные побережья и мирные города даже не подозревали об угрозе,| таящейся в глубинах космоса.',
      image: 'story/story_1.png'
    },
    {
      title: 'INCOMING TRANSMISSION',
      text: 'Они пришли без предупреждения.| Безжалостный инопланетный флот обрушился на наши орбитальные рубежи,| стирая в пыль передовые линии обороны.',
      image: 'story/story_2.png'
    },
    {
      title: 'INCOMING TRANSMISSION',
      text: 'База "Омега" — наш последний оплот.| Твой экспериментальный истребитель-трансформер заряжен и ждет на полосе.| Это технологическое чудо —| наша единственная надежда.',
      image: 'story/story_3.png'
    },
    {
      title: 'INCOMING TRANSMISSION',
      text: 'Небеса пылают!| Враг прорвал атмосферу и атакует базу!| Пилот,| судьба человечества в твоих руках.| Взлетай и заставь их поплатиться!',
      image: 'story/story_4.png'
    }
  ],
  'level_1_victory': [
    {
      title: 'VICTORY... OR SO WE THOUGHT',
      text: 'Вражеский флагман уничтожен.| Обломки гигантского материнского корабля пылают в верхних слоях атмосферы,| озаряя небо.',
      image: 'story/victory_1.png'
    },
    {
      title: 'INCOMING TRANSMISSION',
      text: 'Но радость была недолгой.| Радары зафиксировали массовые проколы пространства.| Тысячи инопланетных кораблей появились прямо над крупнейшими городами Земли.',
      image: 'story/victory_2.png'
    },
    {
      title: 'EMERGENCY PROTOCOL',
      text: 'Наши силы истощены,| но мы всё ещё стоим.| Пилот,| нам срочно нужна твоя помощь в других секторах.| Настоящая война только начинается...',
      image: 'story/victory_3.png'
    }
  ],
  'level_2': [
    {
      title: 'SECTOR 7: NEO TOKYO',
      text: 'Главный мегаполис Земли находится под массированной атакой.| Вражеские эскадрильи заполонили небеса,| уничтожая всё на своем пути.',
      image: 'story/victory_2.png'
    },
    {
      title: 'MISSION BRIEFING',
      text: 'Твоя задача — прорвать блокаду над Нео-Токио и уничтожить главнокомандующего вражеским флотом.| Удачи,| пилот.',
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
    
    // В режиме автотеста сразу пропускаем все диалоги
    if ((window as any).__E2E_TEST_MODE__) {
      onComplete();
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
