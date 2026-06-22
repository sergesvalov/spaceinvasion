declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe?: {
          user?: {
            id: number;
            username?: string;
          };
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private telegramUserId?: string;

  private constructor() {
    // Try to get Telegram User ID
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      this.telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    }
    
    // Expand Telegram WebApp to full screen
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public logEvent(eventName: string, params?: Record<string, any>): void {
    const enrichedParams = {
      ...params,
      telegramUserId: this.telegramUserId
    };
    console.log(`[Analytics] ${eventName}`, enrichedParams);
  }

  public sessionStart(): void {
    this.logEvent('session_start');
  }

  public sessionEnd(): void {
    this.logEvent('session_end');
  }

  public levelStart(levelId: string): void {
    this.logEvent('level_start', { levelId });
  }

  public levelFail(levelId: string, reason: string): void {
    this.logEvent('level_fail', { levelId, reason });
  }

  public levelComplete(levelId: string): void {
    this.logEvent('level_complete', { levelId });
  }

  public playerDeath(x: number, y: number): void {
    this.logEvent('player_death', { x, y });
  }

  public formSwitch(newForm: 'fighter' | 'mecha'): void {
    this.logEvent('form_switch', { newForm });
  }
}
