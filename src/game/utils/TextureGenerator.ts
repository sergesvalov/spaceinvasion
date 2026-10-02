import Phaser from 'phaser';

export class TextureGenerator {
  public static generateStarfield(scene: Phaser.Scene, width: number, height: number) {
    const graphics = scene.add.graphics();
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

  public static generateAnimeMountains(scene: Phaser.Scene, key: string, texWidth: number, texHeight: number) {
    const graphics = scene.add.graphics();
    
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

  public static generateAnimeCity(scene: Phaser.Scene, key: string, texWidth: number, texHeight: number, buildingCount: number, colors: number[], roofColors: number[]) {
    const graphics = scene.add.graphics();
    
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
}
