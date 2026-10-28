export type Lang = 'en' | 'ru';

const STORAGE_KEY = 'si_lang';

const EN = {
  'cur.am': 'AM',
  'cur.cr': 'CR',

  'menu.hiScore': 'HI-SCORE',
  'menu.continue': 'CONTINUE · LV {n}',
  'menu.newGame': 'NEW GAME',
  'menu.start': 'START MISSION',
  'menu.garage': 'HANGAR',
  'menu.settings': 'SETTINGS',
  'menu.exit': 'EXIT',
  'menu.tagline': 'EARTH DEFENSE PROTOCOL',

  'settings.title': 'SETTINGS',
  'settings.sound': 'SOUND: {v}',
  'settings.on': 'ON',
  'settings.off': 'OFF',
  'settings.lang': 'LANGUAGE: EN',
  'settings.aiDemo': 'AI DEMO',
  'settings.close': 'CLOSE',

  'hud.newRecord': 'NEW RECORD!',
  'hud.mecha': 'MECHA',
  'hud.shield': 'SHIELD',
  'hud.bomb': 'BOMB',
  'pause.title': 'PAUSED',
  'pause.resume': 'RESUME',
  'pause.menu': 'MAIN MENU',
  'boss.label': 'BOSS',
  'boss.warning': 'WARNING',
  'boss.approaching': 'BOSS APPROACHING',
  'toast.achievement': 'ACHIEVEMENT',

  'tutorial.drag': 'DRAG TO FLY',
  'tutorial.keys': 'WASD / ARROWS TO FLY',
  'tutorial.mecha': 'MECHA READY! TAP THE BUTTON',
  'tutorial.mechaKeys': 'MECHA READY! PRESS E',
  'tutorial.shield': 'SHIELD = 15S OF IMMUNITY',
  'tutorial.shieldKeys': 'SPACE = SHIELD, 15S',

  'story.skip': 'SKIP',

  'map.launch': 'LAUNCH',
  'map.sector': 'SECTOR {n}',
  'map.s1': 'NEO-TOKYO',
  'map.s1.brief': 'Alien landing force over the city. Clear the skies.',
  'map.s2': 'OPEN OCEAN',
  'map.s2.brief': 'Destroy the underwater shield generators.',
  'map.s3': 'ORBITAL TETHER',
  'map.s3.brief': 'Chase the armada up the gravity beam.',
  'map.s4': 'SPACE STATION',
  'map.s4.brief': 'Reach the core. Shut down the Guardian.',
  'map.loop': 'NEW GAME+ · LOOP {n}',

  'garage.title': 'HANGAR',
  'garage.hull': 'HULL',
  'garage.weapon': 'WEAPON',
  'garage.shop': 'SUPPLIES',
  'garage.dmg': 'DMG',
  'garage.rate': 'RATE',
  'garage.repair': 'REPAIR +1',
  'garage.repaired': 'HULL OK',
  'garage.shield': 'SHIELD',
  'garage.bomb': 'BOMB',
  'garage.drone': 'DRONE',
  'garage.owned': 'OWNED',
  'garage.full': 'FULL',
  'garage.back': 'BACK',
  'weapon.plasma': 'PLASMA',
  'weapon.ion': 'ION',
  'weapon.wave': 'WAVE',

  'defeat.title': 'GAME OVER',
  'defeat.sub': 'HULL DESTROYED',
  'defeat.retry': 'RETRY',
  'defeat.garage': 'HANGAR',
  'defeat.menu': 'MENU',

  'result.title': 'MISSION CLEARED',
  'result.score': 'SCORE',
  'result.kills': 'KILLS',
  'result.chain': 'MAX CHAIN',
  'result.hull': 'HULL',
  'result.reward': 'REWARD',
  'result.rank': 'RANK',
  'result.continue': 'CONTINUE',

  'credits.title': 'MISSION\nACCOMPLISHED',
  'credits.body':
    'SPACE INVASION\n\nDESIGN & CODE\nAntigravity\n\nART\nProcedural + AI\n\nAUDIO\nZzFX\n\n\nTHANKS FOR PLAYING!',
  'credits.ngplus': 'NEW GAME+',
  'credits.menu': 'MAIN MENU',

  'float.weaponUp': 'W UP',
  'float.chain': 'CHAIN x{n}!',
} as const;

export type I18nKey = keyof typeof EN;

const RU: Record<I18nKey, string> = {
  'cur.am': 'АМ',
  'cur.cr': 'КР',

  'menu.hiScore': 'РЕКОРД',
  'menu.continue': 'ПРОДОЛЖИТЬ · УР {n}',
  'menu.newGame': 'НОВАЯ ИГРА',
  'menu.start': 'В БОЙ',
  'menu.garage': 'АНГАР',
  'menu.settings': 'НАСТРОЙКИ',
  'menu.exit': 'ВЫХОД',
  'menu.tagline': 'ПРОТОКОЛ ЗАЩИТЫ ЗЕМЛИ',

  'settings.title': 'НАСТРОЙКИ',
  'settings.sound': 'ЗВУК: {v}',
  'settings.on': 'ВКЛ',
  'settings.off': 'ВЫКЛ',
  'settings.lang': 'ЯЗЫК: РУС',
  'settings.aiDemo': 'ДЕМО ИИ',
  'settings.close': 'ЗАКРЫТЬ',

  'hud.newRecord': 'НОВЫЙ РЕКОРД!',
  'hud.mecha': 'МЕХ',
  'hud.shield': 'ЩИТ',
  'hud.bomb': 'БОМБА',
  'pause.title': 'ПАУЗА',
  'pause.resume': 'ПРОДОЛЖИТЬ',
  'pause.menu': 'В МЕНЮ',
  'boss.label': 'БОСС',
  'boss.warning': 'ВНИМАНИЕ',
  'boss.approaching': 'ПРИБЛИЖАЕТСЯ БОСС',
  'toast.achievement': 'ДОСТИЖЕНИЕ',

  'tutorial.drag': 'ВЕДИ ПАЛЬЦЕМ',
  'tutorial.keys': 'WASD / СТРЕЛКИ',
  'tutorial.mecha': 'МЕХ ГОТОВ! ЖМИ КНОПКУ',
  'tutorial.mechaKeys': 'МЕХ ГОТОВ! ЖМИ E',
  'tutorial.shield': 'ЩИТ = 15 СЕК НЕУЯЗВИМОСТИ',
  'tutorial.shieldKeys': 'ПРОБЕЛ = ЩИТ НА 15 СЕК',

  'story.skip': 'ПРОПУСК',

  'map.launch': 'В БОЙ',
  'map.sector': 'СЕКТОР {n}',
  'map.s1': 'НЕО-ТОКИО',
  'map.s1.brief': 'Десант пришельцев над городом. Очисти небо.',
  'map.s2': 'ОТКРЫТЫЙ ОКЕАН',
  'map.s2.brief': 'Уничтожь подводные генераторы щита.',
  'map.s3': 'ОРБИТАЛЬНЫЙ ЛИФТ',
  'map.s3.brief': 'Преследуй армаду по гравитационному лучу.',
  'map.s4': 'КОСМОСТАНЦИЯ',
  'map.s4.brief': 'Прорвись к ядру. Отключи Хранителя.',
  'map.loop': 'НОВАЯ ИГРА+ · КРУГ {n}',

  'garage.title': 'АНГАР',
  'garage.hull': 'КОРПУС',
  'garage.weapon': 'ОРУЖИЕ',
  'garage.shop': 'СНАБЖЕНИЕ',
  'garage.dmg': 'УРОН',
  'garage.rate': 'ТЕМП',
  'garage.repair': 'РЕМОНТ +1',
  'garage.repaired': 'КОРПУС ЦЕЛ',
  'garage.shield': 'ЩИТ',
  'garage.bomb': 'БОМБА',
  'garage.drone': 'ДРОН',
  'garage.owned': 'ЕСТЬ',
  'garage.full': 'МАКС',
  'garage.back': 'НАЗАД',
  'weapon.plasma': 'ПЛАЗМА',
  'weapon.ion': 'ИОН',
  'weapon.wave': 'ВОЛНА',

  'defeat.title': 'КОНЕЦ ИГРЫ',
  'defeat.sub': 'КОРПУС РАЗРУШЕН',
  'defeat.retry': 'ЕЩЁ РАЗ',
  'defeat.garage': 'АНГАР',
  'defeat.menu': 'МЕНЮ',

  'result.title': 'МИССИЯ\nВЫПОЛНЕНА',
  'result.score': 'ОЧКИ',
  'result.kills': 'СБИТО',
  'result.chain': 'СЕРИЯ',
  'result.hull': 'КОРПУС',
  'result.reward': 'НАГРАДА',
  'result.rank': 'РАНГ',
  'result.continue': 'ДАЛЕЕ',

  'credits.title': 'МИССИЯ\nЗАВЕРШЕНА',
  'credits.body':
    'SPACE INVASION\n\nДИЗАЙН И КОД\nAntigravity\n\nГРАФИКА\nПроцедурная + ИИ\n\nЗВУК\nZzFX\n\n\nСПАСИБО ЗА ИГРУ!',
  'credits.ngplus': 'НОВАЯ ИГРА+',
  'credits.menu': 'В МЕНЮ',

  'float.weaponUp': 'ОРУЖ+',
  'float.chain': 'СЕРИЯ x{n}!',
};

const DICTS: Record<Lang, Record<I18nKey, string>> = { en: EN, ru: RU };

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    /* storage unavailable */
  }
  const tgLang = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.language_code as
    string | undefined;
  const browserLang = tgLang || navigator.language || 'en';
  return /^(ru|uk|be|kk)/i.test(browserLang) ? 'ru' : 'en';
}

let current: Lang = detectLang();

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang) {
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable */
  }
  document.documentElement.lang = lang;
}

export function t(key: I18nKey, params?: Record<string, string | number>): string {
  let s = DICTS[current][key] ?? EN[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v));
  }
  return s;
}

/** Pick the right variant of content that is stored per language (story, achievements). */
export function pick<T>(variants: { ru: T; en: T }): T {
  return variants[current];
}
