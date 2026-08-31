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

  test('keeps cross-page home navigation aligned with the requested section', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop header navigation is hidden in the mobile layout');

    await page.goto('/predictions');

    for (const [label, sectionId] of [
      ['协会简介', 'about'],
      ['活动动态', 'activities'],
      ['球队信息', 'teams'],
      ['赛事公告', 'matches'],
    ] as const) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${sectionId}$`));
      await expect.poll(async () => {
        return page.locator(`#${sectionId}`).evaluate((element) => {
          const header = document.querySelector('header.header');
          const headerHeight = header?.getBoundingClientRect().height ?? 72;
          return Math.abs(element.getBoundingClientRect().top - headerHeight - 4);
        });
      }, { timeout: 3000 }).toBeLessThan(12);

      await page.goto('/predictions');
    }
  });
});
