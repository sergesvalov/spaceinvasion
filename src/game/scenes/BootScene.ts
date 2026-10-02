import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Generate placeholder assets here
    const graphics = this.add.graphics();
    
    // Star for background
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 2, 2);
    graphics.generateTexture('star', 2, 2);
    graphics.clear();

    graphics.destroy();

    // Enemy texture is loaded below

    // Enemy Projectile texture (circle)
    const epGraphics = this.add.graphics();
    epGraphics.fillStyle(0xff00ff, 1);
    epGraphics.fillCircle(5, 5, 5);
    epGraphics.generateTexture('enemy-projectile', 10, 10);
    epGraphics.destroy();

    // Boss texture is loaded below

    // Particle texture (square)
    const partGraphics = this.add.graphics();
    partGraphics.fillStyle(0xffffff, 1);
    partGraphics.fillRect(0, 0, 4, 4);
    partGraphics.generateTexture('particle', 4, 4);
    partGraphics.destroy();

    // Cloud particle texture (circle)
    const cloudGraphics = this.add.graphics();
    cloudGraphics.fillStyle(0xffffff, 1);
    cloudGraphics.fillCircle(50, 50, 50);
    cloudGraphics.generateTexture('cloud_particle', 100, 100);
    cloudGraphics.destroy();

    // AA Gun projectile texture
    const aapGraphics = this.add.graphics();
    aapGraphics.fillStyle(0xff8800, 0.4);
    aapGraphics.fillCircle(15, 15, 15);
    aapGraphics.fillStyle(0xff2200, 0.8);
    aapGraphics.fillCircle(15, 15, 10);
    aapGraphics.fillStyle(0xffffaa, 1);
    aapGraphics.fillCircle(15, 15, 5);
    aapGraphics.generateTexture('aagun-projectile', 30, 30);
    aapGraphics.destroy();

    // Load sounds
    this.load.audio('pew', 'pew.wav');
    this.load.audio('explosion', 'explosion.wav');

    // Load ship, enemy, and boss textures
    this.load.image('ship', 'ship.png');
    this.load.image('mecha', 'mecha.png');
    this.load.image('enemy', 'enemy.png');
    this.load.image('boss', 'boss.png');
    this.load.image('antimatter', 'antimatter.png');
    this.load.image('aagun', 'aagun.png');
    this.load.image('powerup_health', 'powerup_health.png');
    this.load.image('powerup_weapon', 'powerup_weapon.png');
    this.load.image('projectile_fighter', 'projectile_fighter.png');
    this.load.image('projectile_mecha', 'projectile_mecha.png');
    
    // Load garage textures
    this.load.image('hangar', 'hangar.png');
    this.load.image('ship_side', 'ship_side.png');

    // Load story textures
    this.load.image('story_1', 'story/story_1.png');
    this.load.image('story_2', 'story/story_2.png');
    this.load.image('story_3', 'story/story_3.png');
    this.load.image('story_4', 'story/story_4.png');
    this.load.image('victory_1', 'story/victory_1.png');
    this.load.image('victory_2', 'story/victory_2.png');
    this.load.image('victory_3', 'story/victory_3.png');

    // Load Earth backgrounds (now generated procedurally)
    // Removed static loads for bg_suburbs and bg_mountains
  }

  create() {
    const { width, height } = this.scale;
    if (!this.textures.exists('starfield')) {
      this.createStarfieldTexture(width, height);
    }
    
    // Generate procedural backgrounds
    if (!this.textures.exists('bg_city')) {
      this.createAnimeCityTexture('bg_city', 800, 1200, 200, [0x2a1b54, 0x1b2854, 0x3d1b54, 0x173a4a], [0x3c2a70, 0x273b70, 0x512a70, 0x225566]);
    }
    if (!this.textures.exists('bg_suburbs')) {
      this.createAnimeCityTexture('bg_suburbs', 800, 1200, 50, [0x1a2b34, 0x1b2824, 0x1d3b24, 0x173a3a], [0x2c3a50, 0x273b40, 0x314a40, 0x225546]);
    }
    if (!this.textures.exists('bg_mountains')) {
      this.createAnimeMountainsTexture('bg_mountains', 800, 1200);
    }
    if (!this.textures.exists('bg_anime_city')) {
      this.createAnimeCityTexture('bg_anime_city', 800, 1200, 200, [0x4a1b34, 0x2b1844, 0x1d1b54, 0x471a4a], [0x5c2a50, 0x372b60, 0x312a70, 0x622546]);
    }

    this.scene.start('MenuScene');
  }

  private createAnimeMountainsTexture(key: string, texWidth: number, texHeight: number) {
    const graphics = this.add.graphics();
    
    // Base ground
    graphics.fillStyle(0x050a14, 1);
    graphics.fillRect(0, 0, texWidth, texHeight);

    // Draw some glowing grid lines (faded)
    graphics.lineStyle(1, 0x00ffcc, 0.1);
    for(let y=0; y<texHeight; y+=200) {
      graphics.moveTo(0, y); graphics.lineTo(texWidth, y);
    }
    for(let x=0; x<texWidth; x+=200) {
      graphics.moveTo(x, 0); graphics.lineTo(x, texHeight);
    }

    // Draw procedural mountains (triangles with neon edges)
    for (let i = 0; i < 40; i++) {
      const mx = Phaser.Math.Between(-100, texWidth + 100);
      const my = Phaser.Math.Between(0, texHeight);
      const mw = Phaser.Math.Between(150, 400);
      const mh = Phaser.Math.Between(100, 300);

      // Dark shadow side
      graphics.fillStyle(0x0a1020, 1);
      graphics.fillTriangle(mx, my, mx + mw/2, my - mh, mx + mw, my);

      // Light side
      graphics.fillStyle(0x102030, 1);
      graphics.fillTriangle(mx, my, mx + mw/2, my - mh, mx + mw/2, my);

      // Neon ridge (cyberpunk touch)
      graphics.lineStyle(2, Phaser.Math.RND.pick([0x00ffff, 0x00ffcc]), 0.4);
      graphics.beginPath();
      graphics.moveTo(mx + mw/2, my - mh);
      graphics.lineTo(mx + mw/2, my + mh/4); // crack going down
      graphics.strokePath();

      // Peak highlight
      graphics.fillStyle(0x00ffcc, 0.3);
      graphics.fillTriangle(mx + mw/2 - 20, my - mh + 40, mx + mw/2, my - mh, mx + mw/2 + 20, my - mh + 40);
    }

    graphics.generateTexture(key, texWidth, texHeight);
    graphics.destroy();
  }

  private createAnimeCityTexture(key: string, texWidth: number, texHeight: number, buildingCount: number, colors: number[], roofColors: number[]) {
    const graphics = this.add.graphics();
    
    // Base ground / roads (dark purple/blue)
    graphics.fillStyle(0x0a0514, 1);
    graphics.fillRect(0, 0, texWidth, texHeight);

    // Draw glowing road lines grid
    graphics.lineStyle(2, 0xff0055, 0.2);
    for(let y=0; y<texHeight; y+=150) {
      graphics.moveTo(0, y); graphics.lineTo(texWidth, y);
    }
    graphics.lineStyle(2, 0x00ffff, 0.2);
    for(let x=0; x<texWidth; x+=150) {
      graphics.moveTo(x, 0); graphics.lineTo(x, texHeight);
    }

    // Generate random buildings
    for (let i = 0; i < buildingCount; i++) {
      const bx = Phaser.Math.Between(-50, texWidth);
      const by = Phaser.Math.Between(-50, texHeight);
      const bw = Phaser.Math.Between(40, 120);
      const bh = Phaser.Math.Between(40, 120);
      const bHeight = Phaser.Math.Between(30, 90); // How tall the building is (Y offset for roof)

      const colIdx = Phaser.Math.Between(0, colors.length - 1);
      
      // Draw shadow
      graphics.fillStyle(0x000000, 0.7);
      graphics.fillRect(bx + bHeight/2, by + bHeight/2, bw, bh);

      // Draw South Wall (Front)
      graphics.fillStyle(colors[colIdx], 1);
      graphics.fillRect(bx, by, bw, bh);

      // Draw East Wall (Side pseudo-3D)
      graphics.fillStyle(0x000000, 0.4);
      graphics.beginPath();
      graphics.moveTo(bx + bw, by + bh);
      graphics.lineTo(bx + bw + bHeight/3, by + bh - bHeight);
      graphics.lineTo(bx + bw + bHeight/3, by - bHeight);
      graphics.lineTo(bx + bw, by);
      graphics.closePath();
      graphics.fillPath();
      
      // Draw South Wall Fake Depth
      graphics.fillStyle(0x000000, 0.2);
      graphics.beginPath();
      graphics.moveTo(bx, by + bh);
      graphics.lineTo(bx + bw, by + bh);
      graphics.lineTo(bx + bw + bHeight/3, by + bh - bHeight);
      graphics.lineTo(bx + bHeight/3, by + bh - bHeight);
      graphics.closePath();
      graphics.fillPath();

      // Draw Roof
      const rx = bx + bHeight/3;
      const ry = by - bHeight;
      graphics.fillStyle(roofColors[colIdx], 1);
      graphics.fillRect(rx, ry, bw, bh);
      
      // Roof border (neon)
      graphics.lineStyle(2, Phaser.Math.RND.pick([0x00ffcc, 0xff00ff, 0x0088ff]), 0.4);
      graphics.strokeRect(rx, ry, bw, bh);
      
      // Draw neon signs/helipads on the roof
      const details = Phaser.Math.Between(0, 3);
      for(let d=0; d<details; d++) {
        graphics.fillStyle(Phaser.Math.RND.pick([0xff00ff, 0x00ffff, 0xffff00]), 0.8);
        const sx = Phaser.Math.Between(10, bw - 20);
        const sy = Phaser.Math.Between(10, bh - 20);
        graphics.fillRect(rx + sx, ry + sy, Phaser.Math.Between(5, 15), Phaser.Math.Between(5, 15));
      }
    }

    graphics.generateTexture(key, texWidth, texHeight);
    graphics.destroy();
  }

  private createStarfieldTexture(width: number, height: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, width, height);
    
    graphics.fillStyle(0xffffff, 0.8);
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(1, 3);
      graphics.fillRect(x, y, size, size);
    }
    graphics.generateTexture('starfield', width, height);
    graphics.destroy();
  }
}
