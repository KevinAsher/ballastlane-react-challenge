import { test as base, expect } from '@playwright/test';

// Define test fixtures for authentication
export const test = base.extend<{
  authenticatedContext: any;
}>({
  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="username-input"]', 'admin');
    await page.fill('[data-testid="password-input"]', 'admin');
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login (redirect to pokemon list)
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="pokemon-header"]')).toBeVisible();
    
    await use(context);
    await context.close();
  },
});

export { expect } from '@playwright/test';
