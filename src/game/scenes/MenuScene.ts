import Phaser from 'phaser';
import { MainMenuUI } from '../../ui/MainMenuUI';
import { EntityConfig } from '../config/EntityConfig';
import { fadeIn, fadeToScene } from '../utils/transition';

export class MenuScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.TileSprite;
  private ui!: MainMenuUI;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    fadeIn(this, 600);
    const { width, height } = this.scale;

    // Parallax: slow tiled starfield + faster near stars
    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'starfield');
    this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: -4,
      lifespan: 4000,
      speedY: { min: 80, max: 160 },
      alpha: { start: 0.9, end: 0.2 },
      quantity: 1,
      frequency: 120,
    });

    this.drawPlanet(width, height);
    this.addHeroShip(width, height);

    this.ui = new MainMenuUI({
      onPlay: () => this.startLevel(1),
      onContinue: (level) => this.startLevel(level),
      onGarage: () => fadeToScene(this, 'GarageScene'),
      onAIDemo: () => {
        (window as any).__AI_DEMO_MODE__ = true;
        (window as any).__START_GAME__();
      },
      onExit: async () => {
        if ((window as any).Telegram?.WebApp?.initData) {
          (window as any).Telegram.WebApp.close();
        } else if ((window as any).Capacitor?.isNativePlatform()) {
          try {
            const { App } = await import('@capacitor/app');
            await App.exitApp();
          } catch (e) {
            console.error('Failed to exit Capacitor app', e);
          }
        }
      },
      onLanguageChanged: () => this.scene.restart(),
    });

    this.ui.mount();

    // Export for E2E tests
    (window as any).__START_GAME__ = () => {
      this.ui.hide();
      this.startLevel(1, 10); // Fast fade for tests
    };

    this.events.once('shutdown', () => {
      this.ui.unmount();
    });
  }

  /** Big planet curving in from the bottom-left, with a lit rim and night side. */
  private drawPlanet(width: number, height: number) {
    const cx = width * 0.15;
    const cy = height * 0.92;
    const r = width * 0.75;
    const g = this.add.graphics();
    g.fillStyle(0x0038ce, 0.12);
    g.fillCircle(cx, cy, r + 14);
    g.fillStyle(0x0a1a4a, 1);
    g.fillCircle(cx, cy, r);
    g.fillStyle(0x10307a, 1);
    g.fillCircle(cx + 10, cy - 10, r - 12);
    g.fillStyle(0x0a1a4a, 1);
    g.fillCircle(cx - 14, cy + 12, r - 14);
    g.lineStyle(2, 0x00c0ff, 0.8);
    g.beginPath();
    g.arc(cx, cy, r, Phaser.Math.DegToRad(-100), Phaser.Math.DegToRad(-10));
    g.strokePath();
  }

  private addHeroShip(width: number, height: number) {
    const x = width / 2;
    const y = height * 0.5;
    const ship = this.add.image(x, y, 'player_fighter').setScale(EntityConfig.Player.scale * 1.4);

    const exhaust = this.add.particles(0, 0, 'particle', {
      speedY: { min: 120, max: 220 },
      speedX: { min: -12, max: 12 },
      scale: { start: 1.6, end: 0 },
      lifespan: 350,
      tint: [0x00aaff, 0x0044ff, 0xffffff],
      blendMode: 'ADD',
      frequency: 25,
    });
    exhaust.startFollow(ship, 0, 24);
    exhaust.setDepth(1);
    ship.setDepth(2);

    this.tweens.add({
      targets: ship,
      y: y - 6,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: ship,
      angle: { from: -3, to: 3 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private startLevel(level: number, fadeMs = 600) {
    import('../../services/StoryManager').then(({ StoryManager }) => {
      StoryManager.getInstance().showBriefing(`level_${level}`, () => {
        fadeToScene(this, 'MapScene', { level }, fadeMs);
      });
    });
  }

  update(_time: number, delta: number) {
    this.background.tilePositionY -= 0.03 * delta;
  }
}
