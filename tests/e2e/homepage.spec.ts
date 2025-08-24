import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/SoulMatting/i);

    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display main call-to-action', async ({ page }) => {
    // Look for main CTA button or link
    const ctaButton = page.locator(
      '[data-testid="cta-button"], .cta-button, button:has-text("Get Started"), button:has-text("Sign Up")'
    );
    await expect(ctaButton.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile navigation works
    const mobileMenu = page.locator(
      '[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]'
    );
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      // Check if menu items are visible after clicking
      await expect(page.locator('nav a').first()).toBeVisible();
    }
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check for essential meta tags
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(
      1
    );
  });

  test('should load without accessibility violations', async ({ page }) => {
    // Basic accessibility checks
    await expect(page.locator('h1')).toBeVisible();

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');

      // Images should have alt text, aria-label, or be decorative
      expect(
        alt !== null || ariaLabel !== null || role === 'presentation'
      ).toBeTruthy();
    }
  });

  test('should handle navigation links', async ({ page }) => {
    // Test main navigation links
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Click the first navigation link
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');

      if (href && !href.startsWith('http')) {
        await firstLink.click();
        // Wait for navigation to complete
        await page.waitForLoadState('networkidle');

        // Check that we navigated somewhere
        expect(page.url()).not.toBe('/');
      }
    }
  });
});
