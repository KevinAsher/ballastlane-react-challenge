import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PokemonListPage } from './pages/PokemonListPage';
import { PokemonDetailModal } from './pages/PokemonDetailModal';

test.describe('Pokemon Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    
    // Wait for pokemon list page to load
    const pokemonListPage = new PokemonListPage(page);
    await expect(pokemonListPage.header).toBeVisible();
  });

  test('should search for pokemon successfully', async ({ page }) => {
    const pokemonListPage = new PokemonListPage(page);

    // Search for a specific pokemon
    await pokemonListPage.search('pikachu');

    // Wait for search results
    await pokemonListPage.waitForPokemonCards();

    // Should show search results
    const resultCount = await pokemonListPage.getSearchResultsCount();
    expect(resultCount).toBeGreaterThan(0);

    // Check if pikachu is in results
    const pokemonNames = await pokemonListPage.getPokemonNames();
    expect(pokemonNames.some(name => name.toLowerCase().includes('pikachu'))).toBe(true);
  });

  test('should handle no search results gracefully', async ({ page }) => {
    const pokemonListPage = new PokemonListPage(page);

    // Search for something that doesn't exist
    await pokemonListPage.search('notarealpokemon123456');

    // Should show no results message
    await expect(pokemonListPage.noResultsMessage).toBeVisible();
    await expect(pokemonListPage.noResultsMessage).toContainText('No Pokémon Found');
  });

  test('should open and close pokemon detail modal', async ({ page }) => {
    const pokemonListPage = new PokemonListPage(page);
    const pokemonDetailModal = new PokemonDetailModal(page);

    // Search for a specific pokemon to make testing more predictable
    await pokemonListPage.search('pikachu');
    await pokemonListPage.waitForPokemonCards();

    // Get the first pokemon name
    const pokemonNames = await pokemonListPage.getPokemonNames();
    expect(pokemonNames.length).toBeGreaterThan(0);

    const firstPokemonName = pokemonNames[0];

    // Click on the first pokemon card
    await pokemonListPage.clickPokemon(firstPokemonName);

    // Modal should open
    await pokemonDetailModal.waitForModal();
    await expect(pokemonDetailModal.modal).toBeVisible();

    // Check modal content - name should be visible in the header
    await expect(pokemonDetailModal.pokemonName).toBeVisible();

    // Close modal with escape key
    await pokemonDetailModal.closeByEscape();

    // Modal should be closed
    await expect(pokemonDetailModal.modal).not.toBeVisible();
  });
});
