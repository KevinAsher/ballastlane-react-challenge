import { Page, Locator } from '@playwright/test';

export class PokemonListPage {
  readonly page: Page;
  readonly header: Locator;
  readonly welcomeMessage: Locator;
  readonly logoutButton: Locator;
  readonly searchInput: Locator;

  readonly clearButton: Locator;
  readonly pokemonCards: Locator;
  readonly noResultsMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly pokemonGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('[data-testid="pokemon-header"]');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.searchInput = page.locator('[data-testid="search-input"]');

    this.clearButton = page.locator('[data-testid="clear-button"]');
    this.pokemonCards = page.locator('[data-testid="pokemon-card"]');
    this.noResultsMessage = page.locator('[data-testid="no-results"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.loadingSpinner = page.locator('[data-testid="loading"]');
    this.pokemonGrid = page.locator('[data-testid="pokemon-grid"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounced search to trigger (300ms delay)
    await this.page.waitForTimeout(400);
  }

  async clearSearch() {
    await this.clearButton.click();
  }

  async clickPokemon(pokemonName: string) {
    await this.page.locator(`[data-testid="pokemon-card"][data-pokemon="${pokemonName}"]`).click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async waitForPokemonCards() {
    await this.pokemonCards.first().waitFor({ state: 'visible' });
  }

  async getSearchResultsCount() {
    return await this.pokemonCards.count();
  }

  async getPokemonNames() {
    const cards = await this.pokemonCards.all();
    const names = [];
    for (const card of cards) {
      const name = await card.getAttribute('data-pokemon');
      if (name) names.push(name);
    }
    return names;
  }
}
