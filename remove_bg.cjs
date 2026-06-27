const Jimp = require('jimp');

const inputPath = "C:\\Users\\t470s\\.gemini\\antigravity-ide\\brain\\1e8c7ca6-a760-4bb4-a23b-6b21deaf7560\\aagun_sprite_1782583316614.png";
const outputPath = "c:\\wndr\\repo\\spaceinvasion\\public\\aagun.png";

async function run() {
  try {
    const image = await Jimp.read(inputPath);
    console.log("Image loaded. Width:", image.bitmap.width, "Height:", image.bitmap.height);

    // Make anything close to white transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      if (r > 240 && g > 240 && b > 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel = 0 (transparent)
      }
    });

    image.autocrop();
    await image.writeAsync(outputPath);
    console.log("Successfully saved transparent image to", outputPath);
  } catch (err) {
    console.error("Error processing image:", err);
    process.exit(1);
  }
}

run();
