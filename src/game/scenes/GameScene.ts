import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { AnalyticsService } from '../../services/AnalyticsService';
import { StoryManager } from '../../services/StoryManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private background!: Phaser.GameObjects.TileSprite;
  private projectiles!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    AnalyticsService.getInstance().levelStart('level_1');
    StoryManager.getInstance().showBriefing('level_1', () => {
      // Logic to start the level
    });

    const { width, height } = this.scale;

    // 1. Background
    // Create a simple starfield texture dynamically if not loaded
    if (!this.textures.exists('starfield')) {
       this.createStarfieldTexture(width, height);
    }
    this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'starfield');

    // 2. Player
    this.player = new Player(this, width / 2, height - 100);

    // 3. Projectiles Group
    this.projectiles = this.physics.add.group({
      classType: Projectile,
      maxSize: 50,
      runChildUpdate: true
    });

    // 4. Input handling
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        // Move player to pointer position with lerp for smoothness
        this.player.x = Phaser.Math.Linear(this.player.x, pointer.x, 0.5);
        this.player.y = Phaser.Math.Linear(this.player.y, pointer.y - 50, 0.5); // offset so finger doesn't cover ship
      }
    });

    // Double tap or secondary pointer to switch forms
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.player.switchForm();
      }
    });

    // Mobile double tap approximation
    let lastTapTime = 0;
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.rightButtonDown()) {
        const currentTime = this.time.now;
        if (currentTime - lastTapTime < 300) {
          this.player.switchForm();
        }
        lastTapTime = currentTime;
        
        // Initial move to pointer on touch start
        this.player.x = pointer.x;
        this.player.y = pointer.y - 50;
      }
    });
  }

  update(time: number, delta: number) {
    // Scroll background
    this.background.tilePositionY -= 0.5 * delta;

    // Auto-fire
    if (this.player.canFire(time)) {
      this.fireProjectile();
    }
  }

  private fireProjectile() {
    const isMecha = this.player.getForm() === 'mecha';
    
    if (isMecha) {
      // Mecha fires slower but maybe two projectiles or spread
      const proj1 = this.projectiles.get(this.player.x - 10, this.player.y) as Projectile;
      const proj2 = this.projectiles.get(this.player.x + 10, this.player.y) as Projectile;
      
      if (proj1) proj1.fire(this.player.x - 10, this.player.y, -400);
      if (proj2) proj2.fire(this.player.x + 10, this.player.y, -400);
    } else {
      // Fighter fires single fast projectile
      const proj = this.projectiles.get(this.player.x, this.player.y - 20) as Projectile;
      if (proj) {
        proj.fire(this.player.x, this.player.y - 20, -600);
      }
    }
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
