export const StyleConfig = {
  Fonts: {
    Main: '"Press Start 2P", monospace',
    Secondary: '"Press Start 2P", monospace',
  },
  Colors: {
    NeonCyan: '#00c0ff',
    NeonPink: '#ff00ff', // Or replace with something like #d50000
    NeonYellow: '#ffce00',
    NeonRed: '#d50000',
    NeonOrange: '#ff5a00',
    White: '#ffffff',
    Black: '#000000',
    DeepBlue: '#0038ce',
  },
  ColorsHex: {
    NeonCyan: 0x00c0ff,
    NeonPink: 0xd50000,
    NeonYellow: 0xffce00,
    NeonRed: 0xd50000,
    NeonOrange: 0xff5a00,
    White: 0xffffff,
    Black: 0x000000,
    DeepBlue: 0x0038ce,
    TransparentDark: 0x111111,
  },
  Text: {
    Title: {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ffce00',
      shadow: { color: '#000000', blur: 0, fill: true, offsetX: 4, offsetY: 4 },
    },
    Subtitle: {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
      shadow: { color: '#000000', blur: 0, fill: true, offsetX: 2, offsetY: 2 },
    },
    Normal: {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      shadow: { color: '#000000', blur: 0, fill: true, offsetX: 2, offsetY: 2 },
    },
    Warning: {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ff5a00',
      shadow: { color: '#000000', blur: 0, fill: true, offsetX: 2, offsetY: 2 },
    },
    Critical: {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#d50000',
      shadow: { color: '#000000', blur: 0, fill: true, offsetX: 3, offsetY: 3 },
    },
  },
  Button: {
    DefaultColor: '#ffffff',
    HoverColor: '#ffce00',
    DefaultBg: '#0038ce',
    HoverBg: '#ff5a00',
  },
};
