import Phaser from 'phaser';

export interface GameEvents {
  shield_request: () => void;
  bomb_request: () => void;
  toggle_pause: () => void;
  quit_to_menu: () => void;
  transform_request: () => void;
  dash_request: (dir: { dx: number; dy: number }) => void;
  player_hit: () => void;
  enemy_destroyed: (points: number) => void;
  antimatter_collected: () => void;
  powerup_collected: (type: string) => void;
  enemy_fire: (x: number, y: number, speed: number) => void;
  spawn_antimatter: (x: number, y: number, vx: number, vy: number) => void;
  mecha_shockwave: (data: { x: number; y: number; radius: number }) => void;
  boss_destroyed: () => void;
}

class TypedEventEmitter {
  private _emitter = new Phaser.Events.EventEmitter();

  public get phaserEmitter() {
    return this._emitter;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on<K extends keyof GameEvents>(event: K, fn: GameEvents[K], context?: any): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._emitter.on(event, fn as (...args: any[]) => void, context);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  once<K extends keyof GameEvents>(event: K, fn: GameEvents[K], context?: any): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._emitter.once(event, fn as (...args: any[]) => void, context);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off<K extends keyof GameEvents>(event: K, fn?: (...args: any[]) => void, context?: any): this {
    this._emitter.off(event, fn, context);
    return this;
  }

  emit<K extends keyof GameEvents>(event: K, ...args: Parameters<GameEvents[K]>): boolean {
    return this._emitter.emit(event, ...args);
  }
}

export const EventBus = new TypedEventEmitter();
