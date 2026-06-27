import Phaser from 'phaser';

export class MapScene extends Phaser.Scene {
  private levelData: any;
  private redMarker!: Phaser.GameObjects.Graphics;
  
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

    // Draw Grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00ffcc, 0.1);
    for (let x = 0; x < width; x += 50) {
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 50) {
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    grid.strokePath();

    // Draw Continents and Archipelago
    const mapGraphics = this.add.graphics();
    mapGraphics.lineStyle(2, 0x00ffcc, 0.6); // Neon cyan
    mapGraphics.fillStyle(0x00ffcc, 0.05);

    // Hardcoded continent (left side)
    mapGraphics.beginPath();
    mapGraphics.moveTo(0, height * 0.1);
    mapGraphics.lineTo(width * 0.2, height * 0.15);
    mapGraphics.lineTo(width * 0.25, height * 0.3);
    mapGraphics.lineTo(width * 0.15, height * 0.5);
    mapGraphics.lineTo(width * 0.3, height * 0.7);
    mapGraphics.lineTo(width * 0.2, height * 0.9);
    mapGraphics.lineTo(0, height);
    mapGraphics.closePath();
    mapGraphics.fillPath();
    mapGraphics.strokePath();

    // Island 1
    mapGraphics.beginPath();
    mapGraphics.moveTo(width * 0.4, height * 0.6);
    mapGraphics.lineTo(width * 0.5, height * 0.55);
    mapGraphics.lineTo(width * 0.55, height * 0.65);
    mapGraphics.lineTo(width * 0.45, height * 0.7);
    mapGraphics.closePath();
    mapGraphics.fillPath();
    mapGraphics.strokePath();

    // Island 2
    mapGraphics.beginPath();
    mapGraphics.moveTo(width * 0.6, height * 0.4);
    mapGraphics.lineTo(width * 0.7, height * 0.35);
    mapGraphics.lineTo(width * 0.75, height * 0.45);
    mapGraphics.lineTo(width * 0.65, height * 0.5);
    mapGraphics.closePath();
    mapGraphics.fillPath();
    mapGraphics.strokePath();

    // Markers Configuration
    const markers = [
      { id: 1, name: "SECTOR 1: COASTLINE", x: width * 0.25, y: height * 0.3 },
      { id: 2, name: "SECTOR 2: NEO-TOKYO", x: width * 0.65, y: height * 0.45 },
    ];

    const activeMarker = markers.find(m => m.id === this.levelData.level) || markers[0];

    // Draw inactive markers
    markers.forEach(m => {
      if (m.id !== activeMarker.id) {
        this.add.circle(m.x, m.y, 4, 0x00ffcc, 0.4);
      }
    });

    // Draw Active Marker
    this.redMarker = this.add.graphics();
    this.redMarker.lineStyle(2, 0xff0033, 0.8);
    this.redMarker.strokeCircle(activeMarker.x, activeMarker.y, 15);
    
    this.add.circle(activeMarker.x, activeMarker.y, 6, 0xff0033, 1);

    // Label
    const labelBox = this.add.graphics();
    labelBox.fillStyle(0x000000, 0.7);
    labelBox.lineStyle(1, 0xff0033, 0.8);
    labelBox.fillRect(activeMarker.x + 20, activeMarker.y - 30, 180, 25);
    labelBox.strokeRect(activeMarker.x + 20, activeMarker.y - 30, 180, 25);

    this.add.text(activeMarker.x + 25, activeMarker.y - 25, activeMarker.name, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ff0033',
      fontStyle: 'bold'
    });

    // Connector Line
    const connector = this.add.graphics();
    connector.lineStyle(1, 0xff0033, 0.8);
    connector.moveTo(activeMarker.x + 10, activeMarker.y - 10);
    connector.lineTo(activeMarker.x + 20, activeMarker.y - 20);
    connector.strokePath();

    // Pulse animation
    this.tweens.add({
      targets: this.redMarker,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1000,
      repeat: -1,
      ease: 'Sine.easeOut'
    });

    // Start zoomed out and fade in
    this.cameras.main.setZoom(0.8);
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Slowly zoom in towards the active marker
    this.cameras.main.pan(activeMarker.x, activeMarker.y, 4000, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1.2, 4000, 'Sine.easeInOut');

    // Click or timeout to proceed
    const proceed = () => {
      this.cameras.main.flash(500, 255, 255, 255); // White flash
      this.time.delayedCall(100, () => {
        this.scene.start('GameScene', { level: this.levelData.level });
      });
    };

    const w = window as any;
    if (!w.__E2E_TEST_MODE__ && !w.__AI_DEMO_MODE__) {
      this.time.delayedCall(4000, proceed);
      this.input.once('pointerdown', proceed);
    } else {
      // Fast forward in E2E
      this.time.delayedCall(500, proceed);
    }
  }
}
