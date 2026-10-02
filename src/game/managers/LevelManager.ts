import Phaser from 'phaser';

export interface LevelPhase {
  textureKey: string; // We'll interpret this as a biome/theme ('bg_city', 'bg_suburbs', 'bg_mountains')
  duration: number;
  spawnRateModifier: number;
}

export class LevelManager {
  private scene: Phaser.Scene;
  private phases: LevelPhase[];
  private currentPhaseIndex: number = 0;
  private phaseStartTime: number = 0;
  
  private isLevelComplete: boolean = false;
  private onBossPhaseCallback: () => void;
  
  // Tilemap properties
  private map!: Phaser.Tilemaps.Tilemap;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private tileSize = 32;
  private mapCols = 26; // 800 / 32 = 25, +1 buffer
  private mapRows = 40; // 1200 / 32 = 37.5, +2 buffer
  private scrollY = 0;
  private scrollSpeed = 0.5;

  constructor(scene: Phaser.Scene, phases: LevelPhase[], onBossPhase: () => void) {
    this.scene = scene;
    this.phases = phases;
    this.onBossPhaseCallback = onBossPhase;
  }

  public setupBackgrounds() {
    const { width, height } = this.scene.scale;
    
    // Starfield at the very back
    const starBg = this.scene.add.tileSprite(width / 2, height / 2, width, height, 'starfield');
    starBg.setDepth(-200);

    // Create endless tilemap
    const data: number[][] = [];
    for (let y = 0; y < this.mapRows; y++) {
      data.push(this.generateRow('bg_city'));
    }

    this.map = this.scene.make.tilemap({ data, tileWidth: this.tileSize, tileHeight: this.tileSize });
    const tileset = this.map.addTilesetImage('procedural_tileset', 'procedural_tileset');
    if (tileset) {
      this.layer = this.map.createLayer(0, tileset, 0, -this.tileSize)!;
      this.layer.setDepth(-100);
      this.layer.setTint(0xbbbbbb); // Slightly darker
    }
  }

  public startLevel(time: number) {
    this.phaseStartTime = time;
    this.currentPhaseIndex = 0;
    this.isLevelComplete = false;
  }

  public update(time: number, delta: number) {
    // Scroll starfield
    const starBg = this.scene.children.list.find(c => (c as any).texture?.key === 'starfield') as Phaser.GameObjects.TileSprite;
    if (starBg) {
      starBg.tilePositionY -= this.scrollSpeed * 0.5 * delta;
    }

    // Scroll endless tilemap
    if (this.layer) {
      this.scrollY += this.scrollSpeed * delta;
      
      if (this.scrollY >= this.tileSize) {
        this.scrollY -= this.tileSize;
        this.shiftMapDown();
      }
      this.layer.y = -this.tileSize + this.scrollY;
    }

    if (this.isLevelComplete) return;

    const currentPhase = this.phases[this.currentPhaseIndex];
    if (!currentPhase) return;

    const timeInPhase = time - this.phaseStartTime;

    if (timeInPhase > currentPhase.duration) {
      this.currentPhaseIndex++;
      this.phaseStartTime = time;
      
      if (this.currentPhaseIndex >= this.phases.length) {
        this.isLevelComplete = true;
        this.onBossPhaseCallback();
      }
    }
  }
  
  private shiftMapDown() {
    // Determine which biome to generate
    const currentPhase = this.phases[this.currentPhaseIndex];
    let biome = currentPhase ? currentPhase.textureKey : 'bg_city';

    // If we are close to transition (last 3 seconds), we generate transition tiles
    if (currentPhase && this.currentPhaseIndex + 1 < this.phases.length) {
      const timeInPhase = this.scene.time.now - this.phaseStartTime;
      if (timeInPhase > currentPhase.duration - 3000) {
        biome = 'transition';
      }
    }

    const newRow = this.generateRow(biome);

    // Shift data down (bottom-up to avoid overwrite)
    for (let y = this.mapRows - 1; y > 0; y--) {
      for (let x = 0; x < this.mapCols; x++) {
        const tile = this.map.getTileAt(x, y - 1);
        this.map.putTileAt(tile ? tile.index : 0, x, y);
      }
    }

    // Insert new row at the top
    for (let x = 0; x < this.mapCols; x++) {
      this.map.putTileAt(newRow[x], x, 0);
    }
  }

  private generateRow(biome: string): number[] {
    const row: number[] = [];
    
    // Some basic layout logic: road in the center
    const roadCenter = Math.floor(this.mapCols / 2);
    
    for (let x = 0; x < this.mapCols; x++) {
      let tileIndex = 0;

      if (biome === 'bg_city' || biome === 'bg_suburbs') {
        const isRoad = Math.abs(x - roadCenter) < 2;
        if (isRoad) {
          tileIndex = 1; // Dark road
          if (x === roadCenter) tileIndex = 2; // Neon road
        } else {
          // Buildings (chance depending on suburbs vs city)
          const buildingChance = biome === 'bg_city' ? 0.6 : 0.3;
          if (Math.random() < buildingChance) {
            tileIndex = Phaser.Math.Between(4, 6); // Random roof
          } else {
            tileIndex = 3; // Building base/ground
          }
        }
      } else if (biome === 'bg_mountains') {
        // Mountains with peaks and base
        if (Math.random() < 0.2) {
          tileIndex = Phaser.Math.Between(9, 10); // Ridge / Peak
        } else {
          tileIndex = 8; // Mountain Base
        }
      } else if (biome === 'transition') {
        // Mix of ground and mountain base
        if (Math.random() < 0.5) {
          tileIndex = 11; // Transition grass/cyber
        } else {
          tileIndex = 7; // Dirt
        }
      } else {
        tileIndex = 7; // Default dirt
      }

      row.push(tileIndex);
    }

    return row;
  }

  public getCurrentSpawnModifier(): number {
    if (this.isLevelComplete) return 999999;
    const currentPhase = this.phases[this.currentPhaseIndex];
    return currentPhase ? currentPhase.spawnRateModifier : 1;
  }

  public getCurrentPhaseKey(): string | null {
    if (this.isLevelComplete) return null;
    const currentPhase = this.phases[this.currentPhaseIndex];
    return currentPhase ? currentPhase.textureKey : null;
  }
}
