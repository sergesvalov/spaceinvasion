# AI Agent README: Space Invasion 🚀

This document is designed to help any AI agent (or developer) quickly understand the architecture, state, and key conventions of this project.

## 📁 Project Overview
**Space Invasion** is a 2D top-down space shooter built with **Phaser 3**, **TypeScript**, and **Vite**. It is designed to be playable both on Desktop and as a **Telegram Mini App** (supporting mobile touch inputs and haptic feedback).

### Tech Stack
- **Framework:** Phaser 3 (Canvas/WebGL)
- **Language:** TypeScript
- **Bundler:** Vite

## 🏗️ Architecture & Core Components

### 1. Scenes (`src/game/scenes/`)
- **`BootScene`**: Loads all assets (images, sounds, generates missing textures). Auto-starts `MenuScene`.
- **`MenuScene`**: The main menu. Contains buttons for PLAY, GARAGE, SETTINGS, EXIT.
- **`MapScene`**: Shows a tactical map and pans to the current level marker before transitioning to `GameScene`.
- **`GameScene`**: The core gameplay loop. Initializes all managers and entities.
- **`GarageScene`**: Serves as the game's "Shop". Players can spend Credits to repair their ship and spend Antimatter to buy consumable Shields.

### 2. Entities (`src/game/entities/`)
- **`Player`**: The main ship. Has two forms: standard Fighter and Mecha (activated via double tap/right-click). Mecha form has different physics and damage output. Also handles the purchasable shield visual logic.
- **`Boss` & `Enemy`**: Hostile entities. Bosses spawn at specific level phases.
- **`AAGun`**: Friendly anti-aircraft turrets that spawn on Earth backgrounds and shoot upwards.
- **Projectiles**: `Projectile` (player), `EnemyProjectile`, `AAGunProjectile`.
- **Collectibles**: `AntimatterContainer` (dropped by enemies/bosses), `PowerUp` (health or weapon upgrades).

### 3. Managers (`src/game/managers/`)
- **`GameController`**: The central brain of a game session. Listens to `EventBus` and orchestrates score, health, antimatter logic, and win/loss conditions.
- **`EntityManager`**: Holds Phaser Physics Groups for pooling (projectiles, enemies, drops). *Note: Player projectile pool is set to 150 to support high fire rates.*
- **`EntitySpawner`**: Handles spawning enemies, powerups, and AAGuns based on timers and modifiers.
- **`CollisionManager`**: Defines overlapping logic for all physical objects (bullets vs ships, player vs collectibles). Uses `EventBus` to notify `GameController`.
- **`HUDManager`**: Manipulates the HTML DOM overlay for UI (Score, HP bar, Antimatter count, Shield button).
- **`LevelManager`**: Handles background scrolling phases and triggers boss spawns.
- **`InputManager`**: Handles pointer movement, double taps, and keyboard shortcuts (e.g., Spacebar for shield).

### 4. Services & State (`src/services/`)
- **`GameState`**: A Singleton managing **persistent data** saved in `localStorage`:
  - `_antimatter`: Premium currency.
  - `_credits`: Standard currency.
  - `_baseWeaponLevel`: Permanent weapon upgrade level.
  - `_currentHp` / `_maxHp`: Ship health.
  - `_shields`: Inventory of consumable shields.
- **`EventBus`**: Phaser Event Emitter used to decouple Collision/Input logic from the GameController (e.g., `enemy_destroyed`, `shield_request`).
- **`StoryManager`**: Handles the narrative briefings via a DOM overlay. Reads data from `src/data/StoryData.ts`.
- **`AnalyticsService`**: Mock analytics tracker.

## 🛠️ Key Mechanics & Gotchas

1. **Purchasable Shield**:
   - Bought in `GarageScene` for 2 Antimatter.
   - Activated via on-screen button (`HUDManager`) or `Spacebar` (`InputManager`).
   - Grants 15 seconds of invulnerability. `CollisionManager` checks `!this.player.isShielded()` before applying damage.
2. **HTML UI over Canvas**:
   - `StoryManager` and `HUDManager` use DOM elements absolutely positioned over the Phaser canvas.
   - **CRITICAL**: Any DOM element covering the game canvas *must* call `e.stopPropagation()` and `e.preventDefault()` on `pointerdown` events. Otherwise, the click will "fall through" and trigger invisible Phaser buttons (like the Garage button on the Menu scene).
3. **Weapon Progression**:
   - `baseWeaponLevel` is persistent.
   - During a run, picking up weapon power-ups increases `weaponLevel`.
   - On death (or new game start at level 1), `GameScene` calls `GameState.getInstance().resetWeaponLevel()` to strip temporary buffs.
4. **Mecha Transformation**:
   - Costs 5 Antimatter (handled in `GameController.ts`).
   - Activated by double-tapping the screen or right-clicking.

## 🤖 AI Agent Guidelines
- **Asset Generation**: Always ensure sprites have a transparent background (alpha channel), otherwise Phaser renders white/checkerboard boxes. You can use the provided `remove_bg.mjs` Node script via `Jimp` to strip white backgrounds from AI-generated images.
- **File Edits**: When making edits to complex Phaser configurations or logic, prefer targeted `multi_replace_file_content` to preserve existing behaviors.
- **UI Adjustments**: Remember that Phaser world coordinates and DOM pixel coordinates are separate. `HUDManager` operates in DOM space, while `Button.ts` operates in Canvas space.
