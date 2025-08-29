<?php

namespace Tests\Feature\Api;

use App\Models\Pokemon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PokemonTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear caches
        Cache::flush();

        // Authenticate for all tests
        $this->authenticate();
    }

    private function authenticate(): void
    {
        $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);
    }

    public function test_pokemon_index_returns_paginated_results(): void
    {
        // Create some test Pokemon
        Pokemon::factory()->create([
            'pokemon_id' => 1,
            'name' => 'bulbasaur',
            'types' => ['grass', 'poison'],
            'sprite_url' => 'http://example.com/bulbasaur.png',
        ]);

        Pokemon::factory()->create([
            'pokemon_id' => 4,
            'name' => 'charmander',
            'types' => ['fire'],
            'sprite_url' => 'http://example.com/charmander.png',
        ]);

        $response = $this->getJson('/api/pokemon');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'items' => [
                    '*' => [
                        'id',
                        'name',
                        'types',
                        'sprite',
                    ],
                ],
                'page',
                'pageSize',
                'total',
            ])
            ->assertJson([
                'page' => 1,
                'pageSize' => 20,
                'total' => 2,
            ]);

        $data = $response->json();
        $this->assertCount(2, $data['items']);
    }

    public function test_pokemon_index_with_pagination_parameters(): void
    {
        // Create 25 test Pokemon
        for ($i = 1; $i <= 25; $i++) {
            Pokemon::factory()->create([
                'pokemon_id' => $i,
                'name' => "pokemon{$i}",
                'types' => ['normal'],
            ]);
        }

        // Test page 1 with pageSize 10
        $response = $this->getJson('/api/pokemon?page=1&pageSize=10');

        $response->assertStatus(200)
            ->assertJson([
                'page' => 1,
                'pageSize' => 10,
                'total' => 25,
            ]);

        $data = $response->json();
        $this->assertCount(10, $data['items']);

        // Test page 2
        $response = $this->getJson('/api/pokemon?page=2&pageSize=10');

        $response->assertStatus(200)
            ->assertJson([
                'page' => 2,
                'pageSize' => 10,
                'total' => 25,
            ]);

        $data = $response->json();
        $this->assertCount(10, $data['items']);

        // Test page 3 (should have 5 items)
        $response = $this->getJson('/api/pokemon?page=3&pageSize=10');

        $response->assertStatus(200)
            ->assertJson([
                'page' => 3,
                'pageSize' => 10,
                'total' => 25,
            ]);

        $data = $response->json();
        $this->assertCount(5, $data['items']);
    }

    public function test_pokemon_search_by_name(): void
    {
        Pokemon::factory()->create([
            'pokemon_id' => 25,
            'name' => 'pikachu',
            'types' => ['electric'],
        ]);

        Pokemon::factory()->create([
            'pokemon_id' => 26,
            'name' => 'raichu',
            'types' => ['electric'],
        ]);

        Pokemon::factory()->create([
            'pokemon_id' => 1,
            'name' => 'bulbasaur',
            'types' => ['grass', 'poison'],
        ]);

        // Mock the PokeAPI service to return names
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0' => Http::response([
                'results' => [
                    ['name' => 'pikachu', 'url' => 'https://pokeapi.co/api/v2/pokemon/25/'],
                    ['name' => 'raichu', 'url' => 'https://pokeapi.co/api/v2/pokemon/26/'],
                    ['name' => 'bulbasaur', 'url' => 'https://pokeapi.co/api/v2/pokemon/1/'],
                ],
            ]),
        ]);

        // Search for "chu" should return pikachu and raichu
        $response = $this->getJson('/api/pokemon?name=chu');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertEquals(2, $data['total']);
        $names = collect($data['items'])->pluck('name');
        $this->assertContains('pikachu', $names);
        $this->assertContains('raichu', $names);
    }

    public function test_pokemon_search_case_insensitive(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0' => Http::response([
                'results' => [
                    ['name' => 'pikachu', 'url' => 'https://pokeapi.co/api/v2/pokemon/25/'],
                ],
            ]),
        ]);

        Pokemon::factory()->create([
            'pokemon_id' => 25,
            'name' => 'pikachu',
            'types' => ['electric'],
        ]);

        // Search should be case insensitive
        $response = $this->getJson('/api/pokemon?name=PIKA');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertEquals(1, $data['total']);
        $this->assertEquals('pikachu', $data['items'][0]['name']);
    }

    public function test_pokemon_show_existing_pokemon(): void
    {
        $pokemon = Pokemon::factory()->create([
            'pokemon_id' => 25,
            'name' => 'pikachu',
            'types' => ['electric'],
            'data' => [
                'id' => 25,
                'name' => 'pikachu',
                'types' => [['type' => ['name' => 'electric']]],
                'abilities' => [
                    ['ability' => ['name' => 'static'], 'is_hidden' => false],
                ],
                'stats' => [
                    ['base_stat' => 35, 'stat' => ['name' => 'hp']],
                ],
                'sprites' => ['front_default' => 'http://example.com/pikachu.png'],
            ],
        ]);

        $response = $this->getJson('/api/pokemon/pikachu');

        $response->assertStatus(200)
            ->assertJson([
                'id' => 25,
                'name' => 'pikachu',
                'types' => [['type' => ['name' => 'electric']]],
            ]);
    }

    public function test_pokemon_show_by_id(): void
    {
        $pokemon = Pokemon::factory()->create([
            'pokemon_id' => 25,
            'name' => 'pikachu',
            'data' => [
                'id' => 25,
                'name' => 'pikachu',
            ],
        ]);

        $response = $this->getJson('/api/pokemon/25');

        $response->assertStatus(200)
            ->assertJson([
                'id' => 25,
                'name' => 'pikachu',
            ]);
    }

    public function test_pokemon_show_fetches_from_api_when_not_cached(): void
    {
        // Mock the PokeAPI response
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
                'stats' => [
                    ['base_stat' => 35, 'stat' => ['name' => 'hp']],
                ],
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

        $response = $this->getJson('/api/pokemon/pikachu');

        $response->assertStatus(200)
            ->assertJson([
                'id' => 25,
                'name' => 'pikachu',
            ]);

        // Verify Pokemon was stored in database
        $this->assertDatabaseHas('pokemon', [
            'pokemon_id' => 25,
            'name' => 'pikachu',
        ]);
    }

    public function test_pokemon_show_not_found(): void
    {
        // Mock 404 response from PokeAPI
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/nonexistent' => Http::response(null, 404),
        ]);

        $response = $this->getJson('/api/pokemon/nonexistent');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Pokemon not found',
            ]);
    }

    public function test_pokemon_index_pagination_limits(): void
    {
        // Test pageSize limits
        $response = $this->getJson('/api/pokemon?pageSize=1000');
        $data = $response->json();
        $this->assertLessThanOrEqual(100, $data['pageSize']); // Should be capped at 100

        $response = $this->getJson('/api/pokemon?pageSize=0');
        $data = $response->json();
        $this->assertGreaterThanOrEqual(1, $data['pageSize']); // Should be at least 1

        // Test page limits
        $response = $this->getJson('/api/pokemon?page=0');
        $data = $response->json();
        $this->assertGreaterThanOrEqual(1, $data['page']); // Should be at least 1
    }

    public function test_pokemon_requires_authentication(): void
    {
        // Start fresh session without authentication
        $this->startSession();

        $response = $this->getJson('/api/pokemon');
        $response->assertStatus(401);

        $response = $this->getJson('/api/pokemon/pikachu');
        $response->assertStatus(401);
    }

    public function test_pokemon_data_structure(): void
    {
        Pokemon::factory()->create([
            'pokemon_id' => 25,
            'name' => 'pikachu',
            'types' => ['electric'],
            'sprite_url' => 'http://example.com/pikachu.png',
        ]);

        $response = $this->getJson('/api/pokemon');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'items' => [
                    '*' => [
                        'id',
                        'name',
                        'types',
                        'sprite',
                    ],
                ],
                'page',
                'pageSize',
                'total',
            ]);

        $item = $response->json('items.0');
        $this->assertIsInt($item['id']);
        $this->assertIsString($item['name']);
        $this->assertIsArray($item['types']);
        $this->assertIsString($item['sprite']);
    }

    public function test_empty_search_returns_all_pokemon(): void
    {
        Pokemon::factory()->count(3)->create();

        $response = $this->getJson('/api/pokemon?name=');

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertEquals(3, $data['total']);
    }

    public function test_pokemon_search_with_no_results(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon?limit=20000&offset=0' => Http::response([
                'results' => [
                    ['name' => 'pikachu', 'url' => 'https://pokeapi.co/api/v2/pokemon/25/'],
                ],
            ]),
        ]);

        $response = $this->getJson('/api/pokemon?name=nonexistentpokemon');

        $response->assertStatus(200)
            ->assertJson([
                'items' => [],
                'total' => 0,
            ]);
    }
}
