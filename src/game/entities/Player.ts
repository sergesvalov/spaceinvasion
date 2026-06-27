import Phaser from 'phaser';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameConfig } from '../config/GameConfig';
import { EntityManager } from '../managers/EntityManager';

export type PlayerForm = 'fighter' | 'mecha';

export class Player extends Phaser.GameObjects.Container {
  public weaponLevel: number = 1;
  private form: PlayerForm = 'fighter';
  private sprite: Phaser.GameObjects.Sprite;
  private shieldGraphics: Phaser.GameObjects.Graphics;
  private lastFired: number = 0;
  private exhaustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    
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
    this.sprite.setScale(0.0624);
    this.add(this.sprite);

    this.shieldGraphics = scene.add.graphics();
    this.shieldGraphics.lineStyle(4, 0x00ffcc, 0.8);
    this.shieldGraphics.fillStyle(0x00ffcc, 0.2);
    this.shieldGraphics.strokeCircle(0, 0, 45);
    this.shieldGraphics.fillCircle(0, 0, 45);
    this.shieldGraphics.setVisible(false);
    this.add(this.shieldGraphics);

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
    this.exhaustEmitter.startFollow(this, 0, 36);
    
    this.setFighterForm();
  }

  private setFighterForm() {
    this.sprite.setTint(0xffffff); // Normal color
    
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setConfig({
        speedY: { min: 200, max: 400 },
        speedX: { min: -20, max: 20 },
        scale: { start: 1.5, end: 0 },
        tint: [0x00aaff, 0x0044ff]
      });
      this.exhaustEmitter.startFollow(this, 0, 36);
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(36, 42);
      body.setOffset(-18, -24);
    }
  }

  private setMechaForm() {
    this.sprite.setTint(0xffaa00); // Temporary tint to show Mecha form
    
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setConfig({
        speedY: { min: 100, max: 200 },
        speedX: { min: -30, max: 30 },
        scale: { start: 2.5, end: 0 },
        tint: [0xffaa00, 0xff4400]
      });
      this.exhaustEmitter.startFollow(this, 0, 48);
    }
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(48, 48);
      body.setOffset(-24, -24);
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
  
  public canFire(time: number): boolean {
    let fireRate = this.form === 'fighter' ? GameConfig.Player.FireRateFighter : GameConfig.Player.FireRateMecha;
    
    if (this.weaponLevel >= 2) {
      fireRate *= 0.6; // 40% faster fire rate for upgraded weapons
    }

    if (time > this.lastFired + fireRate) {
      this.lastFired = time;
      return true;
    }
    return false;
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

    const isMecha = this.getForm() === 'mecha';
    const damage = isMecha ? GameConfig.Player.DamageMecha : GameConfig.Player.DamageFighter;
    const speed = isMecha ? -400 : -600;

    let lines = 1;
    if (isMecha || this.weaponLevel >= 3) {
      lines = 2;
    }

    if (lines === 2) {
      const proj1 = entityManager.getProjectile();
      const proj2 = entityManager.getProjectile();
      if (proj1) proj1.fire(this.x - 10, this.y, speed, damage);
      if (proj2) proj2.fire(this.x + 10, this.y, speed, damage);
    } else {
      const proj = entityManager.getProjectile();
      if (proj) proj.fire(this.x, this.y - 20, speed, damage);
    }

    if (this.weaponLevel >= 4) {
      const projLeft = entityManager.getProjectile();
      const projRight = entityManager.getProjectile();
      const diagSpeed = speed * 0.707;
      
      if (projLeft) {
        projLeft.fire(this.x - 15, this.y, diagSpeed, damage);
        const bodyLeft = projLeft.body as Phaser.Physics.Arcade.Body;
        if (bodyLeft) bodyLeft.setVelocityX(speed * 0.707); // speed is negative, goes left
      }
      if (projRight) {
        projRight.fire(this.x + 15, this.y, diagSpeed, damage);
        const bodyRight = projRight.body as Phaser.Physics.Arcade.Body;
        if (bodyRight) bodyRight.setVelocityX(-speed * 0.707); // goes right
      }
    }
  }
}
