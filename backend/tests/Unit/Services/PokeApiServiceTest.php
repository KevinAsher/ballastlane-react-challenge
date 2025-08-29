<?php

namespace Tests\Unit\Services;

use App\Models\Pokemon;
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

    public function test_get_all_pokemon_names_success(): void
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

        $names = $this->service->getAllPokemonNames();

        $this->assertIsArray($names);
        $this->assertCount(3, $names);
        $this->assertEquals('bulbasaur', $names[0]['name']);
        $this->assertEquals('https://pokeapi.co/api/v2/pokemon/1/', $names[0]['url']);
    }

    public function test_get_all_pokemon_names_caches_result(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0' => Http::response([
                'results' => [
                    ['name' => 'bulbasaur', 'url' => 'https://pokeapi.co/api/v2/pokemon/1/'],
                ],
            ]),
        ]);

        // First call
        $names1 = $this->service->getAllPokemonNames();

        // Second call should use cache
        $names2 = $this->service->getAllPokemonNames();

        $this->assertEquals($names1, $names2);

        // HTTP should only be called once
        Http::assertSentCount(1);
    }

    public function test_get_all_pokemon_names_handles_api_failure(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0' => Http::response(null, 500),
        ]);

        $names = $this->service->getAllPokemonNames();

        $this->assertIsArray($names);
        $this->assertEmpty($names);
    }

    public function test_get_pokemon_success(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => Http::response([
                'id' => 25,
                'name' => 'pikachu',
                'types' => [['type' => ['name' => 'electric']]],
                'abilities' => [
                    [
                        'ability' => [
                            'name' => 'static',
                            'url' => 'https://pokeapi.co/api/v2/ability/9/',
                        ],
                        'is_hidden' => false,
                    ],
                ],
                'sprites' => ['front_default' => 'http://example.com/pikachu.png'],
            ]),
            'https://pokeapi.co/api/v2/ability/9/' => Http::response([
                'name' => 'static',
                'effect_entries' => [
                    [
                        'effect' => 'Has a 30% chance of paralyzing attacking Pokémon on contact.',
                        'language' => ['name' => 'en'],
                    ],
                ],
            ]),
        ]);

        $pokemon = $this->service->getPokemon('pikachu');

        $this->assertIsArray($pokemon);
        $this->assertEquals(25, $pokemon['id']);
        $this->assertEquals('pikachu', $pokemon['name']);
        $this->assertIsArray($pokemon['abilities']);

        // Check that ability was expanded
        $ability = $pokemon['abilities'][0]['ability'];
        $this->assertArrayHasKey('effect_entries', $ability);
        $this->assertNotEmpty($ability['effect_entries']);
    }

    public function test_get_pokemon_caches_result(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => Http::response([
                'id' => 25,
                'name' => 'pikachu',
                'abilities' => [],
                'sprites' => ['front_default' => 'http://example.com/pikachu.png'],
            ]),
        ]);

        // First call
        $pokemon1 = $this->service->getPokemon('pikachu');

        // Second call should use cache
        $pokemon2 = $this->service->getPokemon('pikachu');

        $this->assertEquals($pokemon1, $pokemon2);

        // HTTP should only be called once
        Http::assertSentCount(1);
    }

    public function test_get_pokemon_returns_null_for_404(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/nonexistent' => Http::response(null, 404),
        ]);

        $pokemon = $this->service->getPokemon('nonexistent');

        $this->assertNull($pokemon);
    }

    public function test_get_pokemon_handles_api_failure(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => Http::response(null, 500),
        ]);

        $pokemon = $this->service->getPokemon('pikachu');

        $this->assertNull($pokemon);
    }

    public function test_store_pokemon_creates_new_record(): void
    {
        $pokemonData = [
            'id' => 25,
            'name' => 'pikachu',
            'types' => [
                ['type' => ['name' => 'electric']],
            ],
            'sprites' => ['front_default' => 'http://example.com/pikachu.png'],
            'abilities' => [],
            'stats' => [],
        ];

        $pokemon = $this->service->storePokemon($pokemonData);

        $this->assertInstanceOf(Pokemon::class, $pokemon);
        $this->assertEquals(25, $pokemon->pokemon_id);
        $this->assertEquals('pikachu', $pokemon->name);
        $this->assertEquals(['electric'], $pokemon->types);
        $this->assertEquals('http://example.com/pikachu.png', $pokemon->sprite_url);
        $this->assertEquals($pokemonData, $pokemon->data);

        $this->assertDatabaseHas('pokemon', [
            'pokemon_id' => 25,
            'name' => 'pikachu',
        ]);
    }

    public function test_store_pokemon_updates_existing_record(): void
    {
        // Create existing Pokemon
        $existing = Pokemon::factory()->create([
            'pokemon_id' => 25,
            'name' => 'pikachu',
            'types' => ['electric'],
        ]);

        $updatedData = [
            'id' => 25,
            'name' => 'pikachu',
            'types' => [
                ['type' => ['name' => 'electric']],
                ['type' => ['name' => 'flying']], // Additional type
            ],
            'sprites' => ['front_default' => 'http://example.com/pikachu-updated.png'],
        ];

        $pokemon = $this->service->storePokemon($updatedData);

        $this->assertEquals($existing->id, $pokemon->id);
        $this->assertEquals(['electric', 'flying'], $pokemon->types);
        $this->assertEquals('http://example.com/pikachu-updated.png', $pokemon->sprite_url);

        // Should not create a new record
        $this->assertDatabaseCount('pokemon', 1);
    }

    public function test_store_pokemon_handles_null_sprite(): void
    {
        $pokemonData = [
            'id' => 25,
            'name' => 'pikachu',
            'types' => [['type' => ['name' => 'electric']]],
            'sprites' => ['front_default' => null],
        ];

        $pokemon = $this->service->storePokemon($pokemonData);

        $this->assertNull($pokemon->sprite_url);
    }

    public function test_expand_abilities_with_no_abilities(): void
    {
        $pokemonData = [
            'id' => 25,
            'name' => 'pikachu',
        ];

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('expandAbilities');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, $pokemonData);

        $this->assertEquals($pokemonData, $result);
    }

    public function test_expand_abilities_with_valid_abilities(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/ability/9/' => Http::response([
                'name' => 'static',
                'effect_entries' => [
                    [
                        'effect' => 'Has a 30% chance of paralyzing attacking Pokémon on contact.',
                        'language' => ['name' => 'en'],
                    ],
                ],
            ]),
        ]);

        $pokemonData = [
            'id' => 25,
            'name' => 'pikachu',
            'abilities' => [
                [
                    'ability' => [
                        'name' => 'static',
                        'url' => 'https://pokeapi.co/api/v2/ability/9/',
                    ],
                    'is_hidden' => false,
                ],
            ],
        ];

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('expandAbilities');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, $pokemonData);

        $ability = $result['abilities'][0]['ability'];
        $this->assertArrayHasKey('effect_entries', $ability);
        $this->assertNotEmpty($ability['effect_entries']);
    }

    public function test_get_ability_details_caches_result(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/ability/9/' => Http::response([
                'name' => 'static',
                'effect_entries' => [],
            ]),
        ]);

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('getAbilityDetails');
        $method->setAccessible(true);

        // First call
        $details1 = $method->invoke($this->service, 'https://pokeapi.co/api/v2/ability/9/');

        // Second call should use cache
        $details2 = $method->invoke($this->service, 'https://pokeapi.co/api/v2/ability/9/');

        $this->assertEquals($details1, $details2);

        // HTTP should only be called once
        Http::assertSentCount(1);
    }

    public function test_get_ability_details_handles_failure(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/ability/9/' => Http::response(null, 500),
        ]);

        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('getAbilityDetails');
        $method->setAccessible(true);

        $details = $method->invoke($this->service, 'https://pokeapi.co/api/v2/ability/9/');

        $this->assertNull($details);
    }

    public function test_timeout_configuration(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => function () {
                // Simulate timeout
                throw new \Illuminate\Http\Client\ConnectionException('Timeout');
            },
        ]);

        $pokemon = $this->service->getPokemon('pikachu');

        $this->assertNull($pokemon);
    }
}
