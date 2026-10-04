import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScoreManager } from '../src/game/managers/ScoreManager';
import { GameState } from '../src/services/GameState';
import { AudioManager } from '../src/services/AudioManager';

describe('ScoreManager', () => {
  let mockScene: any;
  let mockUpdateHUD: any;

  beforeEach(() => {
    localStorage.clear();
    // @ts-ignore
    GameState.instance = undefined;
    
    mockScene = {};
    mockUpdateHUD = vi.fn();
    
    // Mock AudioManager
    vi.spyOn(AudioManager, 'getInstance').mockReturnValue({
      playEnemyDestroyed: vi.fn(),
    } as any);
  });

  it('should initialize with antimatter from GameState', () => {
    const state = GameState.getInstance();
    state.addAntimatter(5);
    
    const scoreManager = new ScoreManager(mockScene, mockUpdateHUD);
    expect(scoreManager.antimatter).toBe(5);
    expect(scoreManager.score).toBe(0);
  });

  it('should add score, play sound, and update HUD', () => {
    const scoreManager = new ScoreManager(mockScene, mockUpdateHUD);
    
    scoreManager.addScore(100, 3);
    
    expect(scoreManager.score).toBe(100);
    const audioManager = AudioManager.getInstance();
    expect(audioManager.playEnemyDestroyed).toHaveBeenCalledWith(mockScene);
    expect(mockUpdateHUD).toHaveBeenCalledWith(100, 3, 0);
  });

  it('should add antimatter to GameState, update HUD, and show floating text', () => {
    const scoreManager = new ScoreManager(mockScene, mockUpdateHUD);
    const mockShowText = vi.fn();
    
    scoreManager.addAntimatter(2, 3, mockShowText);
    
    const state = GameState.getInstance();
    expect(state.antimatter).toBe(2);
    expect(scoreManager.antimatter).toBe(2);
    
    expect(mockUpdateHUD).toHaveBeenCalledWith(0, 3, 2);
    expect(mockShowText).toHaveBeenCalled();
  });
});
