const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const duration = 0.15; // 150ms
const numSamples = Math.floor(sampleRate * duration);
const buffer = Buffer.alloc(44 + numSamples * 2);

// WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + numSamples * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(1, 22); // 1 channel
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34); // 16 bits per sample
buffer.write('data', 36);
buffer.writeUInt32LE(numSamples * 2, 40);

// Generate pew-pew sound
// High frequency rapidly dropping to low frequency
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  
  // Frequency starts at 1200Hz and decays exponentially
  const freq = 1200 * Math.exp(-25 * t);
  
  // Square wave for more retro feel
  const period = 1 / freq;
  const phase = (t % period) / period;
  const waveform = phase < 0.5 ? 1 : -1;
  
  // Volume envelope (quick fade out)
  const envelope = Math.max(0, 1 - (t / duration));
  
  // Max amplitude is 32767 for 16-bit
  const val = waveform * envelope * 20000;
  
  buffer.writeInt16LE(Math.floor(val), 44 + i * 2);
}

const outPath = path.join(__dirname, '..', 'public', 'pew.wav');
fs.writeFileSync(outPath, buffer);
console.log(`Generated ${outPath}`);
