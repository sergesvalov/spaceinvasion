import { AnalyticsService } from './AnalyticsService';

export class StoryManager {
  private static instance: StoryManager;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): StoryManager {
    if (!StoryManager.instance) {
      StoryManager.instance = new StoryManager();
    }
    return StoryManager.instance;
  }

  public loadStory(levelId: string): void {
    console.log(`[StoryManager] Loading story data for level: ${levelId}`);
    // Future: Fetch JSON or Markdown
  }

  public showBriefing(levelId: string, onComplete: () => void): void {
    console.log(`[StoryManager] Showing briefing for level: ${levelId}`);
    AnalyticsService.getInstance().logEvent('story_briefing_shown', { levelId });
    
    // Stub: immediately complete the briefing
    setTimeout(() => {
      onComplete();
    }, 500);
  }
}
