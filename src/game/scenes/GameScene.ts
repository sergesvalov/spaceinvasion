import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Drone } from '../entities/Drone';
import { Boss } from '../entities/Boss';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameState } from '../../services/GameState';
import { EventBus } from '../../services/EventBus';

import { HUDManager } from '../managers/HUDManager';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { EntitySpawner } from '../managers/EntitySpawner';
import { LevelManager } from '../managers/LevelManager';
import { EntityManager } from '../managers/EntityManager';
import { GameConfig } from '../config/GameConfig';
import { GameController } from '../managers/GameController';
import { Autopilot } from '../managers/Autopilot';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private boss!: Boss;
  private entityManager!: EntityManager;
  
  private currentLevel: number = 1;
  
  private hudManager!: HUDManager;
  private inputManager!: InputManager;
  private collisionManager!: CollisionManager;
  private entitySpawner!: EntitySpawner;
  private levelManager!: LevelManager;
  private gameController!: GameController;
  private autopilot!: Autopilot;
  private isPaused: boolean = false;
  private visibilityHandler!: () => void;
  private togglePauseHandler!: () => void;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: { level?: number }) {
    this.currentLevel = data?.level || 1;
  }

  create() {
    AnalyticsService.getInstance().levelStart(`level_${this.currentLevel}`);
    const state = GameState.getInstance();
    if (this.currentLevel === 1) {
      state.resetWeaponLevel();
    }
    // Damage carries over between runs so that repairing in the Garage matters.
    // Only guard against starting a run with a destroyed hull.
    if (state.currentHp <= 0) {
      state.setHp(1);
    }

    this.hudManager = new HUDManager();
    this.hudManager.createHUD(state.currentHp);

    const { width, height } = this.scale;

    this.player = new Player(this, width / 2, height - 100);
    this.entityManager = new EntityManager(this);

    if (state.hasDrone) {
      new Drone(this, this.player, this.entityManager);
    }

    this.inputManager = new InputManager(this, this.player);
    this.inputManager.setupInput();

    this.boss = new Boss(this, width / 2, -200, this.entityManager.enemyProjectiles, (x, y) => {
      const enemy = this.entityManager.getEnemy();
      if (enemy) enemy.spawn(x, y);
    });
    this.boss.setActive(false).setVisible(false);

    this.gameController = new GameController(
      this,
      this.player,
      this.boss,
      this.entityManager,
      this.hudManager,
      this.inputManager,
      this.currentLevel
    );

    this.entitySpawner = new EntitySpawner(this, this.entityManager, this.boss);
    
    this.autopilot = new Autopilot(this, this.player, this.entityManager, this.boss);
    const w = window as any;
    if (w.__E2E_TEST_MODE__ || w.__AI_DEMO_MODE__) {
      this.autopilot.enable();
    }

    this.collisionManager = new CollisionManager(
      this,
      this.player,
      this.boss,
      this.entityManager,
      () => this.gameController.getIsPlaying()
    );
    this.collisionManager.setupCollisions();

    this.gameController.setupEvents();

    const levelPhases = (GameConfig.Levels as any)[this.currentLevel] || (GameConfig.Levels as any)[1];

    this.levelManager = new LevelManager(
      this,
      levelPhases,
      () => this.gameController.handleBossPhase(width)
    );
    this.levelManager.setupBackgrounds();

    // Speed lines effect
    this.add.particles(0, 0, 'star', {
      x: { min: 0, max: width },
      y: 0,
      lifespan: 1500,
      speedY: { min: 300, max: 600 },
      scaleY: { min: 5, max: 15 },
      scaleX: 1,
      alpha: { start: 0.3, end: 0 },
      quantity: 2,
      blendMode: 'ADD'
    });

    this.gameController.setIsPlaying(true);
    this.inputManager.isActive = true;
    this.hudManager.show();
    this.levelManager.startLevel(this.time.now);

    // Apply PostFX to the camera for sci-fi look
    try {
      this.cameras.main.postFX.addVignette(0.5, 0.5, 0.7);
      this.cameras.main.postFX.addBloom(0xffffff, 1, 1, 0.6, 1.2);
    } catch (e) {
      console.warn("PostFX not supported on this device/browser");
    }

    this.togglePauseHandler = () => this.togglePause();
    EventBus.on('toggle_pause', this.togglePauseHandler);

    this.visibilityHandler = () => {
      if (document.hidden && !this.isPaused && this.gameController.getIsPlaying()) {
        this.togglePause();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    this.events.once('shutdown', () => {
      EventBus.off('toggle_pause', this.togglePauseHandler);
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    });
  }

  private togglePause() {
    if (!this.gameController.getIsPlaying()) return; // Don't pause on game over

    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.scene.pause();
      this.hudManager.showPauseOverlay();
    } else {
      this.scene.resume();
      this.hudManager.hidePauseOverlay();
    }
  }

  update(time: number, delta: number) {
    this.levelManager.update(time, delta);
    this.autopilot.update(time, delta);

    if (!this.gameController.getIsPlaying()) return;

    if (this.player.canFire(time)) {
      this.player.fire(this.entityManager);
    }
    
    if (this.player.canFireSwarm(time)) {
      this.player.fireSwarm(this.entityManager);
    }
    
    this.player.updateMelee(this.entityManager, time);
    this.gameController.updateBossHUD();

    const currentPhase = this.levelManager.getCurrentPhaseKey();
    if (currentPhase === 'bg_city' || currentPhase === 'bg_suburbs') {
      this.entitySpawner.spawnAAGun(time);
    }

    const baseModifier = this.levelManager.getCurrentSpawnModifier();
    // Decrease modifier (increase spawn rate) by 5% per 1000 points, capped at 0.3 (30% of original time)
    const scoreModifier = Math.max(0.3, 1 - Math.floor(this.gameController.getScore() / 1000) * 0.05);
    const ddaModifier = this.gameController.getDDAModifier(time);
    
    const finalModifier = baseModifier * scoreModifier * ddaModifier;

    this.entitySpawner.update(time, this.gameController.getIsPlaying(), finalModifier);
  }
}
