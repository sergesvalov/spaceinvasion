import './style.css';
import Phaser from 'phaser';
import { config } from './game/game';
import { AnalyticsService } from './services/AnalyticsService';

// Инициализация сервисов
AnalyticsService.getInstance().sessionStart();

// Инициализация игрового движка
new Phaser.Game(config);

// Завершение сессии при закрытии вкладки
window.addEventListener('beforeunload', () => {
  AnalyticsService.getInstance().sessionEnd();
});
