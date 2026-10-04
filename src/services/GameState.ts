export class GameState {
  private static instance: GameState;

  private _credits: number = 0;
  private _currentHp: number = 3;
  private _maxHp: number = 3;
  private _baseWeaponLevel: number = 1;
  private _weaponLevel: number = 1;
  private _antimatter: number = 0;
  private _shields: number = 0;
  private _bombs: number = 0;
  private _equippedWeapon: 'plasma' | 'ion' | 'wave' = 'plasma';
  private _hasDrone: boolean = false;
  private _hiScore: number = 0;
  private _unlockedLevel: number = 1;

  public static readonly MAX_LEVEL = 3;

  private saveTimeout: number | null = null;

  private constructor() {
    this.loadState();

    // Ensure we save immediately if the player leaves or minimizes the game
    window.addEventListener('beforeunload', () => this.forceSaveState());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.forceSaveState();
      }
    });
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  private loadState() {
    const savedCredits = localStorage.getItem('si_credits');
    if (savedCredits) this._credits = parseInt(savedCredits, 10);

    const savedMaxHp = localStorage.getItem('si_max_hp');
    if (savedMaxHp) this._maxHp = parseInt(savedMaxHp, 10);

    const savedHp = localStorage.getItem('si_hp');
    if (savedHp) {
      this._currentHp = parseInt(savedHp, 10);
    } else {
      this._currentHp = this._maxHp;
    }

    const savedBaseWeaponLevel = localStorage.getItem('si_base_weapon_level');
    if (savedBaseWeaponLevel) this._baseWeaponLevel = parseInt(savedBaseWeaponLevel, 10);
    this._weaponLevel = this._baseWeaponLevel;

    const savedAntimatter = localStorage.getItem('si_antimatter');
    if (savedAntimatter) this._antimatter = parseInt(savedAntimatter, 10);

    const savedShields = localStorage.getItem('si_shields');
    if (savedShields) this._shields = parseInt(savedShields, 10);

    const savedBombs = localStorage.getItem('si_bombs');
    if (savedBombs) this._bombs = parseInt(savedBombs, 10);

    const savedWeapon = localStorage.getItem('si_equipped_weapon');
    if (savedWeapon === 'plasma' || savedWeapon === 'ion' || savedWeapon === 'wave') {
      this._equippedWeapon = savedWeapon;
    }

    const savedDrone = localStorage.getItem('si_has_drone');
    if (savedDrone === 'true') this._hasDrone = true;

    const savedHiScore = localStorage.getItem('si_hi_score');
    if (savedHiScore) this._hiScore = parseInt(savedHiScore, 10);

    const savedLevel = parseInt(localStorage.getItem('si_unlocked_level') || '1', 10);
    this._unlockedLevel = Number.isFinite(savedLevel)
      ? Math.max(1, Math.min(savedLevel, GameState.MAX_LEVEL))
      : 1;
  }

  private saveState() {
    if (this.saveTimeout !== null) {
      return;
    }

    // Batch rapid consecutive saves (e.g., collecting multiple antimatter drops)
    this.saveTimeout = window.setTimeout(() => {
      this.forceSaveState();
      this.saveTimeout = null;
    }, 500);
  }

  private forceSaveState() {
    // Clear any pending timeout since we're saving right now
    if (this.saveTimeout !== null) {
      window.clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    localStorage.setItem('si_credits', this._credits.toString());
    localStorage.setItem('si_hp', this._currentHp.toString());
    localStorage.setItem('si_max_hp', this._maxHp.toString());
    localStorage.setItem('si_base_weapon_level', this._baseWeaponLevel.toString());
    localStorage.setItem('si_antimatter', this._antimatter.toString());
    localStorage.setItem('si_shields', this._shields.toString());
    localStorage.setItem('si_bombs', this._bombs.toString());
    localStorage.setItem('si_equipped_weapon', this._equippedWeapon);
    localStorage.setItem('si_has_drone', this._hasDrone.toString());
    localStorage.setItem('si_hi_score', this._hiScore.toString());
    localStorage.setItem('si_unlocked_level', this._unlockedLevel.toString());
  }

  public get credits(): number {
    return this._credits;
  }

  public addCredits(amount: number) {
    this._credits += amount;
    this.saveState();
  }

  public spendCredits(amount: number): boolean {
    if (this._credits >= amount) {
      this._credits -= amount;
      this.saveState();
      return true;
    }
    return false;
  }

  public get antimatter(): number {
    return this._antimatter;
  }

  public addAntimatter(amount: number) {
    this._antimatter += amount;
    this.saveState();
  }

  public spendAntimatter(amount: number): boolean {
    if (this._antimatter >= amount) {
      this._antimatter -= amount;
      this.saveState();
      return true;
    }
    return false;
  }

  public get shields(): number {
    return this._shields;
  }

  public addShield(amount: number) {
    this._shields += amount;
    this.saveState();
  }

  public useShield(): boolean {
    if (this._shields > 0) {
      this._shields -= 1;
      this.saveState();
      return true;
    }
    return false;
  }

  public get bombs(): number {
    return this._bombs;
  }

  public addBomb(amount: number) {
    this._bombs += amount;
    this.saveState();
  }

  public useBomb(): boolean {
    if (this._bombs > 0) {
      this._bombs -= 1;
      this.saveState();
      return true;
    }
    return false;
  }

  public get equippedWeapon(): 'plasma' | 'ion' | 'wave' {
    return this._equippedWeapon;
  }

  public setEquippedWeapon(weapon: 'plasma' | 'ion' | 'wave') {
    this._equippedWeapon = weapon;
    this.saveState();
  }

  public get hasDrone(): boolean {
    return this._hasDrone;
  }

  public setHasDrone(value: boolean) {
    this._hasDrone = value;
    this.saveState();
  }

  public get currentHp(): number {
    return this._currentHp;
  }

  public get maxHp(): number {
    return this._maxHp;
  }

  public upgradeMaxHp() {
    this._maxHp += 1;
    this._currentHp = this._maxHp; // Heal to full on upgrade
    this.saveState();
  }

  public setHp(amount: number) {
    this._currentHp = Math.max(0, Math.min(amount, this._maxHp));
    this.saveState();
  }

  public repair(amount: number) {
    this.setHp(this._currentHp + amount);
  }

  public get weaponLevel(): number {
    return this._weaponLevel;
  }

  public upgradeWeapon() {
    if (this._weaponLevel < 4) {
      this._weaponLevel += 1;
    }
  }

  public resetWeaponLevel() {
    this._weaponLevel = this._baseWeaponLevel;
  }

  public get hiScore(): number {
    return this._hiScore;
  }

  public updateHiScore(score: number) {
    if (score > this._hiScore) {
      this._hiScore = score;
      this.saveState();
    }
  }

  /** Furthest level the player may start from (1..MAX_LEVEL). */
  public get unlockedLevel(): number {
    return this._unlockedLevel;
  }

  public unlockLevel(level: number) {
    const clamped = Math.max(1, Math.min(level, GameState.MAX_LEVEL));
    if (clamped > this._unlockedLevel) {
      this._unlockedLevel = clamped;
      this.saveState();
    }
  }

  public resetProgress() {
    this._unlockedLevel = 1;
    this.saveState();
  }
}
