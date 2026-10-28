// Single source of truth for the palette. The DOM layer gets the same values as
// CSS custom properties (see applyCssTheme), so Phaser text and HTML overlays
// can never drift apart again.
const Colors = {
  NeonCyan: '#00c0ff',
  NeonPink: '#ff00ff',
  NeonYellow: '#ffce00',
  NeonRed: '#d50000',
  NeonOrange: '#ff5a00',
  NeonGreen: '#00e436',
  White: '#ffffff',
  Black: '#000000',
  DeepBlue: '#0038ce',
  Dim: '#777777',

  // Semantic roles - always use these for currencies and status
  Antimatter: '#ff5a00',
  Credits: '#ffce00',
  Hp: '#00e436',
  Danger: '#d50000',
  Shield: '#00c0ff',
};

type ColorName = keyof typeof Colors;

const toHex = (css: string) => parseInt(css.slice(1), 16);

const ColorsHex = {
  ...(Object.fromEntries(Object.entries(Colors).map(([k, v]) => [k, toHex(v)])) as Record<
    ColorName,
    number
  >),
  TransparentDark: 0x111111,
};

const FONT = '"Press Start 2P", monospace';
const hardShadow = (offset: number) => ({
  color: Colors.Black,
  blur: 0,
  fill: true,
  offsetX: offset,
  offsetY: offset,
});

export const StyleConfig = {
  Fonts: {
    Main: FONT,
    Secondary: FONT,
  },
  Colors,
  ColorsHex,
  Text: {
    Title: { fontFamily: FONT, fontSize: '24px', color: Colors.NeonYellow, shadow: hardShadow(4) },
    Subtitle: { fontFamily: FONT, fontSize: '16px', color: Colors.White, shadow: hardShadow(2) },
    Normal: { fontFamily: FONT, fontSize: '8px', color: Colors.White, shadow: hardShadow(1) },
    Warning: { fontFamily: FONT, fontSize: '8px', color: Colors.NeonOrange, shadow: hardShadow(1) },
    Critical: { fontFamily: FONT, fontSize: '16px', color: Colors.NeonRed, shadow: hardShadow(2) },
  },
  Button: {
    TextColor: Colors.White,
    Bg: Colors.Black,
    Border: Colors.White,
    Shadow: Colors.DeepBlue,
    PrimaryText: Colors.Black,
    PrimaryBg: Colors.NeonYellow,
    PrimaryShadow: Colors.NeonOrange,
  },
  /** Fade time for every scene change, so transitions feel like one system. */
  TransitionMs: 250,
};

/** Expose the palette to CSS as --c-<kebab-name> variables. */
export function applyCssTheme(root: HTMLElement = document.documentElement) {
  for (const [name, value] of Object.entries(Colors)) {
    const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    root.style.setProperty(`--c-${kebab}`, value);
  }
}
