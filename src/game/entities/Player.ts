import Phaser from 'phaser';
import { EventBus } from '../../services/EventBus';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameConfig } from '../config/GameConfig';
import { EntityManager } from '../managers/EntityManager';

import { GameState } from '../../services/GameState';

export type PlayerForm = 'fighter' | 'mecha';

export class Player extends Phaser.GameObjects.Container {
  public weaponLevel: number;
  private form: PlayerForm = 'fighter';
  private sprite: Phaser.GameObjects.Sprite;
  private shieldGraphics: Phaser.GameObjects.Graphics;
  private lastFired: number = 0;
  private lastSwarmFired: number = 0;
  private lastMeleeFired: number = 0;
  private exhaustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  
  private purchasedShieldActive: boolean = false;
  private purchasedShieldGraphics!: Phaser.GameObjects.Graphics;
  
  private tempWeapon: 'spread' | 'homing' | null = null;
  private tempWeaponTimerEvent?: Phaser.Time.TimerEvent;

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
    this.sprite.setScale(0.0686);
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
    
    this.setFighterForm();
  }

  private setFighterForm() {
    this.sprite.setTexture('ship');
    this.sprite.setTint(0xffffff); // Normal color
    this.sprite.setScale(0.0686);
    
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setConfig({
        speedY: { min: 200, max: 400 },
        speedX: { min: -20, max: 20 },
        scale: { start: 1.5, end: 0 },
        tint: [0x00aaff, 0x0044ff]
      });
      this.exhaustEmitter.startFollow(this, 0, 40);
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(40, 46);
      body.setOffset(-20, -26);
    }
  }

  private setMechaForm() {
    this.sprite.setTexture('mecha');
    this.sprite.setTint(0xffffff);
    this.sprite.setScale(0.132); // 10% larger than 0.12
    
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setConfig({
        speedY: { min: 100, max: 200 },
        speedX: { min: -30, max: 30 },
        scale: { start: 2.5, end: 0 },
        tint: [0xffaa00, 0xff4400]
      });
      this.exhaustEmitter.startFollow(this, 0, 53);
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(53, 53);
      body.setOffset(-26, -26);
    }
  }

  public transformToMecha() {
    if (this.form === 'mecha') return;
    this.form = 'mecha';
    AnalyticsService.getInstance().formSwitch('mecha');

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }

    this.setMechaForm();
    this.shieldGraphics.setVisible(true);
    
    // Pulse animation for shield
    this.scene.tweens.add({
      targets: this.shieldGraphics,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Shockwave visual & event
    const shockwave = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: 600,
      scale: { start: 0, end: 15 },
      alpha: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 400,
      tint: 0xffaa00,
      quantity: 1
    });
    shockwave.explode(1);

    EventBus.emit('mecha_shockwave', { x: this.x, y: this.y, radius: 400 });
  }

  public revertToFighter() {
    if (this.form === 'fighter') return;
    this.form = 'fighter';
    AnalyticsService.getInstance().formSwitch('fighter');

    this.setFighterForm();
    this.shieldGraphics.setVisible(false);
    this.scene.tweens.killTweensOf(this.shieldGraphics);
    this.shieldGraphics.alpha = 1;
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
  
  public canFire(time: number): boolean {
    const state = GameState.getInstance();
    let fireRate = this.form === 'fighter' ? GameConfig.Player.FireRateFighter : GameConfig.Player.FireRateMecha;
    
    if (state.equippedWeapon === 'ion') {
      fireRate *= 2.5; 
    } else if (state.equippedWeapon === 'wave') {
      fireRate *= 1.5; 
    }
    
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
    if (localStorage.getItem('soundEnabled') !== 'false') {
      this.scene.sound.play('pew', { volume: 0.6, rate: 1.2 });
    }

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
    if (this.form !== 'mecha') return;
    if (time < this.lastMeleeFired + 1000) return; // 1s cooldown

    let nearestDist = Infinity;
    entityManager.enemies.children.iterate((c) => {
      const e = c as any;
      if (e.active) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
        if (dist < nearestDist) {
          nearestDist = dist;
        }
      }
      return true;
    });

    if (nearestDist < 150) {
      this.lastMeleeFired = time;
      this.performMeleeSlash(entityManager);
    }
  }

  private performMeleeSlash(entityManager: EntityManager) {
    if (localStorage.getItem('soundEnabled') !== 'false') {
      this.scene.sound.play('explosion', { volume: 0.5, rate: 2.0 });
    }

    const slash = this.scene.add.graphics();
    slash.lineStyle(8, 0x00ffff, 1);
    slash.beginPath();
    slash.arc(this.x, this.y - 20, 100, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    slash.strokePath();

    this.scene.tweens.add({
      targets: slash,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => slash.destroy()
    });

    entityManager.enemies.children.iterate((c) => {
      const e = c as any;
      if (e.active) {
        const dist = Phaser.Math.Distance.Between(this.x, this.y - 20, e.x, e.y);
        if (dist < 150 && e.y < this.y) {
          e.takeDamage(GameConfig.Player.DamageMecha * 5); 
        }
      }
      return true;
    });
  }

  public explode() {
    this.setVisible(false);
    this.exhaustEmitter.stop();
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setEnable(false);
    }

    // Main fiery explosion
    const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 100, max: 500 },
      angle: { min: 0, max: 360 },
      scale: { start: 3, end: 0 },
      blendMode: 'ADD',
      lifespan: 800,
      tint: [0xffaa00, 0xff0000, 0xffff00, 0xffffff],
      quantity: 100
    });
    emitter.explode(100);

    // Shockwave ring
    const shockwave = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: 600,
      scale: { start: 0, end: 15 },
      alpha: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 400,
      tint: 0xffdd00,
      quantity: 1
    });
    shockwave.explode(1);

    // Debris
    const debris = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 1500,
      tint: 0x555555,
      quantity: 30
    });
    debris.explode(30);
  }

  public fire(entityManager: EntityManager) {
    if (localStorage.getItem('soundEnabled') !== 'false') {
      this.scene.sound.play('pew', { volume: 0.3 });
    }

    const state = GameState.getInstance();
    let weaponClass = state.equippedWeapon as string;
    if (this.tempWeapon) {
      weaponClass = this.tempWeapon;
    }

    const isMecha = this.getForm() === 'mecha';
    
    let baseDamage = isMecha ? GameConfig.Player.DamageMecha : GameConfig.Player.DamageFighter;
    let speed = isMecha ? -400 : -600;

    if (isMecha && !this.tempWeapon) {
      weaponClass = 'beam';
      speed = -1000; // Fast laser
    }

    if (weaponClass === 'ion') {
      baseDamage *= 4;
      speed *= 0.7; // slower projectile
    } else if (weaponClass === 'wave') {
      baseDamage *= 1.5;
      speed *= 0.8;
    } else if (weaponClass === 'beam') {
      baseDamage *= 2; 
    }

    let lines = 1;
    if (isMecha || this.weaponLevel >= 3) {
      lines = 2;
    }

    const fireProj = (x: number, y: number, vx: number, vy: number, target?: any) => {
      const proj = entityManager.getProjectile() as any;
      if (proj && typeof proj.fire === 'function') {
        proj.fire(x, y, vy, baseDamage, weaponClass);
        const body = proj.body as Phaser.Physics.Arcade.Body;
        if (body) body.setVelocityX(vx);
        if (target) proj.target = target;
      }
    };

    if (weaponClass === 'spread') {
      const angles = [-30, -15, 0, 15, 30];
      angles.forEach(angle => {
        const rad = Phaser.Math.DegToRad(angle - 90);
        const vx = Math.cos(rad) * Math.abs(speed);
        const vy = Math.sin(rad) * Math.abs(speed);
        fireProj(this.x, this.y - 20, vx, vy);
      });
      return;
    }

    if (weaponClass === 'homing') {
      // Find nearest enemy
      let nearestDist = Infinity;
      let nearestEnemy: any = null;
      entityManager.enemies.children.iterate((c) => {
        const e = c as any;
        if (e.active) {
          const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = e;
          }
        }
        return true;
      });
      // Also check boss
      // Not easily accessible here without a boss ref, but it's okay for homing to just hit normal enemies or just fire straight if none
      fireProj(this.x, this.y - 20, 0, speed, nearestEnemy);
      return;
    }

    if (lines === 2) {
      fireProj(this.x - 10, this.y, 0, speed);
      fireProj(this.x + 10, this.y, 0, speed);
    } else {
      fireProj(this.x, this.y - 20, 0, speed);
    }

    if (this.weaponLevel >= 4) {
      const diagSpeed = speed * 0.707;
      fireProj(this.x - 15, this.y, speed * 0.707, diagSpeed); // Left (speed is negative, so vx < 0)
      fireProj(this.x + 15, this.y, -speed * 0.707, diagSpeed); // Right
    }
  }
}
