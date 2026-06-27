export class GameState {
  private static instance: GameState;

  private _credits: number = 0;
  private _currentHp: number = 3;
  private _maxHp: number = 3;
  private _weaponLevel: number = 1;

  private constructor() {
    this.loadState();
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

    const savedWeaponLevel = localStorage.getItem('si_weapon_level');
    if (savedWeaponLevel) this._weaponLevel = parseInt(savedWeaponLevel, 10);
  }

  private saveState() {
    localStorage.setItem('si_credits', this._credits.toString());
    localStorage.setItem('si_hp', this._currentHp.toString());
    localStorage.setItem('si_max_hp', this._maxHp.toString());
    localStorage.setItem('si_weapon_level', this._weaponLevel.toString());
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
    this._currentHp = Phaser.Math.Clamp(amount, 0, this._maxHp);
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
      this.saveState();
    }
  }
}
