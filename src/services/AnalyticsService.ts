export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public logEvent(eventName: string, params?: Record<string, any>): void {
    console.log(`[Analytics] ${eventName}`, params || '');
    // Future: Integration with Yandex Metrica, Firebase, or Telegram
  }

  public sessionStart(userId?: string): void {
    this.logEvent('session_start', { userId });
  }

  public sessionEnd(userId?: string): void {
    this.logEvent('session_end', { userId });
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
