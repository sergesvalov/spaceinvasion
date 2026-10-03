import fs from 'fs';
import path from 'path';
import texturePacker from 'free-tex-packer-core';

const publicDir = path.resolve('public');
const imagesToPack = [
  'aagun.png',
  'antimatter.png',
  'boss.png',
  'enemy.png',
  'mecha.png',
  'powerup_health.png',
  'powerup_weapon.png',
  'projectile_fighter.png',
  'projectile_mecha.png',
  'ship.png',
  'ship_side.png'
];

const images = imagesToPack.map(img => {
  return {
    path: img,
    contents: fs.readFileSync(path.join(publicDir, img))
  };
});

texturePacker(images, {
  textureName: 'game_atlas',
  width: 2048,
  height: 2048,
  fixedSize: false,
  padding: 2,
  allowRotation: false,
  detectIdentical: true,
  allowTrim: true,
  exporter: "Phaser3",
  removeFileExtension: true,
  prependFolderName: true
}, (files, error) => {
  if (error) {
    console.error('Error packing textures:', error);
  } else {
    files.forEach(item => {
      const outPath = path.join(publicDir, item.name);
      fs.writeFileSync(outPath, item.buffer);
      console.log('Saved:', outPath);
    });
    console.log('Texture atlas generated successfully!');
  }
});
