import { Page, Locator } from '@playwright/test';

export class PokemonDetailModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly closeButton: Locator;
  readonly pokemonName: Locator;
  readonly pokemonImage: Locator;
  readonly pokemonId: Locator;
  readonly pokemonTypes: Locator;
  readonly pokemonStats: Locator;
  readonly pokemonHeight: Locator;
  readonly pokemonWeight: Locator;
  readonly pokemonAbilities: Locator;
  readonly pokemonDescription: Locator;
  readonly overlay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('[data-testid="pokemon-detail-modal"]');
    this.closeButton = page.locator('[data-testid="modal-close-button"]');
    this.pokemonName = page.locator('[data-testid="pokemon-name"]');
    this.pokemonImage = page.locator('[data-testid="pokemon-image"]');
    this.pokemonId = page.locator('[data-testid="pokemon-id"]');
    this.pokemonTypes = page.locator('[data-testid="pokemon-types"]');
    this.pokemonStats = page.locator('[data-testid="pokemon-stats"]');
    this.pokemonHeight = page.locator('[data-testid="pokemon-height"]');
    this.pokemonWeight = page.locator('[data-testid="pokemon-weight"]');
    this.pokemonAbilities = page.locator('[data-testid="pokemon-abilities"]');
    this.pokemonDescription = page.locator('[data-testid="pokemon-description"]');
    this.overlay = page.locator('[data-testid="modal-overlay"]');
  }

  async waitForModal() {
    await this.modal.waitFor({ state: 'visible' });
  }

  async close() {
    await this.closeButton.click();
  }

  async closeByOverlay() {
    await this.overlay.click();
  }

  async closeByEscape() {
    await this.page.keyboard.press('Escape');
  }

  async isVisible() {
    return await this.modal.isVisible();
  }

  async getPokemonName() {
    return await this.pokemonName.textContent();
  }

  async getPokemonId() {
    return await this.pokemonId.textContent();
  }

  async getPokemonTypes() {
    const typeElements = await this.pokemonTypes.locator('[data-testid="pokemon-type"]').all();
    const types = [];
    for (const element of typeElements) {
      const type = await element.textContent();
      if (type) types.push(type.trim());
    }
    return types;
  }

  async getStats() {
    const statElements = await this.pokemonStats.locator('[data-testid="pokemon-stat"]').all();
    const stats: { name: string; value: number }[] = [];
    for (const element of statElements) {
      const name = await element.locator('[data-testid="stat-name"]').textContent();
      const value = await element.locator('[data-testid="stat-value"]').textContent();
      if (name && value) {
        stats.push({ name: name.trim(), value: parseInt(value, 10) });
      }
    }
    return stats;
  }
}
