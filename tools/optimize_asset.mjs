import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

function usage() {
  console.error('Usage: node tools/optimize_asset.mjs <input> <output> --size <px> [--quality <1-100>] [--format png|jpeg]');
  console.error('');
  console.error('  --size     Target width/height in pixels. Use the source size to recompress only.');
  console.error('  --quality  JPEG quality, 1-100 (default: 82). Ignored for PNG output.');
  console.error('  --format   Output encoding. Defaults to the output file extension,');
  console.error('             except .png inputs that are secretly JPEG - pass it explicitly.');
  console.error('');
  console.error('Example: node tools/optimize_asset.mjs public/ship.png public/ship.png --size 128 --format png');
  process.exit(1);
}

if (args.length < 2) usage();

const inputPath = args[0];
const outputPath = args[1];

function flag(name) {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
}

const size = parseInt(flag('size'), 10);
const quality = flag('quality') ? parseInt(flag('quality'), 10) : 82;
const format = (flag('format') || path.extname(outputPath).slice(1) || 'png').toLowerCase();

if (!Number.isFinite(size) || size <= 0) {
  console.error('Error: --size must be a positive integer.');
  usage();
}
if (!['png', 'jpeg', 'jpg'].includes(format)) {
  console.error(`Error: unsupported --format "${format}". Use png or jpeg.`);
  process.exit(1);
}
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const mime = format === 'png' ? 'image/png' : 'image/jpeg';

async function run() {
  try {
    const before = fs.statSync(inputPath).size;
    const image = await Jimp.read(inputPath);
    const { width, height } = image.bitmap;

    if (width !== size || height !== size) {
      // Assets in this project are square; keep the aspect ratio anyway.
      const scale = size / Math.max(width, height);
      image.resize({ w: Math.round(width * scale), h: Math.round(height * scale) });
    }

    const buffer = mime === 'image/jpeg'
      ? await image.getBuffer(mime, { quality })
      : await image.getBuffer(mime);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);

    const after = buffer.length;
    const saved = (100 - (after / before) * 100).toFixed(0);
    console.log(
      `${inputPath}: ${width}x${height} -> ${image.bitmap.width}x${image.bitmap.height} ` +
      `(${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB, -${saved}%) [${format}]`
    );
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err.message);
    process.exit(1);
  }
}

run();
