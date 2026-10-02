import Phaser from 'phaser';

export class DefeatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DefeatScene' });
  }

  create(data: { score: number, level: number }) {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    this.add.text(width / 2, height / 2 - 100, 'MISSION FAILED', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
      shadow: { color: '#ff0000', blur: 10, fill: true }
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 30, `SCORE: ${data.score}`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, 'HULL INTEGRITY COMPROMISED', {
      fontSize: '18px',
      color: '#ffaa00'
    }).setOrigin(0.5);

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
