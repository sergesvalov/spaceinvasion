import Phaser from 'phaser';
import { GameState } from '../../services/GameState';

export class GarageScene extends Phaser.Scene {
  private creditsText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private repairBtnText!: Phaser.GameObjects.Text;
  private sparksEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  
  private REPAIR_COST = 500;

  constructor() {
    super({ key: 'GarageScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.image(width / 2, height / 2, 'hangar');
    bg.setDisplaySize(width, height);
    // Darken background slightly to make UI pop
    bg.setTint(0x888888);

    // Title
    this.add.text(width / 2, 60, 'GARAGE', {
      fontSize: '56px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Stats
    this.creditsText = this.add.text(width / 2, 120, '', { fontSize: '28px', color: '#ffff00' }).setOrigin(0.5);
    this.hpText = this.add.text(width / 2, 160, '', { fontSize: '28px', color: '#ff0044' }).setOrigin(0.5);

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

    // Repair Button
    this.repairBtnText = this.add.text(width / 2, height - 130, '', {
      fontSize: '26px',
      color: '#00ff00',
      backgroundColor: '#004400',
      padding: { x: 20, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.repairBtnText.on('pointerdown', () => this.handleRepair());
    this.repairBtnText.on('pointerover', () => this.repairBtnText.setBackgroundColor('#006600'));
    this.repairBtnText.on('pointerout', () => this.repairBtnText.setBackgroundColor('#004400'));

    // Sparks Emitter for damage
    this.sparksEmitter = this.add.particles(width / 2, height / 2, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 200, max: 340 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      gravityY: 400,
      lifespan: 800,
      tint: [0xffffff, 0xffff00, 0xff0000],
      frequency: 50
    });

    this.updateUI();
  }

  private handleRepair() {
    const state = GameState.getInstance();
    if (state.currentHp < state.maxHp && state.credits >= this.REPAIR_COST) {
      state.spendCredits(this.REPAIR_COST);
      state.repair(1);
      
      // Haptic
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }

      this.updateUI();
    } else {
      // Error Haptic
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      
      // Flash red if not enough money
      if (state.credits < this.REPAIR_COST) {
        this.cameras.main.flash(200, 255, 0, 0);
      }
    }
  }

  private updateUI() {
    const state = GameState.getInstance();
    
    this.creditsText.setText(`CREDITS: ${state.credits}`);
    this.hpText.setText(`SHIP HP: ${state.currentHp} / ${state.maxHp}`);

    if (state.currentHp >= state.maxHp) {
      this.repairBtnText.setText('FULLY REPAIRED');
      this.repairBtnText.setColor('#888888');
      this.repairBtnText.setBackgroundColor('#222222');
      this.sparksEmitter?.stop();
    } else {
      this.repairBtnText.setText(`REPAIR (COST: ${this.REPAIR_COST})`);
      this.repairBtnText.setColor(state.credits >= this.REPAIR_COST ? '#00ff00' : '#ff0000');
      this.repairBtnText.setBackgroundColor('#004400');
      
      // Start sparks if damaged
      if (!this.sparksEmitter?.on) {
        this.sparksEmitter?.start();
      }
      // more sparks if more damaged
      const damage = state.maxHp - state.currentHp;
      this.sparksEmitter?.setFrequency(150 / damage);
    }
  }
}
