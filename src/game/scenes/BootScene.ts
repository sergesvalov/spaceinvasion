import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator';

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
      TextureGenerator.generateStarfield(this, width, height);
    }
    
    // Generate procedural backgrounds
    if (!this.textures.exists('bg_city')) {
      TextureGenerator.generateAnimeCity(this, 'bg_city', 800, 1200, 200, [0x2a1b54, 0x1b2854, 0x3d1b54, 0x173a4a], [0x3c2a70, 0x273b70, 0x512a70, 0x225566]);
    }
    if (!this.textures.exists('bg_suburbs')) {
      TextureGenerator.generateAnimeCity(this, 'bg_suburbs', 800, 1200, 50, [0x1a2b34, 0x1b2824, 0x1d3b24, 0x173a3a], [0x2c3a50, 0x273b40, 0x314a40, 0x225546]);
    }
    if (!this.textures.exists('bg_mountains')) {
      TextureGenerator.generateAnimeMountains(this, 'bg_mountains', 800, 1200);
    }
    if (!this.textures.exists('bg_anime_city')) {
      TextureGenerator.generateAnimeCity(this, 'bg_anime_city', 800, 1200, 200, [0x4a1b34, 0x2b1844, 0x1d1b54, 0x471a4a], [0x5c2a50, 0x372b60, 0x312a70, 0x622546]);
    }

    this.scene.start('MenuScene');
  }
}
    

