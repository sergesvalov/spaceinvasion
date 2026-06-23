export class GameState {
  private static instance: GameState;

  private _credits: number = 0;
  private _currentHp: number = 3;
  private readonly MAX_HP: number = 3;

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
    if (savedCredits) {
      this._credits = parseInt(savedCredits, 10);
    }

    const savedHp = localStorage.getItem('si_hp');
    if (savedHp) {
      this._currentHp = parseInt(savedHp, 10);
    }
  }

  private saveState() {
    localStorage.setItem('si_credits', this._credits.toString());
    localStorage.setItem('si_hp', this._currentHp.toString());
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
    return this.MAX_HP;
  }

  public setHp(amount: number) {
    this._currentHp = Phaser.Math.Clamp(amount, 0, this.MAX_HP);
    this.saveState();
  }

  public repair(amount: number) {
    this.setHp(this._currentHp + amount);
  }
}
