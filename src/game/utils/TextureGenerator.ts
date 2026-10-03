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
    
    // Base ground (Forest green)
    graphics.fillStyle(0x6ec060, 1);
    graphics.fillRect(0, 0, texWidth, texHeight);

    // Forest trees (small dark green triangles)
    for(let t=0; t<200; t++) {
       const tx = Phaser.Math.Between(0, texWidth);
       const ty = Phaser.Math.Between(0, texHeight);
       graphics.fillStyle(0x4a9b40, 0.8);
       graphics.fillTriangle(tx, ty, tx + 10, ty - 20, tx + 20, ty);
    }

    // Draw procedural mountains
    for (let i = 0; i < 40; i++) {
      const mx = Phaser.Math.Between(-100, texWidth + 100);
      const my = Phaser.Math.Between(0, texHeight);
      const mw = Phaser.Math.Between(150, 400);
      const mh = Phaser.Math.Between(100, 300);

      // Dark shadow side (Rocky)
      graphics.fillStyle(0x8e9aa5, 1);
      graphics.fillTriangle(mx, my, mx + mw/2, my - mh, mx + mw, my);

      // Light side
      graphics.fillStyle(0xb6c3d0, 1);
      graphics.fillTriangle(mx, my, mx + mw/2, my - mh, mx + mw/2, my);

      // Snow ridge
      graphics.lineStyle(2, 0xffffff, 0.8);
      graphics.beginPath();
      graphics.moveTo(mx + mw/2, my - mh);
      graphics.lineTo(mx + mw/2, my - mh + Phaser.Math.Between(40, 80)); 
      graphics.strokePath();

      // Snow Peak
      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillTriangle(mx + mw/2 - 20, my - mh + 40, mx + mw/2, my - mh, mx + mw/2 + 20, my - mh + 40);
    }

    graphics.generateTexture(key, texWidth, texHeight);
    graphics.destroy();
  }

  public static generateAnimeCity(scene: Phaser.Scene, key: string, texWidth: number, texHeight: number, buildingCount: number, colors: number[], roofColors: number[], minHeight: number = 30, maxHeight: number = 90, isNight: boolean = false) {
    const graphics = scene.add.graphics();
    
    // Base ground / roads
    graphics.fillStyle(isNight ? 0x0a1020 : 0xa0abb8, 1);
    graphics.fillRect(0, 0, texWidth, texHeight);

    // Draw road lines grid
    graphics.lineStyle(2, isNight ? 0x00ffff : 0xffffff, isNight ? 0.3 : 0.5);
    for(let y=0; y<texHeight; y+=150) {
      graphics.moveTo(0, y); graphics.lineTo(texWidth, y);
    }
    for(let x=0; x<texWidth; x+=150) {
      graphics.moveTo(x, 0); graphics.lineTo(x, texHeight);
    }

    // Generate random buildings
    for (let i = 0; i < buildingCount; i++) {
      const bx = Phaser.Math.Between(-50, texWidth);
      const by = Phaser.Math.Between(-50, texHeight);
      const bw = Phaser.Math.Between(40, 120);
      const bh = Phaser.Math.Between(40, 120);
      const bHeight = Phaser.Math.Between(minHeight, maxHeight); // Height driven by parameters

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
      
      // Roof border
      graphics.lineStyle(2, isNight ? Phaser.Math.RND.pick([0x00ffcc, 0xff00ff]) : 0xffffff, 0.6);
      graphics.strokeRect(rx, ry, bw, bh);
      
      // Draw details (neon at night, AC units in daytime)
      const details = Phaser.Math.Between(0, 3);
      for(let d=0; d<details; d++) {
        if (isNight) {
          graphics.fillStyle(Phaser.Math.RND.pick([0xff00ff, 0x00ffff, 0xffff00]), 0.8);
        } else {
          graphics.fillStyle(Phaser.Math.RND.pick([0xffffff, 0xe0e6ed, 0xc6d0dc]), 0.9);
        }
        const sx = Phaser.Math.Between(10, bw - 20);
        const sy = Phaser.Math.Between(10, bh - 20);
        graphics.fillRect(rx + sx, ry + sy, Phaser.Math.Between(8, 16), Phaser.Math.Between(8, 16));
      }
    }

    graphics.generateTexture(key, texWidth, texHeight);
    graphics.destroy();
  }
  public static generateAAGun(scene: Phaser.Scene, key: string) {
    const graphics = scene.add.graphics();
    
    // Hexagonal Base (Mecha style dark grey)
    graphics.fillStyle(0x4a5a75, 1);
    graphics.beginPath();
    graphics.moveTo(32, 4);
    graphics.lineTo(56, 18);
    graphics.lineTo(56, 46);
    graphics.lineTo(32, 60);
    graphics.lineTo(8, 46);
    graphics.lineTo(8, 18);
    graphics.closePath();
    graphics.fillPath();
    graphics.lineStyle(2, 0xc6d0dc, 1);
    graphics.strokePath();

    // Twin Cannons (Gunmetal)
    graphics.fillStyle(0x334455, 1);
    graphics.fillRect(18, 0, 8, 30); // Left barrel
    graphics.fillRect(38, 0, 8, 30); // Right barrel

    // Turret Body (Sleek White with Blue Anime Accents)
    graphics.fillStyle(0xe0e6ed, 1);
    graphics.fillRect(16, 20, 32, 28);
    
    // Turret Details
    graphics.fillStyle(0x489ad8, 1); // Blue stripe
    graphics.fillRect(28, 20, 8, 28);
    
    // Glowing bits (power cores/heatsinks)
    graphics.fillStyle(0x00ffcc, 1);
    graphics.fillRect(20, 24, 4, 8);
    graphics.fillRect(40, 24, 4, 8);

    graphics.generateTexture(key, 64, 64);
    graphics.destroy();
  }

  public static generateAnimeOcean(scene: Phaser.Scene, key: string, texWidth: number, texHeight: number) {
    const graphics = scene.add.graphics();
    
    // Deep blue ocean base
    graphics.fillStyle(0x103050, 1);
    graphics.fillRect(0, 0, texWidth, texHeight);

    // Draw shimmering waves
    for (let i = 0; i < 200; i++) {
      const wx = Phaser.Math.Between(0, texWidth);
      const wy = Phaser.Math.Between(0, texHeight);
      const wl = Phaser.Math.Between(20, 100);
      
      graphics.lineStyle(2, Phaser.Math.RND.pick([0x2a5b82, 0x427fa8, 0x6caabf]), Phaser.Math.FloatBetween(0.3, 0.8));
      graphics.beginPath();
      graphics.moveTo(wx, wy);
      graphics.lineTo(wx + wl / 2, wy - 5);
      graphics.lineTo(wx + wl, wy);
      graphics.strokePath();
    }
    
    // Moonlight/bioluminescent reflection
    for (let i = 0; i < 50; i++) {
      const mx = Phaser.Math.Between(texWidth * 0.3, texWidth * 0.7); // Center reflection
      const my = Phaser.Math.Between(0, texHeight);
      graphics.fillStyle(0x00ffcc, Phaser.Math.FloatBetween(0.1, 0.5));
      graphics.fillCircle(mx, my, Phaser.Math.Between(2, 6));
    }

    graphics.generateTexture(key, texWidth, texHeight);
    graphics.destroy();
  }
  public static generateOceanEnemy(scene: Phaser.Scene, key: string) {
    const graphics = scene.add.graphics();
    
    // Sleek triangular shape, dark aquatic metallic
    graphics.fillStyle(0x1a2b3c, 1);
    graphics.beginPath();
    graphics.moveTo(32, 8);
    graphics.lineTo(56, 48);
    graphics.lineTo(32, 56);
    graphics.lineTo(8, 48);
    graphics.closePath();
    graphics.fillPath();

    // Metallic trim
    graphics.lineStyle(2, 0x4a6b8c, 1);
    graphics.strokePath();

    // Glowing cyan "eye" or core
    graphics.fillStyle(0x00ffcc, 1);
    graphics.fillCircle(32, 24, 6);
    
    // Side glowing stripes
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillRect(20, 36, 4, 12);
    graphics.fillRect(40, 36, 4, 12);

    graphics.generateTexture(key, 64, 64);
    graphics.destroy();
  }
}
