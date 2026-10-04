declare module 'zzfx' {
  export function zzfx(...parameters: (number | undefined)[]): AudioBufferSourceNode | undefined;
  export const ZZFX: {
    volume: number;
    sampleRate: number;
    audioContext: AudioContext;
    play: (...parameters: (number | undefined)[]) => AudioBufferSourceNode | undefined;
    buildSamples: (...parameters: (number | undefined)[]) => Float32Array;
    getNote: (note?: number, scale?: number, root?: number, octave?: number) => number;
  };
}
