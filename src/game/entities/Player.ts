import Phaser from 'phaser';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameConfig } from '../config/GameConfig';
import { EntityManager } from '../managers/EntityManager';
import { burst } from '../effects/burst';

import { GameState } from '../../services/GameState';
import { AudioManager } from '../../services/AudioManager';
import { PlasmaWeapon, IonWeapon, WaveWeapon, BeamWeapon, SpreadWeapon, HomingWeapon, WeaponStrategy } from '../weapons/WeaponStrategies';
import { PlayerContext, PlayerStateComponent, FighterState, MechaState } from './components/PlayerStateComponent';

export type PlayerForm = 'fighter' | 'mecha';

export class Player extends Phaser.GameObjects.Container {
  public weaponLevel: number;
  private form: PlayerForm = 'fighter';
  private sprite: Phaser.GameObjects.Sprite;
  private shieldGraphics: Phaser.GameObjects.Graphics;
  private lastFired: number = 0;
  private lastSwarmFired: number = 0;
  private exhaustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  
  private purchasedShieldActive: boolean = false;
  private purchasedShieldGraphics!: Phaser.GameObjects.Graphics;
  
  private tempWeapon: 'spread' | 'homing' | null = null;
  private tempWeaponTimerEvent?: Phaser.Time.TimerEvent;
  
  private currentStateComponent: PlayerStateComponent;
  private fighterState: FighterState;
  private mechaState: MechaState;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    
    this.weaponLevel = GameState.getInstance().weaponLevel;

    // We add an arcade physics body to the container
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCollideWorldBounds(true);
      // Adjust hitbox size
      body.setSize(30, 30);
      body.setOffset(-15, -15);
    }

    this.sprite = scene.add.sprite(0, 0, 'ship');
    this.sprite.setScale(0.5488);
    this.add(this.sprite);

    this.shieldGraphics = scene.add.graphics();
    this.shieldGraphics.lineStyle(4, 0x00ffcc, 0.8);
    this.shieldGraphics.fillStyle(0x00ffcc, 0.2);
    this.shieldGraphics.strokeCircle(0, 0, 50);
    this.shieldGraphics.fillCircle(0, 0, 50);
    this.shieldGraphics.setVisible(false);
    this.add(this.shieldGraphics);

    this.purchasedShieldGraphics = scene.add.graphics();
    this.purchasedShieldGraphics.lineStyle(4, 0x0088ff, 0.8);
    this.purchasedShieldGraphics.fillStyle(0x0088ff, 0.2);
    this.purchasedShieldGraphics.strokeCircle(0, 0, 60);
    this.purchasedShieldGraphics.fillCircle(0, 0, 60);
    this.purchasedShieldGraphics.setVisible(false);
    this.add(this.purchasedShieldGraphics);

    this.exhaustEmitter = scene.add.particles(0, 0, 'particle', {
      speedY: { min: 200, max: 400 },
      speedX: { min: -20, max: 20 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      tint: [0x00aaff, 0x0044ff],
      frequency: 20
    });
    this.exhaustEmitter.startFollow(this, 0, 40);
    
    this.fighterState = new FighterState();
    this.mechaState = new MechaState();
    
    this.currentStateComponent = this.fighterState;
    this.currentStateComponent.enter(this.getPlayerContext());
  }

  private getPlayerContext(): PlayerContext {
    return {
      x: this.x,
      y: this.y,
      sprite: this.sprite,
      body: this.body as Phaser.Physics.Arcade.Body,
      exhaustEmitter: this.exhaustEmitter,
      shieldGraphics: this.shieldGraphics,
      scene: this.scene
    };
  }

  public transformToMecha() {
    if (this.form === 'mecha') return;
    this.form = 'mecha';
    AnalyticsService.getInstance().formSwitch('mecha');

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }

    this.currentStateComponent.exit(this.getPlayerContext());
    this.currentStateComponent = this.mechaState;
    this.currentStateComponent.enter(this.getPlayerContext());
  }

  public revertToFighter() {
    if (this.form === 'fighter') return;
    this.form = 'fighter';
    AnalyticsService.getInstance().formSwitch('fighter');

    this.currentStateComponent.exit(this.getPlayerContext());
    this.currentStateComponent = this.fighterState;
    this.currentStateComponent.enter(this.getPlayerContext());
  }

  public getForm(): PlayerForm {
    return this.form;
  }
  
  public activatePurchasedShield() {
    if (this.purchasedShieldActive) return;
    
    this.purchasedShieldActive = true;
    this.purchasedShieldGraphics.setVisible(true);
    
    this.scene.tweens.add({
      targets: this.purchasedShieldGraphics,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.scene.time.delayedCall(15000, () => {
      this.purchasedShieldActive = false;
      this.scene.tweens.killTweensOf(this.purchasedShieldGraphics);
      this.purchasedShieldGraphics.setVisible(false);
      this.purchasedShieldGraphics.alpha = 1;
    });
  }

  public isShielded(): boolean {
    return this.purchasedShieldActive || this.form === 'mecha';
  }
  
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
    const isMecha = this.getForm() === 'mecha';
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
    let fireRate = this.form === 'fighter' ? GameConfig.Player.FireRateFighter : GameConfig.Player.FireRateMecha;
    
    fireRate *= this.getWeaponStrategy().getFireRateModifier();
    
    if (this.weaponLevel >= 2) {
      fireRate *= 0.5; // 50% faster fire rate for upgraded weapons
    }

    if (time > this.lastFired + fireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
  }

  public canFireSwarm(time: number): boolean {
    if (this.form !== 'mecha') return false;
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
        
        proj.fire(this.x, this.y, vy, GameConfig.Player.DamageMecha * 0.5, 'homing');
        const body = proj.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocityX(vx);
        }
      }
    });
  }

  public updateMelee(entityManager: EntityManager, time: number) {
    this.currentStateComponent.update(this.getPlayerContext(), entityManager, time);
  }

  public explode() {
    this.setVisible(false);
    this.exhaustEmitter.stop();
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setEnable(false);
    }

    // Main fiery explosion
    burst(this.scene, this.x, this.y, 100, {
      speed: { min: 100, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 3, end: 0 },
      blendMode: 'ADD',
      lifespan: 800,
      tint: [0xffaa00, 0xff0000, 0xffff00, 0xffffff]
    });

    // Shockwave ring
    burst(this.scene, this.x, this.y, 1, {
      speed: 600,
      scale: { start: 0, end: 15 },
      alpha: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 400,
      tint: 0xffdd00
    });

    // Debris
    burst(this.scene, this.x, this.y, 30, {
      speed: { min: 50, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1500,
      tint: 0x555555
    });
  }

  public fire(entityManager: EntityManager) {
    AudioManager.getInstance().playPew(this.scene, { volume: 0.3 });

    const strategy = this.getWeaponStrategy();
    strategy.fire({
      x: this.x,
      y: this.y,
      weaponLevel: this.weaponLevel,
      isMecha: this.form === 'mecha',
      scene: this.scene
    }, entityManager);
  }
}
