import Phaser from 'phaser';
import { GameState } from '../../services/GameState';
import { GarageUI } from '../../ui/GarageUI';

export class GarageScene extends Phaser.Scene {
  private sparksEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private ui!: GarageUI;

  private REPAIR_COST = 1000;
  private SHIELD_COST = 5; // Antimatter
  private BOMB_COST = 2500; // Credits
  private DRONE_COST = 15; // Antimatter

  constructor() {
    super({ key: 'GarageScene' });
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const { width, height } = this.scale;

    // Hologram Background
    const bg = this.add.image(width / 2, height / 2, 'game_atlas', 'hangar');
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    bg.setTint(0x004488); // Blueish holographic tint
    bg.setAlpha(0.6);

    // Scanlines
    const scanlines = this.add.graphics();
    scanlines.fillStyle(0x000000, 0.4);
    for (let i = 0; i < height; i += 4) {
      scanlines.fillRect(0, i, width, 1);
    }

    // Sparks Emitter for damage
    this.sparksEmitter = this.add.particles(width / 2, height / 2, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 200, max: 340 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      gravityY: 400,
      lifespan: 800,
      tint: [0xffffff, 0xffff00, 0xff0000],
      frequency: 50,
    });

    this.ui = new GarageUI({
      onBack: () => {
        this.triggerHaptic('light');
        this.scene.start('MenuScene');
      },
      onRepair: () => this.handleRepair(),
      onBuyBomb: () => this.handleBuyBomb(),
      onBuyShield: () => this.handleBuyShield(),
      onBuyDrone: () => this.handleBuyDrone(),
      onSwitchWeapon: () => this.handleSwitchWeapon(),
    });

    this.ui.mount();

    this.events.once('shutdown', () => {
      this.ui.unmount();
    });

    this.updateUI();
  }

  private handleRepair() {
    const state = GameState.getInstance();
    if (state.currentHp < state.maxHp && state.credits >= this.REPAIR_COST) {
      state.spendCredits(this.REPAIR_COST);
      state.repair(1);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      if (state.credits < this.REPAIR_COST) this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private handleBuyBomb() {
    const state = GameState.getInstance();
    if (state.credits >= this.BOMB_COST) {
      state.spendCredits(this.BOMB_COST);
      state.addBomb(1);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private handleBuyDrone() {
    const state = GameState.getInstance();
    if (!state.hasDrone && state.antimatter >= this.DRONE_COST) {
      state.spendAntimatter(this.DRONE_COST);
      state.setHasDrone(true);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private handleSwitchWeapon() {
    const state = GameState.getInstance();
    const weapons: Array<'plasma' | 'ion' | 'wave'> = ['plasma', 'ion', 'wave'];
    const currentIndex = weapons.indexOf(state.equippedWeapon);
    const nextIndex = (currentIndex + 1) % weapons.length;
    state.setEquippedWeapon(weapons[nextIndex]);
    this.triggerHaptic('light');
    this.updateUI();
  }

  private triggerHaptic(type: 'light' | 'error') {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'light') {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      } else {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }

  private handleBuyShield() {
    const state = GameState.getInstance();
    if (state.antimatter >= this.SHIELD_COST) {
      state.spendAntimatter(this.SHIELD_COST);
      state.addShield(1);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private updateUI() {
    const state = GameState.getInstance();

    if (this.ui) {
      this.ui.update();
    }

    const needsRepair = state.currentHp < state.maxHp;
    if (!needsRepair) {
      this.sparksEmitter?.stop();
    } else {
      if (!this.sparksEmitter?.on) this.sparksEmitter?.start();
      const damage = state.maxHp - state.currentHp;
      this.sparksEmitter?.setFrequency(150 / damage);
    }
  }
}
