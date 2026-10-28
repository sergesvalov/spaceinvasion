// One-off asset pipeline: shrinks the story art for the briefing overlay and
// turns the stage-4 boss render into a sprite with real transparency.
// Usage: node scripts/optimize-assets.cjs
const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const PUBLIC = path.join(__dirname, '..', 'public');
const STORY_WIDTH = 960;
const JPEG_QUALITY = 80;

// story_1.jpg has a fake "Menu Options Dialogue..." strip baked into its bottom edge.
const CROP_BOTTOM = { 'story_1.jpg': 0.07 };

async function optimizeStory() {
  const dir = path.join(PUBLIC, 'story');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.jpg'))) {
    const full = path.join(dir, file);
    const before = fs.statSync(full).size;
    const img = await Jimp.read(full);
    const crop = CROP_BOTTOM[file];
    if (crop) {
      const h = Math.round(img.bitmap.height * (1 - crop));
      img.crop({ x: 0, y: 0, w: img.bitmap.width, h });
    }
    if (img.bitmap.width > STORY_WIDTH) img.resize({ w: STORY_WIDTH });
    await img.write(full, { quality: JPEG_QUALITY });
    console.log(`${file}: ${(before / 1024) | 0}KB -> ${(fs.statSync(full).size / 1024) | 0}KB`);
  }
}

async function bossMechToSprite() {
  const src = path.join(PUBLIC, 'entities', 'boss_mech.jpg');
  if (!fs.existsSync(src)) return;
  const img = await Jimp.read(src);
  img.resize({ w: 256, h: 256 });
  // Key out the near-black backdrop with a soft edge so JPEG noise doesn't leave a halo.
  const LOW = 18;
  const HIGH = 42;
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (_x, _y, idx) => {
    const d = img.bitmap.data;
    const lum = Math.max(d[idx], d[idx + 1], d[idx + 2]);
    if (lum <= LOW) d[idx + 3] = 0;
    else if (lum < HIGH) d[idx + 3] = Math.round(((lum - LOW) / (HIGH - LOW)) * 255);
  });
  await img.write(path.join(PUBLIC, 'entities', 'boss_mech.png'));
  fs.unlinkSync(src);
  console.log('boss_mech.jpg -> boss_mech.png (256px, alpha)');
}

(async () => {
  await optimizeStory();
  await bossMechToSprite();
})();
