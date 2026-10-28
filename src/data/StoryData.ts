import { getLang } from '../services/i18n';

export interface StorySlide {
  title: string;
  text: string;
  image?: string;
  /** English version. `|` in text marks a dramatic pause for the typewriter. */
  en: { title: string; text: string };
}

export const LORE_DATA: Record<string, StorySlide[]> = {
  level_1: [
    {
      title: 'ВХОДЯЩАЯ ПЕРЕДАЧА',
      text: 'Еще утром в Нео-Токио светило солнце.| А к вечеру небо почернело от их кораблей.| Они не выходили на связь.| Они просто начали выжигать наши города.',
      image: 'story/story_1.jpg',
      en: {
        title: 'INCOMING TRANSMISSION',
        text: 'This morning the sun was shining over Neo-Tokyo.| By evening the sky was black with their ships.| They never made contact.| They just started burning our cities.',
      },
    },
    {
      title: 'ВХОДЯЩАЯ ПЕРЕДАЧА',
      text: 'Их флот смял орбитальную оборону за считанные часы.| Земная армия парализована.| Миллиарды людей в укрытиях смотрят в небо,| ожидая конца.',
      image: 'story/story_2.jpg',
      en: {
        title: 'INCOMING TRANSMISSION',
        text: 'Their fleet crushed our orbital defenses in hours.| Earth forces are paralyzed.| Billions in shelters stare at the sky,| waiting for the end.',
      },
    },
    {
      title: 'ВХОДЯЩАЯ ПЕРЕДАЧА',
      text: 'База «Омега» — наш последний действующий форпост.| Проект «Трансформер» так и не прошел финальные тесты,| реактор нестабилен. Но у нас нет времени.| Ты — наш последний шанс взлететь.',
      image: 'story/story_3.jpg',
      en: {
        title: 'INCOMING TRANSMISSION',
        text: 'Omega Base is our last working outpost.| Project Transformer never passed its final tests,| the reactor is unstable. But we are out of time.| You are our last chance to fly.',
      },
    },
    {
      title: 'ВХОДЯЩАЯ ПЕРЕДАЧА',
      text: 'Небеса пылают! Вражеский десант уже на территории базы!| Запускай протоколы боевой трансформации, пилот.| Взлетай и заставь их захлебнуться в собственном огне!',
      image: 'story/story_4.jpg',
      en: {
        title: 'INCOMING TRANSMISSION',
        text: 'The skies are burning! Enemy troops are inside the base!| Engage combat transformation protocols, pilot.| Take off and make them choke on their own fire!',
      },
    },
  ],
  level_1_victory: [
    {
      title: 'ПОБЕДА?..',
      text: 'Флагман рухнул, расчертив небо огненным шлейфом.| На секунду в эфире повисла тишина.| Мы успели сделать лишь один вздох облегчения...',
      image: 'story/victory_1.jpg',
      en: {
        title: 'VICTORY... OR SO WE THOUGHT',
        text: 'The flagship went down, streaking fire across the sky.| For a second the airwaves fell silent.| We managed only one breath of relief...',
      },
    },
    {
      title: 'ВХОДЯЩАЯ ПЕРЕДАЧА',
      text: '...прежде чем радары сошли с ума.| Массовые проколы пространства! Тысячи новых сигнатур.| Это был не флагман.| Это был всего лишь их разведчик.',
      image: 'story/victory_2.png',
      en: {
        title: 'INCOMING TRANSMISSION',
        text: '...before the radars went haywire.| Mass space-time breaches! Thousands of new signatures.| That was not their flagship.| It was only a scout.',
      },
    },
    {
      title: 'ЭКСТРЕННЫЙ ПРОТОКОЛ',
      text: 'Пилот, нет времени на празднование.| Враг высадил тяжелую технику в океане| и разворачивает подводные генераторы.| Они питают силовой щит главной армады.',
      image: 'story/victory_3.png',
      en: {
        title: 'EMERGENCY PROTOCOL',
        text: 'Pilot, no time to celebrate.| The enemy has landed heavy machinery in the ocean| and is deploying underwater generators.| They power the main armada’s force shield.',
      },
    },
  ],
  level_2: [
    {
      title: 'СЕКТОР 7: НЕО-ТОКИО',
      text: 'Главный мегаполис Земли накрыт непробиваемым куполом.| Вражеские эскадрильи безнаказанно зачищают сектора.| Обычная авиация бессильна.',
      image: 'story/victory_2.png',
      en: {
        title: 'SECTOR 7: NEO-TOKYO',
        text: 'Earth’s greatest city is trapped under an impenetrable dome.| Enemy squadrons sweep sector after sector.| Conventional aircraft are powerless.',
      },
    },
    {
      title: 'БРИФИНГ',
      text: 'Твоя задача — погрузиться в сектор Океана| и уничтожить подводные генераторы.| Лишив их щита, ты откроешь нам путь на орбиту.| Удачи, пилот.',
      image: 'story/story_4.png',
      en: {
        title: 'MISSION BRIEFING',
        text: 'Your task: dive into the Ocean sector| and destroy the underwater generators.| Take down their shield and you open our way to orbit.| Good luck, pilot.',
      },
    },
  ],
  level_2_victory: [
    {
      title: 'УГРОЗА УСТРАНЕНА',
      text: 'Океан кипит от перегруженных реакторов.| Генераторы уничтожены, энергетический купол над Нео-Токио пал.| Земная авиация начала контратаку.',
      image: 'story/story_ocean_victory.jpg',
      en: {
        title: 'THREAT ELIMINATED',
        text: 'The ocean boils from overloaded reactors.| The generators are gone and the dome over Neo-Tokyo has fallen.| Earth’s air force is counterattacking.',
      },
    },
  ],
  level_3: [
    {
      title: 'ПОСЛЕДНИЙ РУБЕЖ',
      text: 'Вражеская армада отступает по гравитационному лучу обратно на орбитальную станцию.| Это наш шанс!',
      image: 'story/story_orbit_chase.jpg',
      en: {
        title: 'FINAL STAND',
        text: 'The enemy armada is retreating up the gravity beam to its orbital station.| This is our chance!',
      },
    },
    {
      title: 'ТОЧКА НЕВОЗВРАТА',
      text: 'Перенаправь энергию реактора на маршевые двигатели.| Это полет в один конец, пилот.| У твоего корабля не хватит топлива на возвращение.',
      image: 'story/story_orbit_chase.jpg',
      en: {
        title: 'POINT OF NO RETURN',
        text: 'Divert reactor power to the main engines.| This is a one-way flight, pilot.| Your ship won’t have the fuel to come back.',
      },
    },
  ],
  level_3_victory: [
    {
      title: 'ПРОРЫВ',
      text: 'Внешний периметр орбитальной станции прорван.| Обшивка повреждена, но трансформер держится.| Впереди — холодная тьма и коридоры их цитадели.',
      image: 'story/victory_3.png',
      en: {
        title: 'BREACH SUCCESSFUL',
        text: 'The station’s outer perimeter is breached.| The hull is damaged, but the transformer holds.| Ahead lie cold darkness and the halls of their citadel.',
      },
    },
  ],
  level_4: [
    {
      title: 'ПРОНИКНОВЕНИЕ',
      text: 'Внимание! Радары фиксируют колоссальную энергетическую аномалию в ядре станции.| Они пробуждают Хранителя.',
      image: 'story/story_station.jpg',
      en: {
        title: 'INFILTRATION',
        text: 'Warning! Radar detects a colossal energy anomaly in the station core.| They are awakening the Guardian.',
      },
    },
    {
      title: 'ХРАНИТЕЛЬ',
      text: 'Если этот механизм запустится на полную мощность — Земля будет уничтожена.| Прорвись к ядру и отключи его. Любой ценой.',
      image: 'story/story_station.jpg',
      en: {
        title: 'THE GUARDIAN',
        text: 'If that machine reaches full power, Earth will be destroyed.| Break through to the core and shut it down. At any cost.',
      },
    },
  ],
  level_4_victory: [
    {
      title: 'ВОЙНА ОКОНЧЕНА',
      text: 'Механическое сердце армады остановилось.| Небеса снова принадлежат нам.| Командование высылает спасательный челнок.',
      image: 'story/story_victory_mech.jpg',
      en: {
        title: 'WAR IS OVER',
        text: 'The armada’s mechanical heart has stopped.| The skies are ours again.| Command is sending a rescue shuttle.',
      },
    },
    {
      title: 'НОВАЯ УГРОЗА?',
      text: 'Возвращайся домой, пилот.| Сегодня Земля может спать спокойно...| даже если мы знаем, что во тьме космоса кто-то только что услышал их предсмертный крик.',
      image: 'story/story_victory_mech.jpg',
      en: {
        title: 'A NEW THREAT?',
        text: 'Come home, pilot.| Tonight Earth can sleep in peace...| even though we know that somewhere in the dark, someone just heard their dying scream.',
      },
    },
  ],
};

/** Title and text of a slide in the current UI language. */
export function localizeSlide(slide: StorySlide): { title: string; text: string } {
  return getLang() === 'en' ? slide.en : { title: slide.title, text: slide.text };
}
