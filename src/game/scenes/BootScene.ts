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

    // Particle texture
    const partGraphics = this.add.graphics();
    partGraphics.fillStyle(0xffcc00, 1);
    partGraphics.fillRect(0, 0, 4, 4);
    partGraphics.generateTexture('particle', 4, 4);
    partGraphics.destroy();
    // Load pew sound
    this.load.audio('pew', 'pew.wav');

    // Load ship, enemy, and boss textures
    this.load.image('ship', 'ship.png');
    this.load.image('enemy', 'enemy.png');
    this.load.image('boss', 'boss.png');
    
    // Load garage textures
    this.load.image('hangar', 'hangar.png');
    this.load.image('ship_side', 'ship_side.png');

    // Load story textures
    this.load.image('story_1', 'story/story_1.png');
    this.load.image('story_2', 'story/story_2.png');
    this.load.image('story_3', 'story/story_3.png');
    this.load.image('story_4', 'story/story_4.png');

    // Load Earth backgrounds
    this.load.image('bg_city', 'bg/city.png');
    this.load.image('bg_suburbs', 'bg/suburbs.png');
  }

  create() {
    const { width, height } = this.scale;
    if (!this.textures.exists('starfield')) {
      this.createStarfieldTexture(width, height);
    }
    
    // Placeholder for mountains
    if (!this.textures.exists('bg_mountains')) {
      const g = this.add.graphics();
      g.fillStyle(0x2d4c1e, 1); // Dark green mountain-like color
      g.fillRect(0, 0, width, height);
      g.generateTexture('bg_mountains', width, height);
      g.destroy();
    }
    
    this.scene.start('MenuScene');
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
