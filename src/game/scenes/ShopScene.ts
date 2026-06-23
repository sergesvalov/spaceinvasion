import Phaser from 'phaser';
import { Button } from '../ui/Button';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.tileSprite(width / 2, height / 2, width, height, 'starfield');
    bg.setTint(0x555555);

    // Title
    this.add.text(width / 2, 50, 'SHOP', {
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Buy Shadow Button (Hidden)
    const shadowBtn = Button.create(this, width / 2, height / 2, 'BUY SHADOW', () => {
      console.log('Shadow purchased!');
    }, {
      color: '#ff00ff',
      hoverColor: '#ffaaff',
      backgroundColor: '#440044',
      hoverBackgroundColor: '#660066'
    });
    
    // As requested, make it hidden
    shadowBtn.setVisible(false);

    // Back Button
    const backBtn = this.add.text(width / 2, height - 50, '[ BACK TO MENU ]', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    backBtn.on('pointerover', () => backBtn.setColor('#ffaa00'));
    backBtn.on('pointerout', () => backBtn.setColor('#ffffff'));
  }
}
