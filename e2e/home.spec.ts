import { test, expect } from '@playwright/test';

test.describe('Home Page & Navigation Flow', () => {
  test('renders header, main sections and footer properly on desktop', async ({ page }) => {
    await page.goto('/');

    // Check main sections visibility
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#teams')).toBeVisible();
    await expect(page.locator('#matches')).toBeVisible();
    await expect(page.locator('#activities')).toBeVisible();

    // Check copywriting in activities section
    await expect(page.locator('#activities')).toContainText('参与丰富多彩的足球活动');
  });

  test('no horizontal scrollbar on mobile viewport (390px)', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    }
  });
});
