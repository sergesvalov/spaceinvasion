import Phaser from 'phaser';
import { GameState } from '../../services/GameState';

export class GarageScene extends Phaser.Scene {
  private creditsText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private antimatterText!: Phaser.GameObjects.Text;
  private shieldsText!: Phaser.GameObjects.Text;
  private bombsText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private droneText!: Phaser.GameObjects.Text;
  
  private repairBtnText!: Phaser.GameObjects.Text;
  private buyShieldBtnText!: Phaser.GameObjects.Text;
  private buyBombBtnText!: Phaser.GameObjects.Text;
  private buyDroneBtnText!: Phaser.GameObjects.Text;
  private switchWeaponBtnText!: Phaser.GameObjects.Text;
  
  private sparksEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  
  private REPAIR_COST = 500;
  private SHIELD_COST = 2; // Antimatter
  private BOMB_COST = 1000; // Credits
  private DRONE_COST = 5; // Antimatter

  constructor() {
    super({ key: 'GarageScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.image(width / 2, height / 2, 'hangar');
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);
    // Darken background slightly to make UI pop
    bg.setTint(0x888888);

    // Title
    this.add.text(width / 2, 40, 'GARAGE', {
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Stats
    const statsY = 80;
    const spacing = 30;
    this.antimatterText = this.add.text(width / 2, statsY, '', { fontSize: '20px', color: '#ffaa00' }).setOrigin(0.5);
    this.creditsText = this.add.text(width / 2, statsY + spacing, '', { fontSize: '20px', color: '#ffff00' }).setOrigin(0.5);
    this.hpText = this.add.text(width / 2, statsY + spacing * 2, '', { fontSize: '20px', color: '#ff0044' }).setOrigin(0.5);
    this.shieldsText = this.add.text(width / 2, statsY + spacing * 3, '', { fontSize: '20px', color: '#00ccff' }).setOrigin(0.5);
    this.bombsText = this.add.text(width / 2, statsY + spacing * 4, '', { fontSize: '20px', color: '#ff5500' }).setOrigin(0.5);
    this.weaponText = this.add.text(width / 2, statsY + spacing * 5, '', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    this.droneText = this.add.text(width / 2, statsY + spacing * 6, '', { fontSize: '20px', color: '#aaffaa' }).setOrigin(0.5);

    // Back Button
    const backBtn = this.add.text(width / 2, height - 30, '[ BACK TO MENU ]', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    backBtn.on('pointerover', () => backBtn.setColor('#ffaa00'));
    backBtn.on('pointerout', () => backBtn.setColor('#ffffff'));

    // Buttons Layout
    const btnStartX = width / 2;
    let btnY = height - 340;
    const btnGap = 60;

    const createBtn = (yPos: number, defaultBg: string, hoverBg: string, onClick: () => void) => {
      const btn = this.add.text(btnStartX, yPos, '', {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: defaultBg,
        padding: { x: 15, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', onClick);
      btn.on('pointerover', () => btn.setBackgroundColor(hoverBg));
      btn.on('pointerout', () => btn.setBackgroundColor(defaultBg));
      return btn;
    };

    this.switchWeaponBtnText = createBtn(btnY, '#444444', '#666666', () => this.handleSwitchWeapon());
    btnY += btnGap;
    
    this.buyBombBtnText = createBtn(btnY, '#552200', '#773300', () => this.handleBuyBomb());
    btnY += btnGap;

    this.buyShieldBtnText = createBtn(btnY, '#004466', '#006688', () => this.handleBuyShield());
    btnY += btnGap;

    this.buyDroneBtnText = createBtn(btnY, '#225522', '#337733', () => this.handleBuyDrone());
    btnY += btnGap;

    this.repairBtnText = createBtn(btnY, '#004400', '#006600', () => this.handleRepair());

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

  private handleBuyBomb() {
    const state = GameState.getInstance();
    if (state.credits >= this.BOMB_COST) {
      state.spendCredits(this.BOMB_COST);
      state.addBomb(1);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private handleBuyDrone() {
    const state = GameState.getInstance();
    if (!state.hasDrone && state.antimatter >= this.DRONE_COST) {
      state.spendAntimatter(this.DRONE_COST);
      state.setHasDrone(true);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private handleSwitchWeapon() {
    const state = GameState.getInstance();
    const weapons: Array<'plasma' | 'ion' | 'wave'> = ['plasma', 'ion', 'wave'];
    const currentIndex = weapons.indexOf(state.equippedWeapon);
    const nextIndex = (currentIndex + 1) % weapons.length;
    state.setEquippedWeapon(weapons[nextIndex]);
    this.triggerHaptic('light');
    this.updateUI();
  }

  private triggerHaptic(type: 'light' | 'error') {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'light') {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      } else {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
    }
  }

  private handleBuyShield() {
    const state = GameState.getInstance();
    if (state.antimatter >= this.SHIELD_COST) {
      state.spendAntimatter(this.SHIELD_COST);
      state.addShield(1);
      this.triggerHaptic('light');
      this.updateUI();
    } else {
      this.triggerHaptic('error');
      this.cameras.main.flash(200, 255, 0, 0);
    }
  }

  private updateUI() {
    const state = GameState.getInstance();
    
    this.antimatterText.setText(`ANTIMATTER: ${state.antimatter}`);
    this.creditsText.setText(`CREDITS: ${state.credits}`);
    this.hpText.setText(`SHIP HP: ${state.currentHp} / ${state.maxHp}`);
    this.shieldsText.setText(`SHIELDS: ${state.shields}`);
    this.bombsText.setText(`BOMBS: ${state.bombs}`);
    this.weaponText.setText(`WEAPON: ${state.equippedWeapon.toUpperCase()}`);
    this.droneText.setText(`DRONE: ${state.hasDrone ? 'EQUIPPED' : 'NONE'}`);

    this.switchWeaponBtnText.setText(`SWITCH WEAPON: ${state.equippedWeapon.toUpperCase()}`);
    this.switchWeaponBtnText.setColor('#ffffff');

    this.buyBombBtnText.setText(`BUY BOMB (COST: ${this.BOMB_COST} CR)`);
    this.buyBombBtnText.setColor(state.credits >= this.BOMB_COST ? '#ffaa00' : '#ff0000');
    
    if (state.hasDrone) {
      this.buyDroneBtnText.setText('DRONE EQUIPPED');
      this.buyDroneBtnText.setColor('#888888');
      this.buyDroneBtnText.setBackgroundColor('#222222');
    } else {
      this.buyDroneBtnText.setText(`BUY DRONE (COST: ${this.DRONE_COST} AM)`);
      this.buyDroneBtnText.setColor(state.antimatter >= this.DRONE_COST ? '#aaffaa' : '#ff0000');
      this.buyDroneBtnText.setBackgroundColor('#225522');
    }

    this.buyShieldBtnText.setText(`BUY SHIELD (COST: ${this.SHIELD_COST} AM)`);
    this.buyShieldBtnText.setColor(state.antimatter >= this.SHIELD_COST ? '#00ffff' : '#ff0000');
    this.buyShieldBtnText.setBackgroundColor('#004466');

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
