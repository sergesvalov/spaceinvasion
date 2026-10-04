const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Starting headless browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to dev server
  console.log('Connecting to dev server...');
  await page.goto('http://localhost:5173');
  
  // Wait for BootScene to finish and __PHASER_GAME__ to be available
  console.log('Waiting for BootScene textures to generate...');
  await page.waitForTimeout(3000); 
  
  const texturesToBake = ['bg_ocean', 'aagun', 'ocean_enemy', 'alien_aagun', 'starfield', 'procedural_tileset'];
  
  for (const key of texturesToBake) {
    try {
      const dataURL = await page.evaluate((k) => {
        const game = window.__PHASER_GAME__;
        if (!game) return 'ERROR: no game';
        const tex = game.textures.get(k);
        if (!tex || tex.key === '__MISSING') return 'ERROR: no tex ' + k;
        
        let src = tex.getSourceImage();
        if (src && src.toDataURL) {
          return src.toDataURL('image/png');
        }
        
        if (tex.frames['__BASE'] && tex.frames['__BASE'].source) {
            const image = tex.frames['__BASE'].source.image;
            if (image && image.toDataURL) return image.toDataURL('image/png');
            if (image) src = image;
        }

        return 'ERROR: no toDataURL on ' + (src ? src.constructor.name : 'null');
      }, key);

      if (dataURL) {
        const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
        let dir = 'public/bg';
        if (['aagun', 'ocean_enemy', 'alien_aagun'].includes(key)) {
          dir = 'public/entities';
        }
        if (['starfield', 'procedural_tileset'].includes(key)) {
          dir = 'public/misc';
        }
        
        fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, `${key}.png`);
        fs.writeFileSync(filePath, base64Data, 'base64');
        console.log(`Successfully baked ${key} to ${filePath}`);
      } else {
        console.warn(`Failed to extract data URL for ${key}`);
      }
    } catch (e) {
      console.error(`Error processing ${key}:`, e);
    }
  }
  
  await browser.close();
  console.log('Texture baking complete!');
})();
