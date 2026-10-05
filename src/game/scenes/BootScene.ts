import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator';
import { SpriteBaker } from '../utils/SpriteBaker';

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

    // Load sounds (now using zzfx for sfx, keeping this comment as placeholder for future music)

    // Load main game atlas
    this.load.atlas('game_atlas', 'game_atlas.png', 'game_atlas.json');

    // Load story textures
    this.load.image('story_1', 'story/story_1.jpg');
    this.load.image('story_2', 'story/story_2.jpg');
    this.load.image('story_3', 'story/story_3.jpg');
    this.load.image('story_4', 'story/story_4.jpg');
    this.load.image('victory_1', 'story/victory_1.jpg');
    this.load.image('victory_2', 'story/victory_2.png');
    this.load.image('victory_3', 'story/victory_3.png');
    this.load.image('story_ocean_victory', 'story/story_ocean_victory.jpg');
    this.load.image('story_orbit_chase', 'story/story_orbit_chase.jpg');
    this.load.image('story_station', 'story/story_station.jpg');
    this.load.image('story_victory_mech', 'story/story_victory_mech.jpg');

    // Load Earth backgrounds (now generated procedurally)
    // Removed static loads for bg_suburbs and bg_mountains
    this.load.image('bg_city', 'bg/city.png');
    this.load.image('bg_suburbs', 'bg/suburbs.png');
    this.load.image('bg_mountains', 'bg/mountains.png');
    this.load.image('bg_night_city', 'bg/anime_city.png');
    this.load.image('bg_ocean', 'bg/bg_ocean.png');
    this.load.image('bg_spacestation', 'bg/spacestation.jpg');

    this.load.image('aagun', 'entities/aagun.png');
    this.load.image('ocean_enemy', 'entities/ocean_enemy.png');
    this.load.image('alien_aagun', 'entities/alien_aagun.png');
    this.load.image('boss_mech', 'entities/boss_mech.jpg');

    this.load.image('starfield', 'misc/starfield.png');
    this.load.image('procedural_tileset', 'misc/procedural_tileset.png');
  }

  create() {
    SpriteBaker.bake(this);
    // Procedural generation removed in favor of pre-baked assets

    // Daytime Anime City Colors
    const dayBuildings = [0xe0e6ed, 0xc6d0dc, 0xd0d5da];
    const dayRoofs = [0x489ad8, 0xd8587b, 0x58c078];

    // Legacy backgrounds (keep for MapScene/Garage if needed)
    // We loaded real images in preload, so these won't run.
    if (!this.textures.exists('bg_city')) {
      TextureGenerator.generateAnimeCity(
        this,
        'bg_city',
        800,
        1200,
        200,
        dayBuildings,
        dayRoofs,
        60,
        150,
      );
    }
    if (!this.textures.exists('bg_suburbs')) {
      TextureGenerator.generateAnimeCity(
        this,
        'bg_suburbs',
        800,
        1200,
        100,
        dayBuildings,
        dayRoofs,
        10,
        40,
      );
    }
    if (!this.textures.exists('bg_mountains')) {
      TextureGenerator.generateAnimeMountains(this, 'bg_mountains', 800, 1200);
    }

    // Night Anime City Colors
    const nightBuildings = [0x1a253a, 0x223555, 0x2e4266];
    const nightRoofs = [0x0d1424, 0x15223b, 0x1f2a42];

    if (!this.textures.exists('bg_night_city')) {
      TextureGenerator.generateAnimeCity(
        this,
        'bg_night_city',
        800,
        1200,
        250,
        nightBuildings,
        nightRoofs,
        60,
        200,
        true,
      );
    }

    this.scene.start('MenuScene');
  }
}
