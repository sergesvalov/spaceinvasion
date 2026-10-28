// Post-processing for generated art (see ART_PLAN.md).
//
//   node scripts/process-art.mjs sprite <in> <out.png> --size 40x40 [--colors 16] [--white 235]
//   node scripts/process-art.mjs bg     <in> <out.png|jpg> --size 270x960 [--quality 80] [--preview]
//   node scripts/process-art.mjs story  <in> <out.jpg> [--quality 80]
//
// sprite: keys out the solid white background (flood fill from the edges, so white
//         details inside the sprite survive), trims the margin, box-downsamples to fit
//         the target size, hardens alpha for crisp pixel edges and optionally reduces
//         the palette. The result is centered on a transparent W x H canvas.
// bg:     cover-crops to the target size and reports how well the top and bottom
//         edges match (vertical tiling). --preview also writes the tile stacked twice.
// story:  cover-crops to 9:16 and saves a 720x1280 JPEG.
import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const BUDGET_KB = { sprite: 10, bg: 150, story: 170 };

function parseArgs(argv) {
  const [mode, input, output, ...rest] = argv;
  const opts = {};
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i].replace(/^--/, '');
    const next = rest[i + 1];
    if (next === undefined || next.startsWith('--')) opts[key] = true;
    else opts[key] = rest[++i];
  }
  return { mode, input, output, opts };
}

function parseSize(value, fallback) {
  const m = /^(\d+)x(\d+)$/.exec(value ?? '');
  if (!m) {
    if (fallback) return fallback;
    throw new Error(`--size must look like 40x40, got "${value}"`);
  }
  return { w: Number(m[1]), h: Number(m[2]) };
}

// --- sprite ---------------------------------------------------------------

/** Make near-white pixels connected to the image border transparent. */
function keyOutWhite(img, threshold) {
  const { width: w, height: h, data } = img.bitmap;
  const isWhite = (i) =>
    data[i + 3] > 0 && Math.min(data[i], data[i + 1], data[i + 2]) >= threshold;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    seen[p] = 1;
    // Already-transparent pixels count as background too
    if (data[p * 4 + 3] === 0 || isWhite(p * 4)) stack.push(p);
  };
  for (let x = 0; x < w; x++) (push(x, 0), push(x, h - 1));
  for (let y = 0; y < h; y++) (push(0, y), push(w - 1, y));

  const background = new Uint8Array(w * h);
  while (stack.length) {
    const p = stack.pop();
    background[p] = 1;
    const x = p % w;
    const y = (p - x) / w;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  for (let p = 0; p < w * h; p++) {
    if (background[p]) data[p * 4 + 3] = 0;
  }
  // Soften the light anti-aliased fringe left around the silhouette
  for (let p = 0; p < w * h; p++) {
    if (background[p]) continue;
    const x = p % w;
    const y = (p - x) / w;
    const touchesBg =
      (x > 0 && background[p - 1]) ||
      (x < w - 1 && background[p + 1]) ||
      (y > 0 && background[p - w]) ||
      (y < h - 1 && background[p + w]);
    if (!touchesBg) continue;
    const i = p * 4;
    const minC = Math.min(data[i], data[i + 1], data[i + 2]);
    if (minC > 180) data[i + 3] = Math.round(data[i + 3] * (1 - (minC - 180) / 75));
  }
}

function opaqueBounds(img, minAlpha = 16) {
  const { width: w, height: h, data } = img.bitmap;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] >= minAlpha) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error('Image is empty after removing the background');
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Alpha-weighted box downsample: every target pixel averages the source block
 * it covers. Unlike nearest-neighbour this keeps thin details, unlike bilinear
 * it doesn't blur when the ratio is large (1024 -> 40).
 */
function boxResize(img, tw, th) {
  const { width: sw, height: sh, data: src } = img.bitmap;
  const out = new Jimp({ width: tw, height: th, color: 0x00000000 });
  const dst = out.bitmap.data;
  for (let ty = 0; ty < th; ty++) {
    const sy0 = (ty * sh) / th;
    const sy1 = ((ty + 1) * sh) / th;
    for (let tx = 0; tx < tw; tx++) {
      const sx0 = (tx * sw) / tw;
      const sx1 = ((tx + 1) * sw) / tw;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let area = 0;
      for (let sy = Math.floor(sy0); sy < Math.ceil(sy1); sy++) {
        const wy = Math.min(sy + 1, sy1) - Math.max(sy, sy0);
        for (let sx = Math.floor(sx0); sx < Math.ceil(sx1); sx++) {
          const wx = Math.min(sx + 1, sx1) - Math.max(sx, sx0);
          const wgt = wx * wy;
          const i = (sy * sw + sx) * 4;
          const alpha = src[i + 3] / 255;
          r += src[i] * alpha * wgt;
          g += src[i + 1] * alpha * wgt;
          b += src[i + 2] * alpha * wgt;
          a += alpha * wgt;
          area += wgt;
        }
      }
      const o = (ty * tw + tx) * 4;
      if (a > 0) {
        dst[o] = Math.round(r / a);
        dst[o + 1] = Math.round(g / a);
        dst[o + 2] = Math.round(b / a);
      }
      dst[o + 3] = Math.round((a / area) * 255);
    }
  }
  return out;
}

/** Pixel art has no partial transparency: snap alpha to 0/255. */
function hardenAlpha(img, cutoff = 110) {
  const d = img.bitmap.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= cutoff ? 255 : 0;
}

/** Median-cut palette reduction over the opaque pixels. */
function quantize(img, colors) {
  const d = img.bitmap.data;
  const pixels = [];
  for (let i = 0; i < d.length; i += 4)
    if (d[i + 3] > 0) pixels.push([d[i], d[i + 1], d[i + 2], i]);
  if (pixels.length === 0) return;

  let boxes = [pixels];
  while (boxes.length < colors) {
    // Split the box with the widest channel range
    let best = -1;
    let bestRange = -1;
    let bestCh = 0;
    boxes.forEach((box, bi) => {
      if (box.length < 2) return;
      for (let ch = 0; ch < 3; ch++) {
        let lo = 255;
        let hi = 0;
        for (const p of box) {
          if (p[ch] < lo) lo = p[ch];
          if (p[ch] > hi) hi = p[ch];
        }
        if (hi - lo > bestRange) {
          bestRange = hi - lo;
          best = bi;
          bestCh = ch;
        }
      }
    });
    if (best < 0 || bestRange === 0) break;
    const box = boxes[best].sort((a, b) => a[bestCh] - b[bestCh]);
    const mid = box.length >> 1;
    boxes.splice(best, 1, box.slice(0, mid), box.slice(mid));
  }

  for (const box of boxes) {
    const avg = [0, 1, 2].map((ch) => Math.round(box.reduce((s, p) => s + p[ch], 0) / box.length));
    for (const p of box) {
      d[p[3]] = avg[0];
      d[p[3] + 1] = avg[1];
      d[p[3] + 2] = avg[2];
    }
  }
  return boxes.length;
}

async function processSprite(input, output, opts) {
  const { w, h } = parseSize(opts.size);
  const img = await Jimp.read(input);
  keyOutWhite(img, Number(opts.white ?? 235));

  const bounds = opaqueBounds(img);
  img.crop(bounds);

  const k = Math.min(w / bounds.w, h / bounds.h);
  const fw = Math.max(1, Math.round(bounds.w * k));
  const fh = Math.max(1, Math.round(bounds.h * k));
  const small = boxResize(img, fw, fh);
  hardenAlpha(small);
  let paletteInfo = '';
  if (opts.colors) paletteInfo = `, ${quantize(small, Number(opts.colors))} colors`;

  const canvas = new Jimp({ width: w, height: h, color: 0x00000000 });
  canvas.composite(small, Math.floor((w - fw) / 2), Math.floor((h - fh) / 2));
  await canvas.write(output);
  return `sprite ${w}x${h} (art ${fw}x${fh}${paletteInfo})`;
}

// --- bg / story --------------------------------------------------------------

function edgeMismatch(img) {
  const { width: w, height: h, data } = img.bitmap;
  let diff = 0;
  for (let x = 0; x < w; x++) {
    const top = x * 4;
    const bottom = ((h - 1) * w + x) * 4;
    for (let c = 0; c < 3; c++) diff += Math.abs(data[top + c] - data[bottom + c]);
  }
  return diff / (w * 3);
}

async function processBg(input, output, opts) {
  const { w, h } = parseSize(opts.size, { w: 270, h: 960 });
  const img = await Jimp.read(input);
  img.cover({ w, h });
  await img.write(output, { quality: Number(opts.quality ?? 80) });

  const seam = edgeMismatch(img);
  let note = `bg ${w}x${h}, top/bottom edge mismatch ${seam.toFixed(1)}/255`;
  if (seam > 25) note += ' - WARNING: likely a visible seam when tiled';

  if (opts.preview) {
    const preview = new Jimp({ width: w, height: h * 2, color: 0x000000ff });
    preview.composite(img, 0, 0).composite(img, 0, h);
    const previewPath = output.replace(/\.(png|jpe?g)$/i, '.seam-preview.png');
    await preview.write(previewPath);
    note += `\n  seam preview: ${previewPath} (delete before committing)`;
  }
  return note;
}

async function processStory(input, output, opts) {
  const img = await Jimp.read(input);
  const aspect = img.bitmap.width / img.bitmap.height;
  img.cover({ w: 720, h: 1280 });
  await img.write(output, { quality: Number(opts.quality ?? 80) });
  let note = 'story 720x1280';
  if (Math.abs(aspect - 9 / 16) > 0.1) {
    note += ` - WARNING: source aspect ${aspect.toFixed(2)} is not 9:16, edges were cropped`;
  }
  return note;
}

// --- main ----------------------------------------------------------------------

const HANDLERS = { sprite: processSprite, bg: processBg, story: processStory };

async function main() {
  const { mode, input, output, opts } = parseArgs(process.argv.slice(2));
  const handler = HANDLERS[mode];
  if (!handler || !input || !output) {
    console.error(
      fs
        .readFileSync(new URL(import.meta.url), 'utf8')
        .split('\n')
        .slice(2, 6)
        .join('\n'),
    );
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const note = await handler(input, output, opts);
  const kb = fs.statSync(output).size / 1024;
  const budget = BUDGET_KB[mode];
  console.log(`${output}: ${note}, ${kb.toFixed(1)}KB`);
  if (kb > budget) console.log(`  WARNING: over the ${budget}KB budget from ART_PLAN.md`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
