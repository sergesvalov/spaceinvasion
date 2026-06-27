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

### 🛠️ Script Creation & Utility Tools
- **Directory Rule**: ALL utility scripts (like image processors, data parsers, test helpers) MUST be created inside the `tools/` directory. Do not clutter the project root.
- **Rules & Usage**: Please refer to [tools/README.md](file:///c:/wndr/repo/spaceinvasion/tools/README.md) for strict guidelines on how to write, structure, and use utility scripts in this project.

### 🎨 Asset Generation Workflow (Skins & Sprites)
When the user asks to create a new skin, enemy, weapon, or other sprite, follow this exact workflow:
1. **Use `generate_image` Tool**: When prompting the image generation tool, *always* append instructions for a solid white background (e.g., `"The background must be pure solid white, NO checkerboard patterns, NO grids, completely solid white background."`). The tool often bakes fake transparency checkerboards if you just ask for a "transparent background".
2. **Process the Image**: Once generated, the image will be in the `.gemini` artifacts directory. Use the included `c:\wndr\repo\spaceinvasion\tools\remove_bg.mjs` Node script to strip the white background and save it to the `public/` directory. 
   - Run: `node tools/remove_bg.mjs <input_path_from_artifact> <output_path_in_public>`
   - This script uses `Jimp` to identify white pixels and make them transparent.
3. **Load and Scale**: In `BootScene.ts`, load the new asset. In the respective entity class (e.g., `Player.ts`), apply `.setScale()` as AI-generated images are typically 1024x1024 and need to be scaled down significantly (e.g., `0.0686` or `0.132`).

### ⚙️ General Best Practices
- **File Edits**: When making edits to complex Phaser configurations or logic, prefer targeted `multi_replace_file_content` to preserve existing behaviors.
- **UI Adjustments**: Remember that Phaser world coordinates and DOM pixel coordinates are separate. `HUDManager` operates in DOM space, while `Button.ts` operates in Canvas space.
