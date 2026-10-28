# 🎨 План генерации арта (Space Invasion)

Документ для агента с инструментом `generate_image` (Gemini / Antigravity) и для ревью результата.
Цель: убрать разнобой стилей, который нашёл дизайн-аудит, и привести игру к **двум чётким слоям**:

| Слой | Стиль | Что входит |
| --- | --- | --- |
| **Геймплей** | 16-bit пиксель-арт, вид сверху | корабли, враги, боссы, турели, подбираемые предметы, фоны уровней, ангар |
| **Сюжет** | аниме key visual, cel shading, **портрет 9:16** | все кадры брифингов в `public/story/` |

Что сейчас не так (почему это делаем):
- Игровые спрайты — крошечные NES-картинки 16–36px, нарисованные кодом в `SpriteBaker.ts`. Фоны и босс-мех рядом с ними — детальный пиксель. На одном экране два разных разрешения пикселя.
- `public/game_atlas.png` (детальные корабли, босс, паверапы) **загружается, но нигде не используется**.
- Сюжетные кадры в 16:9, а показываются на портретном экране: края обрезаются. Часть кадров квадратные и в пиксель-стиле. `victory_2.png` показывает Нью-Йорк вместо Нео-Токио.
- В `story_1`, `story_ocean_victory`, `story_orbit_chase` и `story_station` нейросеть впекла текст и фальшивые диалоговые окна.
- Персонажи в каждом кадре разные.

---

## 1. Библия стиля

### 1.1 Палитра (из `StyleConfig.ts`)
| Роль | Цвет |
| --- | --- |
| Земля: корпус | белый, светло-серая сталь |
| Земля: акцент | глубокий синий `#0038ce`, жёлтый `#ffce00` |
| Земля: двигатели, щиты | циан `#00c0ff` |
| Пришельцы: корпус | почти чёрный фиолетовый `#1a0f24`–`#3a1f4a` |
| Пришельцы: свечение | маджента `#ff00ff`, кислотно-зелёный `#7dff3a` |
| Пришельцы: оружейные порты | оранжевый `#ff5a00` |
| Антиматерия | оранжевое ядро в синем кристалле (как `antimatter.png`) |

**Правило читаемости:** враги должны быть самыми контрастными объектами на тёмном фоне (маджента/зелёное свечение), свои — холодные и приглушённые. Сейчас наоборот.

### 1.2 Опорные изображения
Если `generate_image` принимает референсы — прикладывать их; если нет — описание ниже уже их отражает.
- Корабль/мех игрока: `public/mecha.png` (бело-сине-золотой мех с циановыми двигателями).
- Пришельцы: `public/entities/boss_mech.png` и враги из `public/game_atlas.png` (тёмный биомеханический корпус, светящиеся прожилки).

### 1.3 Персонажи сюжета (одни и те же во всех кадрах)
- **Капитан Элара Вэнс** — пилот «Трансформера», главная героиня. Молодая женщина, тёмно-синее каре до подбородка, синие глаза, бело-синий лётный комбинезон с жёлтой окантовкой, нашивка базы «Омега».
- **Главный инженер Кэндзи Мори** — мужчина ~35 лет, короткие каштановые волосы, оливковая техническая куртка, планшет в руках.
- **«Трансформер»** — бело-синий истребитель с треугольными крыльями, жёлтая окантовка, циановое свечение двигателей. В боевом режиме — мех из `mecha.png`.
- **Армада** — биомеханические корабли, корпус почти чёрный фиолетовый, светящиеся маджента- и зелёные прожилки, шипастые силуэты. **Хранитель** — босс из `boss_mech.png`.

### 1.4 Общие суффиксы промптов
Дописывать в конец каждого промпта своего слоя.

**SPRITE_STYLE**
```
16-bit pixel art game sprite, top-down view, crisp hard pixel edges, no anti-aliasing,
limited palette (max 16 colors), 1px dark outline, bold readable silhouette at very small
size, single object centered with empty margin, no text, no letters, no ground shadow.
The background must be pure solid white #FFFFFF, NO checkerboard pattern, NO grid,
NO gradient, completely solid white background.
```

**BG_STYLE**
```
16-bit pixel art, top-down orthographic view straight down, vertical scrolling shooter
background, seamless tileable vertically (top edge continues the bottom edge), muted
desaturated colors and low contrast so ships and bullets on top stay readable,
no text, no letters, no vehicles in the center lane.
```

**STORY_STYLE**
```
anime key visual illustration, 90s sci-fi mecha anime style, clean line art, cel shading,
cinematic lighting, vertical 9:16 portrait composition. Main subject in the upper 55% of
the frame; the lower 40% is darker and low-detail because a text panel is overlaid there.
Absolutely no text, no letters, no subtitles, no UI, no dialogue boxes, no speech bubbles,
no logos, no watermark.
```

---

## 2. Технические требования

**Важно:** canvas игры — **270×480 игровых пикселей**, на экране он только масштабируется. Спрайт крупнее, чем его размер на экране в игровых пикселях, ничего не даёт. Поэтому **финальный размер текстуры = размер на экране, рисуем со `scale = 1`**. Размеры ниже совпадают с текущими (текстура × scale), поэтому хитбоксы не меняются.

| Тип | Генерация | Финал | Формат |
| --- | --- | --- | --- |
| Спрайт | 1:1, на белом фоне | точный размер из таблицы, nearest-neighbor, обрезать поля | PNG с альфой |
| Фон уровня | 9:16 | 270×480 (или 270×960 для длинного тайла), бесшовный по вертикали | PNG, если ≤150 КБ, иначе JPEG q80 |
| Сюжетный кадр | 9:16 | 720×1280 | JPEG q80, ~120–160 КБ |

Пайплайн обработки (шаг 0 ниже): `generate_image` → `scripts/process-art.mjs` → `public/...`.

---

## 3. Список ассетов

Статус: ⬜ не начато · 🟨 сгенерировано, на ревью · ✅ в игре

### Пакет A — игровые спрайты (наибольший эффект на геймплей)

| # | Файл | Финал, px | Где в коде сейчас | Промпт (+ SPRITE_STYLE) | |
| --- | --- | --- | --- | --- | --- |
| A1 | `sprites/player_fighter.png` | 40×40 | `SpriteBaker: player_fighter` ×2.2 | `White and blue delta-wing transforming fighter jet seen from above, nose pointing up, yellow trim stripes, twin cyan engine glows at the tail, Earth defense force.` | ⬜ |
| A2 | `sprites/player_mecha.png` | 40×36 | `SpriteBaker: player_mecha` ×2.2 | `Compact white, blue and gold humanoid combat mecha seen from above, facing up, broad shoulder armor, arm cannons, twin cyan back thrusters.` (референс `mecha.png`) | ⬜ |
| A3 | `sprites/drone.png` | 20×20 | `Drone` использует `player_fighter` ×1.15 | `Tiny white and cyan support drone seen from above, round body with two small side guns, glowing cyan core, facing up.` | ⬜ |
| A4 | `sprites/enemy_scout.png` | 18×14 | `enemy_scout_0` ×1.1 | `Small alien biomechanical scout ship seen from above, nose pointing DOWN, near-black purple hull, glowing magenta veins, two forward claws.` | ⬜ |
| A5 | `sprites/enemy_zigzag.png` | 18×14 | `enemy_scout_1` ×1.1 | `Small agile alien fighter seen from above, nose pointing DOWN, swept-back blade wings, near-black purple hull, acid-green glow.` | ⬜ |
| A6 | `sprites/enemy_kamikaze.png` | 18×18 | сейчас `enemy_scout_*` | `Alien suicide drone seen from above, nose pointing DOWN, spiky round body with a bright orange glowing core, magenta spikes, menacing.` | ⬜ |
| A7 | `sprites/enemy_carrier.png` | 26×20 | `enemy_scout_*` ×1.65 | `Heavy alien carrier gunship seen from above, nose pointing DOWN, wide armored hull, orange weapon ports, magenta glowing hangar slit.` | ⬜ |
| A8 | `entities/ocean_enemy.png` | 70×70 | `ocean_enemy` 64×1.1 | `Alien amphibious assault craft surfacing from water, seen from above, nose pointing DOWN, dark purple carapace, green glowing vents, water foam around.` (без белого фона по краям пены — пену рисовать внутри силуэта) | ⬜ |
| A9 | `sprites/boss_cruiser.png` | 120×72 | `SpriteBaker: boss` ×3.3 (этапы 1–3) | `Huge alien flagship cruiser seen from above, nose pointing DOWN, symmetrical, near-black purple armored hull, glowing magenta core in the center, orange weapon bays, two side turret mounts, spiky silhouette.` (референс: босс из `game_atlas.png`) | ⬜ |
| A10 | `sprites/boss_turret.png` | 26×20 | `BossPart` turret (scout + красный тинт) | `Alien hull-mounted turret seen from above, twin barrels pointing DOWN, dark purple base, orange muzzle glow.` | ⬜ |
| A11 | `sprites/boss_generator.png` | 36×26 | `BossPart` generator (scout + бирюзовый тинт) | `Alien shield generator module seen from above, dark armored housing with a large glowing acid-green energy crystal in the center.` | ⬜ |
| A12 | `entities/alien_aagun.png` | 70×70 | `alien_aagun` 64×1.1 | `Alien ground anti-air turret seen from directly above, organic dark purple base, magenta glowing barrel pointing DOWN.` | ⬜ |
| A13 | `entities/aagun.png` | 70×70 | `aagun` 64×1.1 | `Earth ground anti-air gun emplacement seen from directly above, round grey-blue concrete base, quad barrels pointing UP, muted desaturated colors.` (свои — приглушённые) | ⬜ |
| A14 | `sprites/antimatter.png` | 12×12 | `SpriteBaker: antimatter` ×1.15 | `Glowing antimatter crystal pickup, blue faceted crystal shell with a bright orange core, small sparkle.` (референс `antimatter.png`) | ⬜ |
| A15 | `sprites/powerup_health.png` | 18×18 | `SpriteBaker: powerup_health` ×1.15 | `Green repair capsule pickup with a white cross, glowing green rim.` | ⬜ |
| A16 | `sprites/powerup_weapon.png` | 18×18 | `SpriteBaker: powerup_weapon` ×1.15 | `Orange-red weapon upgrade capsule pickup with a yellow lightning bolt, glowing rim.` | ⬜ |
| A17 | `sprites/powerup_spread.png` | 18×18 | сейчас `powerup_weapon` | `Cyan weapon capsule pickup with a white five-way fan arrow symbol, glowing rim.` | ⬜ |
| A18 | `sprites/powerup_homing.png` | 18×18 | сейчас `powerup_weapon` | `Magenta weapon capsule pickup with a white curved homing-arrow symbol, glowing rim.` | ⬜ |

Пули, частицы и лазер босса остаются процедурными (`BootScene`): в 4–10px генерация ничего не даст.

`boss_mech.png` (Хранитель, этап 4) уже в нужном стиле — оставляем как эталон. При желании перегенерировать «носом вниз», чтобы убрать `setAngle(180)` в `Boss.ts`.

### Пакет B — сюжет (16 кадров, по одному на слайд, без повторов)

Имена файлов привязаны к слайдам; `StoryData.ts` и `STORY.md` обновить в конце пакета.

| # | Файл | Слайд | Промпт (+ STORY_STYLE) | |
| --- | --- | --- | --- | --- |
| B1 | `story/l1_1_morning.jpg` | Ур.1 · 1 | `Sunny morning in futuristic green coastal megacity Neo-Tokyo, Captain Elara Vance on a high balcony looking up at the sky, far on the horizon the first dark alien ships appear as tiny silhouettes, peaceful yet ominous.` | ⬜ |
| B2 | `story/l1_2_orbit.jpg` | Ур.1 · 2 | `View of Earth from orbit, a massive dark biomechanical alien armada with magenta glows tearing through human orbital defense satellites, explosions and debris, Earth below.` | ⬜ |
| B3 | `story/l1_3_omega.jpg` | Ур.1 · 3 | `Underground hangar of Omega Base, red warning lights, the white-and-blue Transformer prototype fighter on a launch rail, Captain Elara Vance in flight suit and chief engineer Kenji Mori with a tablet standing in front of it, tense mood.` | ⬜ |
| B4 | `story/l1_4_launch.jpg` | Ур.1 · 4 | `Omega Base under attack at dusk, burning sky full of alien dropships, the white-and-blue Transformer fighter blasting off a launch ramp with cyan engine trails, explosions around.` | ⬜ |
| B5 | `story/v1_1_flagship.jpg` | Победа 1 · 1 | `A huge alien flagship falling in flames over Neo-Tokyo at sunset, long fire trail across the sky, the small white fighter flying away in the foreground.` | ⬜ |
| B6 | `story/v1_2_breaches.jpg` | Победа 1 · 2 | `The night sky over Neo-Tokyo tearing open with dozens of glowing magenta space-time portals, thousands of alien ships pouring out, city lights below, sense of dread.` (замена Нью-Йорка в `victory_2.png`) | ⬜ |
| B7 | `story/v1_3_ocean_landing.jpg` | Победа 1 · 3 | `Heavy alien machines landing in a stormy ocean, deploying huge underwater generators glowing acid green beneath the waves, energy beams rising to the clouds.` | ⬜ |
| B8 | `story/l2_1_dome.jpg` | Ур.2 · 1 | `Neo-Tokyo trapped under a gigantic hexagonal translucent magenta energy dome, alien squadrons patrolling over it, human jets crashing against the dome.` | ⬜ |
| B9 | `story/l2_2_briefing.jpg` | Ур.2 · 2 | `Captain Elara Vance in the cockpit of the Transformer, determined look, a glowing cyan holographic tactical map of the ocean with generator markers floating in front of her (abstract shapes only, no text).` | ⬜ |
| B10 | `story/v2_1_ocean.jpg` | Победа 2 · 1 | `The ocean boiling as alien generators explode in green fireballs, the energy dome over the distant city shattering into fragments, the white fighter climbing out of the spray.` | ⬜ |
| B11 | `story/l3_1_tether.jpg` | Ур.3 · 1 | `The alien armada retreating up a vertical golden gravity beam toward an orbital station, the white fighter chasing it upward through the clouds into space.` | ⬜ |
| B12 | `story/l3_2_one_way.jpg` | Ур.3 · 2 | `Close-up of Captain Elara Vance in the cockpit, a red warning glow on her face, Earth receding behind through the canopy, quiet resolve, one-way mission.` | ⬜ |
| B13 | `story/v3_1_breach.jpg` | Победа 3 · 1 | `The damaged white-blue mecha bursting through the hull of a dark alien orbital station, debris and sparks, cold dark corridors ahead.` | ⬜ |
| B14 | `story/l4_1_core.jpg` | Ур.4 · 1 | `Inside a colossal dark alien station, a giant pulsing magenta energy core in a vast chamber, the tiny mecha silhouette at the entrance, sense of scale.` | ⬜ |
| B15 | `story/l4_2_guardian.jpg` | Ур.4 · 2 | `The Guardian awakening: a gigantic dark biomechanical mecha with glowing cyan eyes and huge cannon arms rising from the core chamber, lightning around it.` (референс `boss_mech.png`) | ⬜ |
| B16 | `story/v4_1_victory.jpg` | Победа 4 · 1 | `The Guardian collapsing in a blinding explosion as the station breaks apart, Earth sunrise in the background, a rescue shuttle approaching the tiny mecha.` | ⬜ |
| B17 | `story/v4_2_epilogue.jpg` | Победа 4 · 2 | `Captain Elara Vance back on Earth at night looking up at the stars from the Omega Base runway, a single faint magenta light blinking far in deep space.` | ⬜ |

### Пакет C — фоны и интерфейс

| # | Файл | Финал | Промпт | |
| --- | --- | --- | --- | --- |
| C1 | `bg/bg_ocean.png` | 270×960, бесшовный | `Deep blue ocean surface from above with subtle waves, scattered small rocky islets and foam lines, ` + BG_STYLE | ⬜ |
| C2 | `bg/bg_tether.png` | 270×960, бесшовный | `Upper atmosphere fading into space seen from above, a glowing golden gravity beam column along one side, thin clouds and stars, ` + BG_STYLE (сейчас этап 3 использует общий `starfield`) | ⬜ |
| C3 | `bg/spacestation.png` | 270×960, бесшовный | `Dark alien space station hull plating from above, organic ribs, faint magenta conduits, ` + BG_STYLE | ⬜ |
| C4 | `hangar.png` | 540×960 | `16-bit pixel art hangar interior, front view, EMPTY glowing launch pad in the center (no ship), cables, neon cyan and orange lights, dark and moody, vertical 9:16, no text, no signs with letters.` (корабль игрока рисуется поверх кодом) | ⬜ |
| C5 | `icon.png` + `assets/icon.png` | 512×512 | `App icon: the white-and-blue Transformer fighter diving at the viewer, magenta alien glow behind, bold simple shapes, 16-bit pixel art, no text.` | ⬜ |

Фоны `city.png` и `suburbs.png` уже в нужном стиле: оставляем, только проверить и починить шов тайла (виден на скриншоте боя).

---

## 4. Порядок работы

**Шаг 0 — пайплайн ✅.** `scripts/process-art.mjs`:
```
node scripts/process-art.mjs sprite <in> public/sprites/player_fighter.png --size 40x40 [--colors 16]
node scripts/process-art.mjs bg     <in> public/bg/bg_ocean.png --size 270x960 --preview
node scripts/process-art.mjs story  <in> public/story/l1_1_morning.jpg
```
- `sprite` — вырезает белый фон заливкой от краёв (белые детали внутри спрайта сохраняются), обрезает поля, уменьшает усреднением до точного размера, делает альфу чёткой (0/255), опционально сводит палитру к N цветам;
- `bg` — кадрирует под размер и печатает расхождение верхнего и нижнего края; `--preview` сохраняет тайл, склеенный дважды (превью не коммитить);
- `story` — кадрирует в 9:16 и сохраняет 720×1280 JPEG q80;
- предупреждает, если файл превышает бюджет веса из раздела 5.

**Шаг 1 — пакет A.** Порядок: A1–A2, затем A4–A7 и A9–A11, затем остальное. После каждой пары — скриншот боя на 390×844: враги должны читаться лучше своих.

**Шаг 2 — подключение пакета A в код:**
- загрузить PNG в `BootScene` под теми же ключами (`player_fighter`, `enemy_scout_0`, …) и удалить соответствующие записи из `SpriteBaker.Sprites`;
- выставить `scale = 1` вместо ×1.1–×3.3 в `EntityConfig`, `Enemy.spawn`, `BossPart`, `Drone`, `PowerUp`, `AntimatterContainer`;
- дать типам врагов свои текстуры (`kamikaze`, `carrier`, `zigzag`) и паверапам spread/homing свои иконки;
- удалить неиспользуемые `game_atlas.*`, корневые `ship*.png`, `enemy.png`, `boss.png`, `projectile_*.png`, `pack-textures.js`.

**Шаг 3 — пакет B.** Генерировать в порядке уровней, чтобы персонажи не «уплывали»: B3 (где впервые видны оба героя) использовать как референс для B9, B12 и B17. Затем обновить `StoryData.ts` и `STORY.md` и удалить старые `story/*.jpg|png`.

**Шаг 4 — пакет C** и финальный прогон: `npm run build`, `npm run test:e2e`, скриншоты всех экранов на телефоне и десктопе.

## 5. Критерии приёмки
- Ни на одной картинке нет текста, букв, интерфейса или диалоговых окон.
- Спрайты: альфа-канал, без белого ореола, финальный размер ровно по таблице, читаются на тёмном фоне. Враги — маджента/зелёное свечение, свои — холодные цвета.
- Сюжет: 9:16, главное в верхних 55% кадра, низ тёмный и спокойный, Элара и Кэндзи узнаваемы во всех кадрах.
- Вес: спрайт ≤ 10 КБ, фон ≤ 150 КБ, сюжетный кадр ≤ 170 КБ.
- Хитбоксы не изменились: e2e-тест автопилота проходит.
