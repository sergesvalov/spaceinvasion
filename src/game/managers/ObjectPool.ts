import Phaser from 'phaser';

export class ObjectPool<T extends Phaser.Physics.Arcade.Sprite> {
  private group: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, classType: Function, maxSize: number) {
    this.group = scene.physics.add.group({
      classType,
      maxSize,
      runChildUpdate: true
    });
  }

  public getGroup(): Phaser.Physics.Arcade.Group {
    return this.group;
  }

  public get(): T | null {
    return this.group.get() as T | null;
  }

  public get children() {
    return this.group.children;
  }
}
