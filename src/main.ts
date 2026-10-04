import './style.css';
import Phaser from 'phaser';
import { config } from './game/game';
import { AnalyticsService } from './services/AnalyticsService';

// Инициализация сервисов
AnalyticsService.getInstance().sessionStart();

// Инициализация игрового движка
const game = new Phaser.Game(config);
(window as any).__PHASER_GAME__ = game;

// Завершение сессии при закрытии вкладки
window.addEventListener('beforeunload', () => {
  AnalyticsService.getInstance().sessionEnd();
});
