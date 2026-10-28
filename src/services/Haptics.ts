/**
 * Single entry point for vibration feedback. Telegram Mini Apps get the native
 * HapticFeedback API; the Capacitor Android build falls back to the Vibration
 * API (the WebView supports it, no extra plugin needed). Desktop is a no-op.
 */
const VIBRATE_MS = { light: 8, medium: 15, heavy: 30 } as const;

const isNativeApp = (): boolean =>
  !!(window as any).Capacitor?.isNativePlatform?.() && typeof navigator.vibrate === 'function';

export const Haptics = {
  impact(style: 'light' | 'medium' | 'heavy' = 'light') {
    const tg = window.Telegram?.WebApp?.HapticFeedback;
    if (tg) tg.impactOccurred(style);
    else if (isNativeApp()) navigator.vibrate(VIBRATE_MS[style]);
  },

  notify(type: 'error' | 'success' | 'warning') {
    const tg = window.Telegram?.WebApp?.HapticFeedback;
    if (tg) tg.notificationOccurred(type);
    else if (isNativeApp()) navigator.vibrate(type === 'error' ? [30, 40, 30] : 15);
  },
};
