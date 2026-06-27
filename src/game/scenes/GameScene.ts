import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { AnalyticsService } from '../../services/AnalyticsService';
import { GameState } from '../../services/GameState';
import { StoryManager } from '../../services/StoryManager';
import { HUDManager } from '../managers/HUDManager';
import { InputManager } from '../managers/InputManager';
import { CollisionManager } from '../managers/CollisionManager';
import { EntitySpawner } from '../managers/EntitySpawner';
import { LevelManager } from '../managers/LevelManager';
import { EntityManager } from '../managers/EntityManager';
import { GameConfig } from '../config/GameConfig';
import { GameController } from '../managers/GameController';

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

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: { level?: number }) {
    this.currentLevel = data?.level || 1;
  }

  create() {
    AnalyticsService.getInstance().levelStart(`level_${this.currentLevel}`);
    
    GameState.getInstance().setHp(GameState.getInstance().maxHp);

    this.hudManager = new HUDManager();
    this.hudManager.createHUD(GameState.getInstance().currentHp);

    const { width, height } = this.scale;

    this.player = new Player(this, width / 2, height - 100);
    this.entityManager = new EntityManager(this);

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

    const storyId = `level_${this.currentLevel}`;
    StoryManager.getInstance().showBriefing(storyId, () => {
      this.gameController.setIsPlaying(true);
      this.inputManager.isActive = true;
      this.hudManager.show();
      this.levelManager.startLevel(this.time.now);
    });
  }

  update(time: number, delta: number) {
    this.levelManager.update(time, delta);

    if (!this.gameController.getIsPlaying()) return;

    if (this.player.canFire(time)) {
      this.player.fire(this.entityManager);
    }

    if (this.levelManager.getCurrentPhaseKey() === 'bg_city') {
      this.entitySpawner.spawnAAGun(time);
    }

    const modifier = this.levelManager.getCurrentSpawnModifier();
    this.entitySpawner.update(time, this.gameController.getIsPlaying(), modifier);
  }
}
