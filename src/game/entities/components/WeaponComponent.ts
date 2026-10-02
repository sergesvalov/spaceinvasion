import { AudioManager } from '../../../services/AudioManager';
import { GameState } from '../../../services/GameState';
import { GameConfig } from '../../config/GameConfig';
import { EntityManager } from '../../managers/EntityManager';
import { Player } from '../Player';
import { BeamWeapon, HomingWeapon, IonWeapon, PlasmaWeapon, SpreadWeapon, WaveWeapon, WeaponStrategy } from '../../weapons/WeaponStrategies';
import Phaser from 'phaser';

export class WeaponComponent {
  private lastFired: number = 0;
  private lastSwarmFired: number = 0;
  
  private tempWeapon: 'spread' | 'homing' | null = null;
  private tempWeaponTimerEvent?: Phaser.Time.TimerEvent;

  constructor(private player: Player, private scene: Phaser.Scene) {}

  public setTempWeapon(type: 'spread' | 'homing', duration: number) {
    this.tempWeapon = type;
    if (this.tempWeaponTimerEvent) {
      this.tempWeaponTimerEvent.destroy();
    }
    this.tempWeaponTimerEvent = this.scene.time.delayedCall(duration, () => {
      this.tempWeapon = null;
    });
  }

  private getWeaponStrategy(): WeaponStrategy {
    const state = GameState.getInstance();
    let weaponClass = state.equippedWeapon as string;
    if (this.tempWeapon) {
      weaponClass = this.tempWeapon;
    }
    const isMecha = this.player.getForm() === 'mecha';
    if (isMecha && !this.tempWeapon) {
      weaponClass = 'beam';
    }

    switch (weaponClass) {
      case 'ion': return new IonWeapon();
      case 'wave': return new WaveWeapon();
      case 'beam': return new BeamWeapon();
      case 'spread': return new SpreadWeapon();
      case 'homing': return new HomingWeapon();
      case 'plasma':
      default: return new PlasmaWeapon();
    }
  }

  public canFire(time: number): boolean {
    let fireRate = this.player.getForm() === 'fighter' ? GameConfig.Player.FireRateFighter : GameConfig.Player.FireRateMecha;
    fireRate *= this.getWeaponStrategy().getFireRateModifier();
    
    if (this.player.weaponLevel >= 2) {
      fireRate *= 0.5; // 50% faster fire rate for upgraded weapons
    }

    if (time > this.lastFired + fireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
  }

  public fire(entityManager: EntityManager) {
    AudioManager.getInstance().playPew(this.scene, { volume: 0.3 });

    const strategy = this.getWeaponStrategy();
    strategy.fire({
      x: this.player.x,
      y: this.player.y,
      weaponLevel: this.player.weaponLevel,
      isMecha: this.player.getForm() === 'mecha',
      scene: this.scene
    }, entityManager);
  }

  public canFireSwarm(time: number): boolean {
    if (this.player.getForm() !== 'mecha') return false;
    if (time > this.lastSwarmFired + 2000) {
      this.lastSwarmFired = time;
      return true;
    }
    return false;
  }

  public fireSwarm(entityManager: EntityManager) {
    AudioManager.getInstance().playPew(this.scene, { volume: 0.6, rate: 1.2 });

    const angles = [-60, -30, 0, 30, 60];
    const speed = 300;
    
    angles.forEach(angle => {
      const proj = entityManager.getProjectile() as any;
      if (proj && typeof proj.fire === 'function') {
        const rad = Phaser.Math.DegToRad(angle - 90);
        const vx = Math.cos(rad) * speed;
        const vy = Math.sin(rad) * speed;
        
        proj.fire(this.player.x, this.player.y, vy, GameConfig.Player.DamageMecha * 0.5, 'homing');
        const body = proj.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocityX(vx);
        }
      }
    });
  }
}
