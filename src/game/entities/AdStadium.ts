import Phaser from 'phaser';

export class AdStadium extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
      body.setAllowGravity(false);
    }

    this.setDepth(-90); // Below flying objects, above city

    const width = scene.scale.width;
    const height = 150; // Stadium height

    const standsGraphics = scene.add.graphics();
    // Stands
    standsGraphics.fillStyle(0x333333, 1);
    standsGraphics.fillRect(-width / 2, -height / 2, width, height);

    // Field
    standsGraphics.fillStyle(0x006600, 1);
    standsGraphics.fillRect(-width / 2 + 20, -height / 2 + 20, width - 40, height - 40);

    this.add(standsGraphics);

    // Banner placeholder (can be swapped)
    // We can use a Text object or an Image. The prompt says "рекламый плакат".
    const bannerText = scene.add
      .text(0, 0, 'AD BANNER\n[ PLACEHOLDER ]', {
        fontSize: '24px',
        color: '#ffff00',
        fontStyle: 'bold',
        align: 'center',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 10 },
      })
      .setOrigin(0.5);

    this.add(bannerText);

    scene.events.on('update', this.onUpdate, this);
    this.on('destroy', () => {
      scene.events.off('update', this.onUpdate, this);
    });
  }

  spawn(x: number, y: number, scrollSpeed: number) {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(scrollSpeed);
    }
  }

  private onUpdate() {
    if (!this.active) return;

    if (this.y > this.scene.scale.height + 200) {
      this.destroy(); // Destroy it when off-screen
    }
  }
}
