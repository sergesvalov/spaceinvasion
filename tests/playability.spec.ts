import { test, expect } from '@playwright/test';

test.describe('Game Playability Test', () => {
  test('Autopilot should survive and win the game', async ({ page }) => {
    // Устанавливаем увеличенный таймаут для теста, так как игра занимает время
    test.setTimeout(300000); 

    await page.goto('/');

    // Перехватываем логи консоли браузера и выводим их в консоль тестраннера (Jenkins)
    page.on('console', msg => console.log(`[Browser] ${msg.type()}: ${msg.text()}`));

    // Включаем тестовый режим
    await page.evaluate(() => {
      (window as any).__E2E_TEST_MODE__ = true;
    });

    // Ожидаем, пока хук __START_GAME__ не станет доступен
    await page.waitForFunction(() => typeof (window as any).__START_GAME__ === 'function', null, { timeout: 10000 });
    
    // Запускаем игру
    await page.evaluate(() => {
      (window as any).__START_GAME__();
    });

    // Ожидаем завершения игры (установки __GAME_RESULT__)
    const result = await page.waitForFunction(() => {
      return (window as any).__GAME_RESULT__;
    }, null, { timeout: 300000 });

    const finalStatus = await result.jsonValue();
    
    expect(finalStatus).toBe('VICTORY');
  });
});
