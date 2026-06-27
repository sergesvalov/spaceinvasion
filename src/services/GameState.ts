export class GameState {
  private static instance: GameState;

  private _credits: number = 0;
  private _currentHp: number = 3;
  private _maxHp: number = 3;
  private _baseWeaponLevel: number = 1;
  private _weaponLevel: number = 1;
  private _antimatter: number = 0;
  private _shields: number = 0;

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

    const savedBaseWeaponLevel = localStorage.getItem('si_base_weapon_level');
    if (savedBaseWeaponLevel) this._baseWeaponLevel = parseInt(savedBaseWeaponLevel, 10);
    this._weaponLevel = this._baseWeaponLevel;

    const savedAntimatter = localStorage.getItem('si_antimatter');
    if (savedAntimatter) this._antimatter = parseInt(savedAntimatter, 10);

    const savedShields = localStorage.getItem('si_shields');
    if (savedShields) this._shields = parseInt(savedShields, 10);
  }

  private saveState() {
    localStorage.setItem('si_credits', this._credits.toString());
    localStorage.setItem('si_hp', this._currentHp.toString());
    localStorage.setItem('si_max_hp', this._maxHp.toString());
    localStorage.setItem('si_base_weapon_level', this._baseWeaponLevel.toString());
    localStorage.setItem('si_antimatter', this._antimatter.toString());
    localStorage.setItem('si_shields', this._shields.toString());
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
    }
  }

  public resetWeaponLevel() {
    this._weaponLevel = this._baseWeaponLevel;
  }
}
