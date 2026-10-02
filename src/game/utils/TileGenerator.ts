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

    // --- City Tiles ---
    // Tile 1: Road Dark (Vertical)
    drawRect(1, 0, 0, 0, 32, 32, 0x111116);
    drawRect(1, 0, 14, 0, 4, 32, 0x222233);
    
    // Tile 2: Road with neon line (Vertical)
    drawRect(2, 0, 0, 0, 32, 32, 0x111116);
    drawRect(2, 0, 15, 0, 2, 32, 0x00ffff);
    
    // Tile 3: Building Base (Dark)
    drawRect(3, 0, 0, 0, 32, 32, 0x0a0a10);
    drawRect(3, 0, 2, 2, 28, 28, 0x1a1a24);
    
    // Tile 4: Building Roof 1 (Purple)
    drawRect(4, 0, 0, 0, 32, 32, 0x2a1b54);
    drawRect(4, 0, 2, 2, 28, 28, 0x3c2a70);
    drawRect(4, 0, 6, 6, 20, 20, 0x4d3982);
    drawRect(4, 0, 8, 8, 4, 4, 0xff00ff); // Neon accent

    // Tile 5: Building Roof 2 (Cyan)
    drawRect(5, 0, 0, 0, 32, 32, 0x173a4a);
    drawRect(5, 0, 2, 2, 28, 28, 0x225566);
    drawRect(5, 0, 6, 6, 20, 20, 0x2a6b7d);
    drawRect(5, 0, 20, 20, 4, 4, 0x00ffcc); // Neon accent

    // Tile 6: Building Roof 3 (Dark Blue)
    drawRect(6, 0, 0, 0, 32, 32, 0x0f1c3f);
    drawRect(6, 0, 2, 2, 28, 28, 0x152852);
    drawRect(6, 0, 6, 6, 20, 20, 0x1c3463);
    drawRect(6, 0, 20, 8, 4, 4, 0x00ffff); // Neon accent

    // --- Mountain / Transition Tiles ---
    // Tile 7: Dirt/Base Ground
    drawRect(7, 0, 0, 0, 32, 32, 0x050a14);
    for(let i=0; i<20; i++) {
       setPixel(7 * size + Phaser.Math.Between(0,31), Phaser.Math.Between(0,31), 0x081020);
    }

    // Tile 8 (Index 8): Mountain Base (Dark)
    drawRect(0, 1, 0, 0, 32, 32, 0x050a14);
    drawRect(0, 1, 4, 4, 24, 28, 0x0a1020);
    drawRect(0, 1, 8, 8, 16, 24, 0x102030);
    
    // Tile 9: Mountain Ridge with cyan neon crack
    drawRect(1, 1, 0, 0, 32, 32, 0x0a1020);
    drawRect(1, 1, 4, 0, 24, 32, 0x102030);
    drawRect(1, 1, 8, 0, 16, 32, 0x182840);
    drawRect(1, 1, 14, 0, 2, 32, 0x00ffcc); // Neon crack

    // Tile 10: Mountain Peak
    drawRect(2, 1, 0, 0, 32, 32, 0x102030);
    drawRect(2, 1, 8, 0, 16, 24, 0x182840);
    drawRect(2, 1, 12, 0, 8, 16, 0x203550);
    drawRect(2, 1, 14, 0, 4, 8, 0x00ffcc); // Glowing peak

    // Tile 11: Transition Grass/Cyber Ground
    drawRect(3, 1, 0, 0, 32, 32, 0x050a14);
    drawRect(3, 1, 0, 16, 32, 16, 0x0a1020);
    
    graphics.generateTexture('procedural_tileset', columns * size, rows * size);
    graphics.destroy();
  }
}
