import Phaser from 'phaser';
import { MapUI } from '../../ui/MapUI';
import { t, I18nKey } from '../../services/i18n';
import { StyleConfig } from '../config/StyleConfig';

const CYAN = 0x00ffcc;
const RED = 0xff0033;
const GREY = 0x445566;

export class MapScene extends Phaser.Scene {
  private levelData: any;
  private ui?: MapUI;

  constructor() {
    super({ key: 'MapScene' });
  }

  init(data: any) {
    this.levelData = data || { level: 1 };
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor('#000a12'); // Dark tactical blue/black
    // Keep the camera inside the drawn map, so zooming never reveals its edges
    this.cameras.main.setBounds(0, 0, width, height);

    // Draw Grid
    const grid = this.add.graphics();
    grid.lineStyle(1, CYAN, 0.1);
    for (let x = 0; x <= width; x += 30) {
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += 30) {
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    // Continents and archipelago (top 2/3 - the sector card covers the bottom)
    const land = this.add.graphics();
    land.lineStyle(2, CYAN, 0.6);
    land.fillStyle(CYAN, 0.05);
    const shape = (pts: [number, number][]) => {
      land.beginPath();
      land.moveTo(pts[0][0] * width, pts[0][1] * height);
      for (const [x, y] of pts.slice(1)) land.lineTo(x * width, y * height);
      land.closePath();
      land.fillPath();
      land.strokePath();
    };
    shape([
      [0, 0.05],
      [0.22, 0.08],
      [0.32, 0.18],
      [0.2, 0.3],
      [0.3, 0.42],
      [0.18, 0.55],
      [0, 0.6],
    ]);
    shape([
      [0.55, 0.22],
      [0.72, 0.2],
      [0.78, 0.3],
      [0.62, 0.36],
    ]);
    shape([
      [0.38, 0.4],
      [0.48, 0.37],
      [0.52, 0.47],
      [0.4, 0.5],
    ]);

    // Markers Configuration
    const markers = [
      { id: 1, x: width * 0.2, y: height * 0.15 },
      { id: 2, x: width * 0.66, y: height * 0.27 },
      { id: 3, x: width * 0.44, y: height * 0.44 },
      { id: 4, x: width * 0.8, y: height * 0.55 },
    ];

    const mapLevel = ((this.levelData.level - 1) % 4) + 1;
    const loop = Math.floor((this.levelData.level - 1) / 4);
    const activeMarker = markers.find((m) => m.id === mapLevel) || markers[0];

    // Route: travelled part solid, the rest dashed-grey
    const path = this.add.graphics();
    for (let i = 1; i < markers.length; i++) {
      const a = markers[i - 1];
      const b = markers[i];
      const done = b.id <= mapLevel;
      path.lineStyle(2, done ? CYAN : GREY, done ? 0.6 : 0.4);
      path.lineBetween(a.x, a.y, b.x, b.y);
    }

    markers.forEach((m) => {
      if (m.id < mapLevel) {
        // Cleared: cyan node with a pixel check mark
        this.add.circle(m.x, m.y, 7, 0x000a12).setStrokeStyle(2, CYAN);
        const check = this.add.graphics();
        check.lineStyle(2, CYAN, 1);
        check.beginPath();
        check.moveTo(m.x - 3, m.y);
        check.lineTo(m.x - 1, m.y + 3);
        check.lineTo(m.x + 4, m.y - 3);
        check.strokePath();
      } else if (m.id > mapLevel) {
        this.add.circle(m.x, m.y, 5, 0x000a12).setStrokeStyle(2, GREY);
      }
    });

    // Active marker with a pulse ring centred on it
    const ring = this.add.circle(activeMarker.x, activeMarker.y, 14).setStrokeStyle(2, RED, 0.9);
    this.tweens.add({
      targets: ring,
      scale: 1.8,
      alpha: 0,
      duration: 1000,
      repeat: -1,
      ease: 'Sine.easeOut',
    });
    this.add.circle(activeMarker.x, activeMarker.y, 6, RED, 1);

    // Label sized to its text, flipped to the left near the right edge
    const label = this.add.text(0, 0, t(`map.s${mapLevel}` as I18nKey), {
      fontFamily: StyleConfig.Fonts.Main,
      fontSize: '8px',
      color: '#ff3355',
    });
    const boxW = label.width + 10;
    const toRight = activeMarker.x + 16 + boxW <= width - 4;
    const boxX = toRight ? activeMarker.x + 16 : activeMarker.x - 16 - boxW;
    const boxY = activeMarker.y - 28;
    const labelBox = this.add.graphics();
    labelBox.fillStyle(0x000000, 0.75);
    labelBox.lineStyle(1, RED, 0.8);
    labelBox.fillRect(boxX, boxY, boxW, 16);
    labelBox.strokeRect(boxX, boxY, boxW, 16);
    labelBox.lineBetween(
      activeMarker.x + (toRight ? 8 : -8),
      activeMarker.y - 8,
      toRight ? boxX : boxX + boxW,
      boxY + 16,
    );
    label.setPosition(boxX + 5, boxY + 4).setDepth(1);

    this.cameras.main.fadeIn(StyleConfig.TransitionMs * 2, 0, 0, 0);
    this.cameras.main.pan(activeMarker.x, activeMarker.y + height * 0.15, 1500, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1.25, 1500, 'Sine.easeInOut');

    let proceeded = false;
    const proceed = () => {
      if (proceeded) return;
      proceeded = true;
      this.cameras.main.flash(300, 255, 255, 255);
      this.time.delayedCall(100, () => {
        this.scene.start('GameScene', { level: this.levelData.level });
      });
    };

    this.events.once('shutdown', () => {
      this.ui?.unmount();
      this.ui = undefined;
    });

    const w = window as any;
    if (w.__E2E_TEST_MODE__ || w.__AI_DEMO_MODE__) {
      // Fast forward in E2E
      this.time.delayedCall(500, proceed);
      return;
    }

    this.ui = new MapUI({ sector: mapLevel, loop, onLaunch: proceed });
    this.ui.mount();
  }
}
