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

    // Enemy texture
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillTriangle(20, 40, 0, 0, 40, 0);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // Enemy Projectile texture (circle)
    const epGraphics = this.add.graphics();
    epGraphics.fillStyle(0xff00ff, 1);
    epGraphics.fillCircle(5, 5, 5);
    epGraphics.generateTexture('enemy-projectile', 10, 10);
    epGraphics.destroy();

    // Particle texture
    const partGraphics = this.add.graphics();
    partGraphics.fillStyle(0xffcc00, 1);
    partGraphics.fillRect(0, 0, 4, 4);
    partGraphics.generateTexture('particle', 4, 4);
    partGraphics.destroy();
    // Load pew sound
    this.load.audio('pew', 'pew.wav');

    // Load ship texture
    this.load.image('ship', 'ship.png');
  }

  create() {
    const { width, height } = this.scale;
    if (!this.textures.exists('starfield')) {
      this.createStarfieldTexture(width, height);
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
