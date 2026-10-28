import './style.css';
import Phaser from 'phaser';
import { config } from './game/game';
import { AnalyticsService } from './services/AnalyticsService';
import { applyCssTheme } from './game/config/StyleConfig';
import { getLang } from './services/i18n';

applyCssTheme();
document.documentElement.lang = getLang();

// Инициализация сервисов
AnalyticsService.getInstance().sessionStart();

// Инициализация игрового движка
const game = new Phaser.Game(config);
(window as any).__PHASER_GAME__ = game;

/**
 * The DOM overlay (HUD, menus, briefing) must cover exactly the game column,
 * not the whole window - otherwise on desktop the HP bar stretches across the
 * monitor while the game is a 405px strip in the middle. --u is one game pixel
 * in CSS pixels, so overlay sizes stay proportional to the canvas.
 */
const syncUiToCanvas = () => {
  const ui = document.getElementById('ui-container');
  const app = document.getElementById('app');
  if (!ui || !app || !game.canvas) return;
  const c = game.canvas.getBoundingClientRect();
  const a = app.getBoundingClientRect();
  if (c.width === 0) return;
  ui.style.left = `${c.left - a.left}px`;
  ui.style.top = `${c.top - a.top}px`;
  ui.style.width = `${c.width}px`;
  ui.style.height = `${c.height}px`;
  ui.style.setProperty('--u', `${c.width / game.scale.width}px`);
};
const scheduleSync = () => requestAnimationFrame(syncUiToCanvas);
game.events.once(Phaser.Core.Events.READY, scheduleSync);
game.scale.on(Phaser.Scale.Events.RESIZE, scheduleSync);
window.addEventListener('resize', scheduleSync);

// Telegram reports its own safe areas (notch + its header in fullscreen) as CSS
// variables; when they change the game container shrinks, so refit the canvas.
const tg = (window as any).Telegram?.WebApp;
if (tg?.onEvent) {
  for (const evt of ['safeAreaChanged', 'contentSafeAreaChanged', 'fullscreenChanged']) {
    tg.onEvent(evt, () => {
      game.scale.refresh();
      scheduleSync();
    });
  }
}

// Завершение сессии при закрытии вкладки
window.addEventListener('beforeunload', () => {
  AnalyticsService.getInstance().sessionEnd();
});
