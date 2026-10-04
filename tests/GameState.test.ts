import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameState } from '../src/services/GameState';

describe('GameState', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset GameState instance using a small hack because it's a singleton
    // @ts-ignore
    GameState.instance = undefined;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default values if localStorage is empty', () => {
    const state = GameState.getInstance();
    
    expect(state.credits).toBe(0);
    expect(state.currentHp).toBe(3);
    expect(state.maxHp).toBe(3);
    expect(state.weaponLevel).toBe(1);
    expect(state.antimatter).toBe(0);
    expect(state.shields).toBe(0);
    expect(state.bombs).toBe(0);
    expect(state.equippedWeapon).toBe('plasma');
    expect(state.hasDrone).toBe(false);
  });

  it('should correctly add and spend credits', () => {
    const state = GameState.getInstance();
    
    state.addCredits(100);
    expect(state.credits).toBe(100);
    
    const spent = state.spendCredits(40);
    expect(spent).toBe(true);
    expect(state.credits).toBe(60);
    
    const spentFailed = state.spendCredits(100);
    expect(spentFailed).toBe(false);
    expect(state.credits).toBe(60);
  });

  it('should not exceed maxHp when repairing', () => {
    const state = GameState.getInstance();
    
    // Start with 3/3
    state.setHp(1);
    expect(state.currentHp).toBe(1);
    
    state.repair(1);
    expect(state.currentHp).toBe(2);
    
    state.repair(5); // Repair more than max
    expect(state.currentHp).toBe(state.maxHp);
  });

  it('should correctly upgrade max hp and heal', () => {
    const state = GameState.getInstance();
    
    expect(state.maxHp).toBe(3);
    state.setHp(1); // Take damage
    
    state.upgradeMaxHp();
    expect(state.maxHp).toBe(4);
    expect(state.currentHp).toBe(4); // Upgrading heals to full
  });

  it('should cap weapon level at 4', () => {
    const state = GameState.getInstance();
    
    expect(state.weaponLevel).toBe(1);
    state.upgradeWeapon(); // 2
    state.upgradeWeapon(); // 3
    state.upgradeWeapon(); // 4
    state.upgradeWeapon(); // Should stay at 4
    expect(state.weaponLevel).toBe(4);
  });

  it('should debounce saving to localStorage', () => {
    const state = GameState.getInstance();
    
    state.addCredits(10);
    state.addCredits(20);
    state.addCredits(30);
    
    // Not saved immediately
    expect(localStorage.getItem('si_credits')).toBeNull();
    
    // Fast-forward timers by 500ms
    vi.advanceTimersByTime(500);
    
    expect(localStorage.getItem('si_credits')).toBe('60');
  });

  it('should load state from localStorage correctly', () => {
    localStorage.setItem('si_credits', '500');
    localStorage.setItem('si_hp', '2');
    localStorage.setItem('si_max_hp', '5');
    localStorage.setItem('si_equipped_weapon', 'wave');
    localStorage.setItem('si_has_drone', 'true');
    
    const state = GameState.getInstance();
    
    expect(state.credits).toBe(500);
    expect(state.currentHp).toBe(2);
    expect(state.maxHp).toBe(5);
    expect(state.equippedWeapon).toBe('wave');
    expect(state.hasDrone).toBe(true);
  });
});
