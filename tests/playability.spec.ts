import { test, expect } from '@playwright/test';

test.describe('Game Playability Test', () => {
  test('Autopilot should survive and win the game', async ({ page }) => {
    // Устанавливаем увеличенный таймаут для теста, так как игра занимает время
    test.setTimeout(120000); 

    await page.goto('/');

    // Включаем тестовый режим
    await page.evaluate(() => {
      (window as any).__E2E_TEST_MODE__ = true;
    });

    // Ожидаем загрузки игры и нажимаем PLAY
    await page.waitForSelector('text=PLAY', { state: 'visible', timeout: 10000 });
    await page.click('text=PLAY');

    // Пропускаем диалоги/гараж, если нужно (если есть кнопка SKIP или СТАРТ МИССИИ)
    // GarageScene has "НАЧАТЬ МИССИЮ" text
    try {
      await page.waitForSelector('text=НАЧАТЬ МИССИЮ', { state: 'visible', timeout: 5000 });
      await page.click('text=НАЧАТЬ МИССИЮ');
    } catch (e) {
      // Игнорируем, если сразу перешло в игру
    }

    try {
      await page.waitForSelector('text=SKIP', { state: 'visible', timeout: 5000 });
      await page.click('text=SKIP');
    } catch (e) {
      // Игнорируем
    }

    // Ожидаем завершения игры (установки __GAME_RESULT__)
    const result = await page.waitForFunction(() => {
      return (window as any).__GAME_RESULT__;
    }, null, { timeout: 100000 });

    const finalStatus = await result.jsonValue();
    
    expect(finalStatus).toBe('VICTORY');
  });
});
