export const StyleConfig = {
  Fonts: {
    Main: 'Orbitron',
    Secondary: 'monospace'
  },
  Colors: {
    NeonCyan: '#00ffcc',
    NeonPink: '#ff00ff',
    NeonYellow: '#ffff00',
    NeonRed: '#ff0033',
    NeonOrange: '#ffaa00',
    White: '#ffffff',
    Black: '#000000',
    DeepBlue: '#004488'
  },
  ColorsHex: {
    NeonCyan: 0x00ffcc,
    NeonPink: 0xff00ff,
    NeonYellow: 0xffff00,
    NeonRed: 0xff0033,
    NeonOrange: 0xffaa00,
    White: 0xffffff,
    Black: 0x000000,
    DeepBlue: 0x004488,
    TransparentDark: 0x110000
  },
  Text: {
    Title: {
      fontFamily: 'Orbitron',
      fontSize: '48px',
      color: '#00ffcc',
      fontStyle: '900',
      shadow: { color: '#00ffcc', blur: 10, fill: true }
    },
    Subtitle: {
      fontFamily: 'Orbitron',
      fontSize: '28px',
      color: '#ffffff',
      shadow: { color: '#ffffff', blur: 5, fill: true }
    },
    Normal: {
      fontFamily: 'Orbitron',
      fontSize: '18px',
      color: '#ffffff'
    },
    Warning: {
      fontFamily: 'Orbitron',
      fontSize: '18px',
      color: '#ffaa00',
      fontStyle: 'bold'
    },
    Critical: {
      fontFamily: 'Orbitron',
      fontSize: '24px',
      color: '#ff0033',
      fontStyle: '900',
      shadow: { color: '#ff0033', blur: 15, fill: true }
    }
  },
  Button: {
    DefaultColor: '#00ffcc',
    HoverColor: '#ffffff',
    DefaultBg: 'rgba(0, 50, 100, 0.4)',
    HoverBg: 'rgba(0, 150, 255, 0.6)'
  }
};
