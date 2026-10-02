import Phaser from 'phaser';

export class DefeatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DefeatScene' });
  }

  create(data: { score: number, level: number }) {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x110000, 0.9).setOrigin(0);

    // Glitch Noise
    const noise = this.add.graphics();
    noise.fillStyle(0xffffff, 0.1);
    for (let i = 0; i < 300; i++) {
      noise.fillRect(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.Between(1, 4), 2);
    }
    this.time.addEvent({
      delay: 50,
      repeat: -1,
      callback: () => {
        noise.y = Phaser.Math.Between(-5, 5);
        noise.alpha = Phaser.Math.FloatBetween(0.5, 1);
      }
    });

    this.cameras.main.shake(500, 0.02); // Initial hit shake

    this.add.text(width / 2, height / 2 - 120, 'SYSTEM FAILURE', {
      fontFamily: 'Orbitron',
      fontSize: '52px',
      color: '#ff0000',
      fontStyle: '900',
      shadow: { color: '#ff0000', blur: 20, fill: true }
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 40, `FINAL SCORE: ${data.score}`, {
      fontFamily: 'Orbitron',
      fontSize: '28px',
      color: '#00ffff',
      shadow: { color: '#00ffff', blur: 10, fill: true }
    }).setOrigin(0.5);

    const warn = this.add.text(width / 2, height / 2 + 10, 'CRITICAL: HULL INTEGRITY COMPROMISED', {
      fontFamily: 'Orbitron',
      fontSize: '16px',
      color: '#ffaa00'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: warn,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    const createBtn = (y: number, text: string, color: string, onClick: () => void) => {
      const btn = this.add.text(width / 2, y, text, {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: color,
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', onClick);
      btn.on('pointerover', () => btn.setAlpha(0.8));
      btn.on('pointerout', () => btn.setAlpha(1));
    };

    createBtn(height / 2 + 90, 'RETRY MISSION', '#550000', () => {
      this.scene.start('GameScene', { level: data.level });
    });

    createBtn(height / 2 + 160, 'GO TO GARAGE', '#004466', () => {
      this.scene.start('GarageScene');
    });

    createBtn(height / 2 + 230, 'MAIN MENU', '#444444', () => {
      this.scene.start('MenuScene');
    });
  }
}
