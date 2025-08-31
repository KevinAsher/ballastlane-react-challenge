import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PokemonListPage } from './pages/PokemonListPage';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Login with admin credentials
    await loginPage.loginAsAdmin();

    // Should redirect to pokemon list page
    await expect(page).toHaveURL('/');
    
    const pokemonListPage = new PokemonListPage(page);
    await expect(pokemonListPage.header).toBeVisible();
    await expect(pokemonListPage.welcomeMessage).toContainText('Welcome, admin');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Try to login with invalid credentials
    await loginPage.login('wronguser', 'wrongpass');

    // Should show error message and stay on login page
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    // Verify we're on the pokemon list page
    const pokemonListPage = new PokemonListPage(page);
    await expect(pokemonListPage.header).toBeVisible();

    // Logout
    await pokemonListPage.logout();

    // Should redirect back to login page
    await expect(page).toHaveURL('/login');
    await expect(loginPage.pageTitle).toBeVisible();
  });
});
