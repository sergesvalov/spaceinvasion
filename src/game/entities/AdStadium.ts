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

    // Mowing stripes and centre line so the field reads as a pitch from above
    standsGraphics.fillStyle(0x007a00, 1);
    for (let x = -width / 2 + 20; x < width / 2 - 20; x += 40) {
      standsGraphics.fillRect(x, -height / 2 + 20, 20, height - 40);
    }
    standsGraphics.lineStyle(1, 0xffffff, 0.6);
    standsGraphics.strokeRect(-width / 2 + 28, -height / 2 + 28, width - 56, height - 56);
    standsGraphics.strokeCircle(0, 0, 18);

    this.add(standsGraphics);

    // In-world billboard (was an "AD BANNER [PLACEHOLDER]" debug label)
    const board = scene.add.rectangle(0, 0, 150, 30, 0x000000, 0.85).setStrokeStyle(1, 0xffce00);
    const bannerText = scene.add
      .text(0, 0, 'NEO-TOKYO\nDEFENSE FORCE', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffce00',
        align: 'center',
        lineSpacing: 4,
      })
      .setOrigin(0.5);

    this.add([board, bannerText]);

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
