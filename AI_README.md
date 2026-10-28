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
- **`BootScene`**: Loads all pre-baked assets (images, sounds, etc.) and procedural starfields. Auto-starts `MenuScene`.
- **`MenuScene`**: The main menu. Uses `MainMenuUI` for its HTML DOM overlay.
- **`MapScene`**: Campaign map (cleared / current / locked sectors). Waits for the LAUNCH button in the `MapUI` sector card (auto-proceeds in E2E / AI demo).
- **`GameScene`**: The core gameplay loop. Initializes all managers and entities.
- **`GarageScene`**: Serves as the game's "Shop". Uses `GarageUI` for HTML DOM manipulation and draws the ship preview inside the transparent `.garage-stage` window of that layout. Prices live in `GameConfig.Shop`.
- **`ResultScene` / `DefeatScene` / `CreditsScene`**: Phaser-drawn end screens. Use `Button.create()` (Phaser twin of the DOM `.btn-primary`) and `fadeToScene()` from `src/game/utils/transition.ts` for every scene change.

### 2. Entities (`src/game/entities/`)
- **`Player`**: The main ship. Has two forms: standard Fighter and Mecha. Mecha form has different physics and damage output. Also handles the purchasable shield visual logic and temp weapon overrides (Spread, Homing).
- **`Drone`**: Companion entity that follows the player and auto-fires at the nearest enemy.
- **`Boss` & `Enemy`**: Hostile entities. Bosses spawn at specific level phases.
- **`AAGun`**: Friendly anti-aircraft turrets that spawn on Earth backgrounds and shoot upwards.
- **Projectiles**: `Projectile` (player, supports 'plasma', 'ion', 'wave', 'homing' types), `EnemyProjectile`, `AAGunProjectile`.
- **Collectibles**: `AntimatterContainer` (dropped by enemies/bosses), `PowerUp` (health, weapon, spread, or homing).

### 3. Managers (`src/game/managers/` & `src/ui/`)
- **`GameController`**: The central state machine of a game session. Listens to `EventBus` and orchestrates win/loss conditions.
- **`WaveManager`**: Plays the scripted waves of the current stage. Each stage's waves, ground turrets (friendly `AAGun` / hostile `AlienAAGun`) and stadiums live in `src/game/config/WaveConfig.ts`. Levels 5+ are New Game+: `getStage(level)` maps them back onto stages 1-4 and `getHpMultiplier(level)` adds +50% enemy/boss HP per loop.
- **`ScoreManager` & `DamageManager`**: Handle pure business logic for points, antimatter, and HP.
- **`EntityManager`**: Holds Phaser Physics Groups for pooling (projectiles, enemies, drops). *Note: Player projectile pool is set to 150 to support high fire rates.*
- **`EntitySpawner`**: Handles spawning enemies, powerups, and AAGuns based on timers and modifiers.
- **`CollisionManager`**: Defines overlapping logic for all physical objects (bullets vs ships, player vs collectibles). Uses `EventBus` to notify `GameController`.
- **`HUDManager`**: Builds the HTML DOM HUD: HP segments, score, antimatter, pause, MECHA (bottom-left) and SHIELD/BOMB (bottom-right) thumb buttons, boss bar + hazard-stripe warning, damage vignette and first-run hints (`TutorialUI`). Timed abilities report to the HUD via `mecha_started` / `mecha_ended` / `shield_started` events.
- **`LevelManager`**: Handles background scrolling phases and triggers boss spawns.
- **`InputManager`**: Handles pointer movement, double taps, and keyboard shortcuts (e.g., Spacebar for shield).

### 4. Effects (`src/game/effects/`)
- **`burst(scene, x, y, quantity, config)`**: one-shot particle explosion that destroys its emitter once the last particle fades. Phaser keeps exploded emitters in the display list forever, so **always use this helper instead of `scene.add.particles(...).explode()`** for transient effects - otherwise every kill leaks a GameObject. Long-lived emitters (engine exhaust, garage sparks) are still created directly.

### 5. Services & State (`src/services/`)
- **`GameState`**: A Singleton managing **persistent data** saved in `localStorage`:
  - `_antimatter`: Premium currency.
  - `_credits`: Standard currency.
  - `_baseWeaponLevel`: Permanent weapon upgrade level.
  - `_currentHp` / `_maxHp`: Ship health. **Damage persists between runs** - `GameScene` no longer heals to full on start, it only guarantees a minimum of 1 HP so the player can never be stuck. Restoring HP is what the Garage's REPAIR button is for.
  - `_shields`: Inventory of consumable shields.
  - `_bombs`: Inventory of consumable screen-clearing bombs.
  - `_equippedWeapon`: Base weapon class ('plasma', 'ion', 'wave').
  - `_hasDrone`: Boolean flag for the companion drone.
- **`EventBus`**: Phaser Event Emitter used to decouple Collision/Input logic from the GameController (e.g., `enemy_destroyed`, `shield_request`).
- **`StoryManager`**: Handles the narrative briefings via a DOM overlay. Reads data from `src/data/StoryData.ts`. *Note: The story text is rendered programmatically. When generating new story art, do not include text in the images.*
- **`AnalyticsService`**: Mock analytics tracker.
- **`i18n`**: `t(key)` UI strings in RU/EN (auto-detected from Telegram / browser, switchable in Settings, saved as `si_lang`). Story slides carry both languages (`StorySlide.en`), achievements too. **Never hardcode user-facing text** - add a key to both dictionaries.
- **`Haptics`**: `Haptics.impact()` / `Haptics.notify()` - Telegram HapticFeedback, or the Vibration API in the Capacitor app. Use it instead of touching `Telegram.WebApp.HapticFeedback` directly.
- **`AudioManager`**: zzfx SFX, including `playUiClick/Confirm/Deny/Tick` for interface feedback.

### 6. UI Components (`src/ui/`)
- **`UIComponent`**: Base abstract class handling DOM mounting, unmounting, and standard state-based UI updates.
- **`MainMenuUI`, `GarageUI`, `MapUI`**: Concrete implementations that isolate HTML DOM manipulation from Phaser Scenes.

### 7. Visual system
- **Palette**: `StyleConfig.Colors` is the single source; `applyCssTheme()` exposes it to CSS as `--c-*` variables. Semantic colors: antimatter = orange, credits = yellow, HP = green, danger = red.
- **Overlay sizing**: `main.ts` pins `#ui-container` to the canvas bounds and sets `--u` (one game pixel in CSS px). `style.css` sizes everything from `--u` with a type scale `--fs-xs..--fs-l` (never below 10px) and `--tap` (>=44px touch targets). The canvas itself is fitted inside the device / Telegram safe area.

## 🛠️ Testing
- **Unit Tests (`Vitest`)**: Found in `tests/*.test.ts`. Use `npm run test` to run. Mocks `localStorage` via `jsdom`.
- **E2E Tests (`Playwright`)**: Found in `tests/*.spec.ts` (e.g. `playability.spec.ts`). Validates complete gameplay loop with Autopilot. Use `npm run test:e2e`.

## 🛠️ Key Mechanics & Gotchas

1. **Purchasable Shield**:
   - Bought in `GarageScene` for `GameConfig.Shop.ShieldCost` (5) Antimatter.
   - Activated via on-screen button (`HUDManager`) or `Spacebar` (`InputManager`).
   - Grants `GameConfig.Player.ShieldDuration` (15s) of invulnerability. `CollisionManager` checks `!this.player.isShielded()` before applying damage.
2. **HTML UI over Canvas**:
   - `StoryManager` and `HUDManager` use DOM elements absolutely positioned over the Phaser canvas.
   - **CRITICAL**: Any DOM element covering the game canvas *must* call `e.stopPropagation()` and `e.preventDefault()` on `pointerdown` events. Otherwise, the click will "fall through" and trigger invisible Phaser buttons (like the Garage button on the Menu scene).
3. **Weapon Progression**:
   - `baseWeaponLevel` is persistent.
   - During a run, picking up weapon power-ups increases `weaponLevel`.
   - On death (or new game start at level 1), `GameScene` calls `GameState.getInstance().resetWeaponLevel()` to strip temporary buffs.
6. **Mecha Transformation**:
   - Costs `GameConfig.Player.MechaCost` (3) Antimatter, spent through `GameState.spendAntimatter()` so it draws on the same persistent balance the Garage uses. The HUD mirrors that saved balance rather than counting only the current run's pickups.
   - Activated by the MECHA HUD button, double-tapping the screen, right-clicking or `E`.
   - **Shockwave**: Emits `mecha_shockwave` event upon transform to clear nearby projectiles and damage enemies.
   - **Hyper Beam**: Replaces standard base weapon. Projectiles get `piercing = true` and stretch vertically to act as a continuous laser.
   - **Missile Swarm**: `Player.ts` auto-fires 5 homing projectiles every 2 seconds (`fireSwarm`).
   - **Melee Slash**: Proximity detector in `updateMelee` triggers a short-range sword slash if enemies are <150px away.
7. **Combat Logic & Arsenal Strategies**:
   - **Base Weapons (`GameState._equippedWeapon`)**: 
     - **Plasma**: Fast, standard fire rate. 
     - **Ion**: 4x damage, but much slower fire rate (modifier 2.5x slower). Best for Boss encounters.
     - **Wave**: 1.5x damage, green oscillating trajectory.
   - **Super Weapons (Temp PowerUps)**:
     - The `PowerUp` entity has a chance to drop 'spread' or 'homing' items. Picking these up calls `Player.setTempWeapon()` to override the base weapon for 10 seconds.
     - **Spread** calculates a 5-way fan using trigonometry.
     - **Homing** finds the nearest active enemy via `EntityManager` and lerps the projectile's velocity towards it.
   - **Bombs**: Triggered via `EventBus.emit('bomb_request')`. Clears `entityManager.enemyProjectiles` and inflicts 100 damage to all active enemies (instakilling regulars, hurting bosses).
   - **Drones**: Added directly to `GameScene` via `Drone.ts`. They independently `preUpdate` and seek the nearest enemy to fire small plasma shots.

## 🤖 AI Agent Guidelines

### 🛠️ Script Creation & Utility Tools
- **Directory Rule**: ALL utility scripts (like image processors, data parsers, texture bakers) MUST be placed inside the `scripts/` directory. Do not clutter the project root.
- **Baking Textures**: `scripts/bake_textures.cjs` leverages Playwright to extract procedural textures into static PNGs.
- **Optimizing Assets**: `scripts/optimize-assets.cjs` shrinks story art to 960px JPEGs (~130KB each) and keys the stage-4 boss render into `entities/boss_mech.png`. Story images are loaded on demand by the briefing overlay, not preloaded in `BootScene`.

### 🎨 Asset Generation Workflow (Skins, Sprites, Story Art)
**Read `ART_PLAN.md` first.** It holds the art direction (16-bit pixel art for gameplay, anime key visuals for the story), the character bible, the prompt suffixes, the full asset list with final sizes and the acceptance criteria.

1. **Use `generate_image` Tool**: For sprites, *always* append the `SPRITE_STYLE` suffix from `ART_PLAN.md`, which asks for a pure solid white background. The tool often bakes fake transparency checkerboards if you just ask for a "transparent background". Story frames use `STORY_STYLE` (9:16, no text of any kind).
2. **Process the Image** with `scripts/process-art.mjs` (the generated file lands in the `.gemini` artifacts directory):
   - Sprite: `node scripts/process-art.mjs sprite <in> public/sprites/foo.png --size 40x40 [--colors 16]` - keys out the white background (flood fill from the edges, so white details inside survive), trims, downsamples to the exact on-screen size and hardens alpha.
   - Background: `node scripts/process-art.mjs bg <in> public/bg/foo.png --size 270x960 --preview` - reports the top/bottom seam mismatch and writes a stacked preview (do not commit the preview).
   - Story: `node scripts/process-art.mjs story <in> public/story/foo.jpg` - 720x1280 JPEG.
   - The script warns when a file exceeds the size budget.
3. **Final size = on-screen size**: the game canvas is only 270x480 game pixels, so a texture larger than its on-screen size adds nothing. Sprites are drawn at `scale = 1`; the sizes in `ART_PLAN.md` match the current texture x scale, so hitboxes stay the same.
4. **Load It**: In `BootScene.ts`, load the new asset under the texture key the entity already uses and remove the matching entry from `SpriteBaker.Sprites`.
   - **Careful**: `body.setSize()` / `body.setOffset()` are expressed in *texture* pixels and Arcade multiplies them by the sprite scale. If you change a texture's dimensions by a factor `k`, you must also multiply the scale by `1/k` and the body size/offset by `k` - otherwise the hitbox silently changes size.
5. **Track progress** by updating the status column in `ART_PLAN.md`.

### ⚙️ General Best Practices
- **File Edits**: When making edits to complex Phaser configurations or logic, prefer targeted `multi_replace_file_content` to preserve existing behaviors.
- **UI Adjustments**: Remember that Phaser world coordinates and DOM pixel coordinates are separate. `HUDManager` operates in DOM space, while `Button.ts` operates in Canvas space.
