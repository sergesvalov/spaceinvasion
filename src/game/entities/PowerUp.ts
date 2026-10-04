import Phaser from 'phaser';

export type PowerUpType = 'health' | 'weapon' | 'spread' | 'homing';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  public type: PowerUpType;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    const textureKey = type === 'health' ? 'powerup_health' : 'powerup_weapon';
    super(scene, x, y, textureKey);
    this.type = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.label = scene.add
      .text(x, y - 20, '', {
        fontSize: '10px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.setScale(1);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocityY(200); // Faster falling down
    }
  }

  spawn(x: number, y: number, type: PowerUpType) {
    this.type = type;
    this.setTexture(type === 'health' ? 'powerup_health' : 'powerup_weapon');

    this.clearTint();
    let textStr = '';

    if (type === 'health') {
      textStr = '+ HP';
      this.label.setColor('#00ff00');
    } else if (type === 'weapon') {
      textStr = 'W UP';
      this.label.setColor('#ffff00');
    } else if (type === 'spread') {
      this.setTint(0xffaa00);
      textStr = 'SPREAD';
      this.label.setColor('#ffaa00');
    } else if (type === 'homing') {
      this.setTint(0x00aaff);
      textStr = 'HOMING';
      this.label.setColor('#00aaff');
    }

    this.label.setText(textStr);
    this.setPosition(x, y);
    this.label.setPosition(x, y - 20);

    this.setActive(true);
    this.setVisible(true);
    this.label.setActive(true);
    this.label.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.reset(x, y);
      body.setVelocityY(200);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.active && this.label) {
      this.label.setPosition(this.x, this.y - 20);
    }

    if (this.y > this.scene.scale.height + 50) {
      this.hide();
    }
  }

  // Need to handle when it's collected too
  setActive(value: boolean): this {
    super.setActive(value);
    if (!value && this.label) {
      this.label.setActive(false);
      this.label.setVisible(false);
    }
    return this;
  }

  setVisible(value: boolean): this {
    super.setVisible(value);
    if (!value && this.label) {
      this.label.setVisible(false);
    }
    return this;
  }

  public hide() {
    this.setActive(false);
    this.setVisible(false);
  }
}
