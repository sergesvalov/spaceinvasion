import Phaser from 'phaser';
import { Player } from '../Player';

export class ShieldComponent {
  private purchasedShieldActive: boolean = false;
  private purchasedShieldGraphics!: Phaser.GameObjects.Graphics;

  constructor(private player: Player, private scene: Phaser.Scene) {
    this.purchasedShieldGraphics = scene.add.graphics();
    this.purchasedShieldGraphics.lineStyle(4, 0x0088ff, 0.8);
    this.purchasedShieldGraphics.fillStyle(0x0088ff, 0.2);
    this.purchasedShieldGraphics.strokeCircle(0, 0, 60);
    this.purchasedShieldGraphics.fillCircle(0, 0, 60);
    this.purchasedShieldGraphics.setVisible(false);
    
    // Add to player container
    this.player.add(this.purchasedShieldGraphics);
  }

  public activatePurchasedShield() {
    if (this.purchasedShieldActive) return;
    
    this.purchasedShieldActive = true;
    this.purchasedShieldGraphics.setVisible(true);
    
    this.scene.tweens.add({
      targets: this.purchasedShieldGraphics,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.scene.time.delayedCall(15000, () => {
      this.purchasedShieldActive = false;
      this.scene.tweens.killTweensOf(this.purchasedShieldGraphics);
      this.purchasedShieldGraphics.setVisible(false);
      this.purchasedShieldGraphics.alpha = 1;
    });
  }

  public isShielded(): boolean {
    return this.purchasedShieldActive || this.player.getForm() === 'mecha';
  }
}
