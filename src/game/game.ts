import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { MapScene } from './scenes/MapScene';
import { GameScene } from './scenes/GameScene';
import { GarageScene } from './scenes/GarageScene';
import { DefeatScene } from './scenes/DefeatScene';
import { ResultScene } from './scenes/ResultScene';
import { CreditsScene } from './scenes/CreditsScene';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 270,
  height: 480,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    MenuScene,
    MapScene,
    GameScene,
    GarageScene,
    DefeatScene,
    ResultScene,
    CreditsScene,
  ],
  pixelArt: true,
  roundPixels: true,
};
