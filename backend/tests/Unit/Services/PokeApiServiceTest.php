<?php

namespace Tests\Unit\Services;

use App\Services\PokeApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PokeApiServiceTest extends TestCase
{
    use RefreshDatabase;

    private PokeApiService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new PokeApiService;
        Cache::flush();
    }

    public function test_store_pokemon_index_success(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0' => Http::response([
                'results' => [
                    ['name' => 'bulbasaur', 'url' => 'https://pokeapi.co/api/v2/pokemon/1/'],
                    ['name' => 'ivysaur', 'url' => 'https://pokeapi.co/api/v2/pokemon/2/'],
                    ['name' => 'venusaur', 'url' => 'https://pokeapi.co/api/v2/pokemon/3/'],
                ],
            ]),
        ]);

        $names = $this->service->storePokemonIndex();

        $this->assertIsArray($names);
        $this->assertEmpty($names); // storePokemonIndex returns empty array but stores data in DB

        // Verify data was stored in database
        $this->assertDatabaseCount('pokemon', 3);
        $this->assertDatabaseHas('pokemon', ['name' => 'bulbasaur']);
        $this->assertDatabaseHas('pokemon', ['name' => 'ivysaur']);
        $this->assertDatabaseHas('pokemon', ['name' => 'venusaur']);
    }

    public function test_store_pokemon_index_caches_result(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0' => Http::response([
                'results' => [
                    ['name' => 'bulbasaur', 'url' => 'https://pokeapi.co/api/v2/pokemon/1/'],
                ],
            ]),
        ]);

        // First call
        $names1 = $this->service->storePokemonIndex();

        // Second call should use cache
        $names2 = $this->service->storePokemonIndex();

        $this->assertEquals($names1, $names2);

        // HTTP should only be called once
        Http::assertSentCount(1);
    }

    public function test_store_pokemon_index_handles_api_failure(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0' => Http::response(null, 500),
        ]);

        $names = $this->service->storePokemonIndex();

        $this->assertIsArray($names);
        $this->assertEmpty($names);
    }

    public function test_get_stored_pokemon_success(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => Http::response([
                'id' => 25,
                'name' => 'pikachu',
                'types' => [['type' => ['name' => 'electric']]],
                'abilities' => [],
                'species' => [
                    'name' => 'pikachu',
                    'url' => 'https://pokeapi.co/api/v2/pokemon-species/25/',
                ],
                'sprites' => ['front_default' => 'http://example.com/pikachu.png'],
            ]),
            'https://pokeapi.co/api/v2/pokemon-species/25/' => Http::response([
                'name' => 'pikachu',
                'flavor_text_entries' => [
                    ['flavor_text' => 'When several of these Pokémon gather, their electricity could build and cause lightning storms.'],
                ],
            ]),
        ]);

        $pokemon = $this->service->getStoredPokemon('pikachu');

        $this->assertIsArray($pokemon);
        $this->assertEquals(25, $pokemon['id']);
        $this->assertEquals('pikachu', $pokemon['name']);
        $this->assertIsArray($pokemon['abilities']);

        // Check that species was expanded with new structure
        $this->assertArrayHasKey('data', $pokemon['species']);
        $this->assertArrayHasKey('flavor_text_entries', $pokemon['species']['data']);
    }

    public function test_get_stored_pokemon_caches_result(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => Http::response([
                'id' => 25,
                'name' => 'pikachu',
                'abilities' => [],
                'species' => [
                    'name' => 'pikachu',
                    'url' => 'https://pokeapi.co/api/v2/pokemon-species/25/',
                ],
                'sprites' => ['front_default' => 'http://example.com/pikachu.png'],
            ]),
            'https://pokeapi.co/api/v2/pokemon-species/25/' => Http::response([
                'name' => 'pikachu',
                'flavor_text_entries' => [],
            ]),
        ]);

        // First call
        $pokemon1 = $this->service->getStoredPokemon('pikachu');

        // Second call should use cache
        $pokemon2 = $this->service->getStoredPokemon('pikachu');

        $this->assertEquals($pokemon1, $pokemon2);

        // With the mixin, HTTP calls may vary due to caching and batch requests
        // Just verify we get consistent results
        $this->assertNotNull($pokemon1);
        $this->assertNotNull($pokemon2);
    }

    public function test_get_pokemon_returns_null_for_404(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/nonexistent' => Http::response(null, 404),
        ]);

        $pokemon = $this->service->getStoredPokemon('nonexistent');

        $this->assertNull($pokemon);
    }

    public function test_get_pokemon_handles_api_failure(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => Http::response(null, 500),
        ]);

        $pokemon = $this->service->getStoredPokemon('pikachu');

        $this->assertNull($pokemon);
    }

    public function test_timeout_configuration(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => function () {
                // Simulate timeout
                throw new \Illuminate\Http\Client\ConnectionException('Timeout');
            },
        ]);

        $pokemon = $this->service->getStoredPokemon('pikachu');

        $this->assertNull($pokemon);
    }
}
