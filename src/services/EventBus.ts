import Phaser from 'phaser';

// Глобальная шина событий для отвязки компонентов от сцен
export const EventBus = new Phaser.Events.EventEmitter();
