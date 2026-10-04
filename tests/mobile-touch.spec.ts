import { test, expect, devices } from '@playwright/test';

// Real-touch regression test: the main playability spec drives the game via the
// Autopilot, so it never exercises actual finger input. This one plays the
// real mobile flow (menu -> briefing -> map -> game) using touch events only.
test.use({ ...devices['Pixel 5'] });

test.describe('Mobile touch controls', () => {
  test('player ship follows a finger drag', async ({ page }) => {
    test.setTimeout(90000);
    page.on('pageerror', (e) => process.stdout.write(`\n[Uncaught Exception]: ${e}\n`));

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.waitForSelector('#btn-play');
    await page.tap('#btn-play');

    // Tap through the story briefing exactly like a player would.
    const isGameRunning = () =>
      page.evaluate(() => !!(window as any).__PHASER_GAME__?.scene.isActive('GameScene'));

    for (let i = 0; i < 120 && !(await isGameRunning()); i++) {
      const overlayActive = await page.evaluate(
        () => !!document.querySelector('.story-overlay.active'),
      );
      if (overlayActive) {
        await page.tap('.story-overlay');
      }
      await page.waitForTimeout(250);
    }
    expect(await isGameRunning()).toBe(true);
    await page.waitForTimeout(1200); // camera fade-in

    const getPlayerPos = () =>
      page.evaluate(() => {
        const scene = (window as any).__PHASER_GAME__.scene.getScene('GameScene');
        return { x: scene.player.x as number, y: scene.player.y as number };
      });

    const box = (await page.locator('#game-container canvas').boundingBox())!;
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height * 0.75;

    // Nothing in the DOM UI layer may sit on top of the playfield.
    const topElement = await page.evaluate(
      ([x, y]) => {
        const el = document.elementFromPoint(x, y);
        return el ? `${el.tagName}.${el.className}` : 'none';
      },
      [startX, startY],
    );
    expect(topElement, `element on top of the playfield: ${topElement}`).toMatch(/^CANVAS/);

    const before = await getPlayerPos();

    const cdp = await page.context().newCDPSession(page);
    const touch = (type: string, x: number, y: number) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
      });

    await touch('touchStart', startX, startY);
    // Slow drag (well under the dash-swipe threshold speed)
    for (let i = 1; i <= 15; i++) {
      await touch('touchMove', startX + i * 4, startY - i * 2);
      await page.waitForTimeout(30);
    }
    const during = await getPlayerPos();
    await touch('touchEnd', startX + 60, startY - 30);

    process.stdout.write(
      `\n[TouchTest] before=${JSON.stringify(before)} after=${JSON.stringify(during)}\n`,
    );
    expect(during.x - before.x).toBeGreaterThan(20);
    expect(before.y - during.y).toBeGreaterThan(10);
  });
});
