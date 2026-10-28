import Phaser from 'phaser';
import { GameState } from '../../services/GameState';
import { GarageUI } from '../../ui/GarageUI';
import { GameConfig } from '../config/GameConfig';
import { EntityConfig } from '../config/EntityConfig';
import { fadeIn, fadeToScene } from '../utils/transition';

export class GarageScene extends Phaser.Scene {
  private sparksEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private ui!: GarageUI;
  private drone?: Phaser.GameObjects.Image;
  private shipPos = { x: 0, y: 0 };

  constructor() {
    super({ key: 'GarageScene' });
  }

  create() {
    fadeIn(this);
    const { width, height } = this.scale;

    // Hangar art, dimmed so the ship and the UI stay the brightest things
    const artKey = this.textures.exists('hangar_art') ? 'hangar_art' : 'hangar_bg';
    const bg = this.add.image(width / 2, height * 0.3, artKey);
    bg.setScale(Math.max(width / bg.width, (height * 0.75) / bg.height));
    bg.setTint(0x6677aa).setAlpha(0.55);

    const scanlines = this.add.graphics();
    scanlines.fillStyle(0x000000, 0.35);
    for (let i = 0; i < height; i += 3) scanlines.fillRect(0, i, width, 1);

    this.ui = new GarageUI({
      onBack: () => fadeToScene(this, 'MenuScene'),
      onRepair: () => this.handleRepair(),
      onBuyBomb: () => this.handleBuyBomb(),
      onBuyShield: () => this.handleBuyShield(),
      onBuyDrone: () => this.handleBuyDrone(),
      onSelectWeapon: (w) => {
        GameState.getInstance().setEquippedWeapon(w);
        this.updateUI();
      },
    });
    this.ui.mount();

    this.events.once('shutdown', () => {
      this.ui.unmount();
    });

    this.shipPos = this.stageCenter();
    this.addShip();
    this.updateUI();
  }

  /** Centre of the transparent .garage-stage window in game coordinates. */
  private stageCenter(): { x: number; y: number } {
    const { width, height } = this.scale;
    const ui = document.getElementById('ui-container')?.getBoundingClientRect();
    const stage = document.querySelector('.garage-stage')?.getBoundingClientRect();
    if (!ui || !stage || ui.width === 0) return { x: width / 2, y: height * 0.27 };
    const k = width / ui.width;
    return {
      x: width / 2,
      y: Phaser.Math.Clamp((stage.top - ui.top + stage.height * 0.45) * k, 60, height * 0.5),
    };
  }

  private addShip() {
    const { x, y } = this.shipPos;

    // Holographic pad under the ship
    const pad = this.add
      .ellipse(x, y + 34, 110, 18, 0x00c0ff, 0.15)
      .setStrokeStyle(1, 0x00c0ff, 0.6);
    this.tweens.add({ targets: pad, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });

    const ship = this.add.image(x, y, 'player_fighter').setScale(EntityConfig.Player.scale * 1.6);
    this.tweens.add({
      targets: ship,
      y: y - 4,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.drone = this.add
      .image(x + 62, y - 6, 'player_fighter')
      .setScale(EntityConfig.Player.scale * 0.6)
      .setVisible(false);
    this.tweens.add({
      targets: this.drone,
      y: y - 12,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Sparks while the hull is damaged
    this.sparksEmitter = this.add.particles(x, y, 'particle', {
      speed: { min: 60, max: 180 },
      angle: { min: 200, max: 340 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      gravityY: 400,
      lifespan: 700,
      tint: [0xffffff, 0xffff00, 0xff0000],
      frequency: 50,
    });
  }

  private handleRepair(): boolean {
    const state = GameState.getInstance();
    const cost = GameConfig.Shop.RepairCost;
    if (state.currentHp >= state.maxHp || state.credits < cost) return false;
    state.spendCredits(cost);
    state.repair(1);
    this.updateUI();
    return true;
  }

  private handleBuyBomb(): boolean {
    const state = GameState.getInstance();
    if (!state.spendCredits(GameConfig.Shop.BombCost)) return false;
    state.addBomb(1);
    this.updateUI();
    return true;
  }

  private handleBuyDrone(): boolean {
    const state = GameState.getInstance();
    if (state.hasDrone || !state.spendAntimatter(GameConfig.Shop.DroneCost)) return false;
    state.setHasDrone(true);
    this.updateUI();
    return true;
  }

  private handleBuyShield(): boolean {
    const state = GameState.getInstance();
    if (!state.spendAntimatter(GameConfig.Shop.ShieldCost)) return false;
    state.addShield(1);
    this.updateUI();
    return true;
  }

  private updateUI() {
    const state = GameState.getInstance();

    this.ui?.update();
    this.drone?.setVisible(state.hasDrone);

    const needsRepair = state.currentHp < state.maxHp;
    if (!needsRepair) {
      this.sparksEmitter?.stop();
    } else {
      if (!this.sparksEmitter?.emitting) this.sparksEmitter?.start();
      const damage = state.maxHp - state.currentHp;
      this.sparksEmitter?.setFrequency(150 / damage);
    }
  }
}
