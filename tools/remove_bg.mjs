import { Jimp } from 'jimp';
import fs from 'fs';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node tools/remove_bg.mjs <input_path> <output_path>");
  process.exit(1);
}

const inputPath = args[0];
const outputPath = args[1];

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

async function run() {
  try {
    console.log(`Loading image from: ${inputPath}`);
    const image = await Jimp.read(inputPath);
    console.log(`Image loaded. Width: ${image.bitmap.width}, Height: ${image.bitmap.height}`);

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    let transparentPixels = 0;

    // Make anything close to white transparent
    image.scan(0, 0, width, height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Threshold 240 is very close to white
      if (r > 240 && g > 240 && b > 240) {
        this.bitmap.data[idx + 3] = 0; // Set Alpha to 0
        transparentPixels++;
      }
    });

    console.log(`Made ${transparentPixels} pixels transparent.`);

    await image.write(outputPath);
    console.log(`Successfully saved transparent image to: ${outputPath}`);
  } catch (err) {
    console.error("Error processing image:", err);
    process.exit(1);
  }
}

run();
