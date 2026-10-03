import Phaser from 'phaser';

export class TileGenerator {
  public static generateTileset(scene: Phaser.Scene) {
    const size = 32;
    const columns = 8;
    const rows = 4;
    
    const graphics = scene.add.graphics();
    // 256x128 texture
    
    // Helper to draw a pixel on graphics
    const setPixel = (x: number, y: number, color: number, alpha: number = 1) => {
      graphics.fillStyle(color, alpha);
      graphics.fillRect(x, y, 1, 1);
    };

    const drawRect = (tx: number, ty: number, x: number, y: number, w: number, h: number, color: number) => {
      graphics.fillStyle(color, 1);
      graphics.fillRect(tx * size + x, ty * size + y, w, h);
    };

    // --- City Tiles (Daytime Anime) ---
    // Tile 1: Road (Vertical)
    drawRect(1, 0, 0, 0, 32, 32, 0xa0abb8); // Light grey/blue road
    drawRect(1, 0, 14, 0, 4, 32, 0xc2cadd); // Road edges
    
    // Tile 2: Road with white line (Vertical)
    drawRect(2, 0, 0, 0, 32, 32, 0xa0abb8);
    drawRect(2, 0, 15, 0, 2, 32, 0xffffff); // Bright white line
    
    // Tile 3: Building Base (White/Cream)
    drawRect(3, 0, 0, 0, 32, 32, 0xc6d0dc);
    drawRect(3, 0, 2, 2, 28, 28, 0xe0e6ed);
    
    // Tile 4: Building Roof 1 (Bright Anime Blue)
    drawRect(4, 0, 0, 0, 32, 32, 0x489ad8);
    drawRect(4, 0, 2, 2, 28, 28, 0x7ebef0);
    drawRect(4, 0, 6, 6, 20, 20, 0xabdcff);
    drawRect(4, 0, 8, 8, 4, 4, 0xffffff);
    
    // Tile 5: Building Roof 2 (Bright Pink)
    drawRect(5, 0, 0, 0, 32, 32, 0xd8587b);
    drawRect(5, 0, 2, 2, 28, 28, 0xf086a3);
    drawRect(5, 0, 6, 6, 20, 20, 0xffa8bf);
    drawRect(5, 0, 20, 20, 4, 4, 0xffffff);
    
    // Tile 6: Building Roof 3 (Bright Green)
    drawRect(6, 0, 0, 0, 32, 32, 0x58c078);
    drawRect(6, 0, 2, 2, 28, 28, 0x8ae0a3);
    drawRect(6, 0, 6, 6, 20, 20, 0xbaefc9);
    drawRect(6, 0, 20, 8, 4, 4, 0xffffff);

    // --- Mountain / Transition Tiles (Daytime Anime) ---
    // Tile 7: Grass Ground (Bright Anime Green)
    drawRect(7, 0, 0, 0, 32, 32, 0x6ec060);
    for(let i=0; i<20; i++) {
       setPixel(7 * size + Phaser.Math.Between(0,31), Phaser.Math.Between(0,31), 0x98e085);
    }

    // Tile 8 (Index 8): Mountain Base (Grey/Blue Rock)
    drawRect(0, 1, 0, 0, 32, 32, 0x6ec060); // Base grass
    drawRect(0, 1, 4, 4, 24, 28, 0x8e9aa5);
    drawRect(0, 1, 8, 8, 16, 24, 0xb6c3d0);
    
    // Tile 9: Mountain Ridge with white crack
    drawRect(1, 1, 0, 0, 32, 32, 0x8e9aa5);
    drawRect(1, 1, 4, 0, 24, 32, 0xb6c3d0);
    drawRect(1, 1, 8, 0, 16, 32, 0xdde5ee);
    drawRect(1, 1, 14, 0, 2, 32, 0xffffff); // White crack

    // Tile 10: Mountain Peak (Snowy)
    drawRect(2, 1, 0, 0, 32, 32, 0xb6c3d0);
    drawRect(2, 1, 8, 0, 16, 24, 0xdde5ee);
    drawRect(2, 1, 12, 0, 8, 16, 0xeff5fb);
    drawRect(2, 1, 14, 0, 4, 8, 0xffffff); // Snow peak

    // Tile 11: Transition Grass/Road
    drawRect(3, 1, 0, 0, 32, 32, 0x6ec060);
    drawRect(3, 1, 0, 16, 32, 16, 0xa0abb8);
    
    graphics.generateTexture('procedural_tileset', columns * size, rows * size);
    graphics.destroy();
  }
}
