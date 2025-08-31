<?php

namespace Tests\Feature\Api;

use App\Services\PokeApiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PokemonTest extends TestCase
{
    use RefreshDatabase;

    private PokeApiService $mockService;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear caches
        Cache::flush();

        // Authenticate for all tests
        $this->authenticate();

        // Set up mock service that will be used by most tests
        $this->setupMockService();
    }

    private function authenticate(): void
    {
        $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);
    }

    private function setupMockService(): void
    {
        $this->mockService = $this->createMock(PokeApiService::class);
        $this->app->instance(PokeApiService::class, $this->mockService);
    }

    private function createPokemonData(int $id, string $name, array $types = ['normal'], array $extraData = []): array
    {
        $baseData = [
            'id' => $id,
            'name' => $name,
            'types' => collect($types)->map(fn ($type) => ['type' => ['name' => $type]])->toArray(),
            'sprites' => ['front_default' => "http://example.com/{$name}.png"],
        ];

        return array_merge($baseData, $extraData);
    }

    private function createSearchResponse(array $items, int $total): array
    {
        return [
            'items' => array_values($items),
            'total' => $total,
        ];
    }

    private function createPokemonRange(int $start, int $end, string $namePrefix = 'pokemon'): array
    {
        return collect(range($start, $end))->map(fn ($i) => $this->createPokemonData(
            $i,
            "{$namePrefix}{$i}",
            ['normal']
        ))->toArray();
    }

    private function assertPaginatedResponse($response, int $page, int $pageSize, int $total, ?int $expectedItems = null): void
    {
        $response->assertStatus(200)
            ->assertJson([
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $total,
            ]);

        if ($expectedItems !== null) {
            $data = $response->json();
            $this->assertCount($expectedItems, $data['items']);
        }
    }

    private function getPikachuData(): array
    {
        return $this->createPokemonData(25, 'pikachu', ['electric'], [
            'abilities' => [
                ['ability' => ['name' => 'static'], 'is_hidden' => false],
            ],
            'stats' => [
                ['base_stat' => 35, 'stat' => ['name' => 'hp']],
            ],
        ]);
    }

    public function test_pokemon_index_returns_paginated_results(): void
    {
        $bulbasaur = $this->createPokemonData(1, 'bulbasaur', ['grass', 'poison']);
        $charmander = $this->createPokemonData(4, 'charmander', ['fire']);

        $this->mockService->expects($this->once())
            ->method('searchPokemon')
            ->with('', 1, 20)
            ->willReturn($this->createSearchResponse([$bulbasaur, $charmander], 2));

        $response = $this->getJson('/api/pokemon');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'items' => [
                    '*' => [
                        'id',
                        'name',
                        'types',
                        'sprites',
                    ],
                ],
                'page',
                'pageSize',
                'total',
            ]);

        $this->assertPaginatedResponse($response, 1, 20, 2, 2);
    }

    public function test_pokemon_index_with_pagination_parameters(): void
    {
        $page1Items = $this->createPokemonRange(1, 10);
        $page2Items = $this->createPokemonRange(11, 20);
        $page3Items = $this->createPokemonRange(21, 25);

        $this->mockService->method('searchPokemon')
            ->willReturnMap([
                ['', 1, 10, $this->createSearchResponse($page1Items, 25)],
                ['', 2, 10, $this->createSearchResponse($page2Items, 25)],
                ['', 3, 10, $this->createSearchResponse($page3Items, 25)],
            ]);

        // Test page 1 with pageSize 10
        $response = $this->getJson('/api/pokemon?page=1&pageSize=10');
        $this->assertPaginatedResponse($response, 1, 10, 25, 10);

        // Test page 2
        $response = $this->getJson('/api/pokemon?page=2&pageSize=10');
        $this->assertPaginatedResponse($response, 2, 10, 25, 10);

        // Test page 3 (should have 5 items)
        $response = $this->getJson('/api/pokemon?page=3&pageSize=10');
        $this->assertPaginatedResponse($response, 3, 10, 25, 5);
    }

    public function test_pokemon_search_by_name(): void
    {
        $pikachu = $this->createPokemonData(25, 'pikachu', ['electric']);
        $raichu = $this->createPokemonData(26, 'raichu', ['electric']);

        $this->mockService->expects($this->once())
            ->method('searchPokemon')
            ->with('chu', 1, 20)
            ->willReturn($this->createSearchResponse([$pikachu, $raichu], 2));

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
        $pikachu = $this->createPokemonData(25, 'pikachu', ['electric']);

        $this->mockService->expects($this->once())
            ->method('searchPokemon')
            ->with('PIKA', 1, 20)
            ->willReturn($this->createSearchResponse([$pikachu], 1));

        $response = $this->getJson('/api/pokemon?name=PIKA');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertEquals(1, $data['total']);
        $this->assertEquals('pikachu', $data['items'][0]['name']);
    }

    public function test_pokemon_show_existing_pokemon(): void
    {
        $pikachuData = $this->getPikachuData();

        $this->mockService->expects($this->once())
            ->method('getStoredPokemon')
            ->with('pikachu')
            ->willReturn($pikachuData);

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
        $basicPikachu = ['id' => 25, 'name' => 'pikachu'];

        $this->mockService->expects($this->once())
            ->method('getStoredPokemon')
            ->with('25')
            ->willReturn($basicPikachu);

        $response = $this->getJson('/api/pokemon/25');

        $response->assertStatus(200)
            ->assertJson($basicPikachu);
    }

    public function test_pokemon_show_fetches_from_api_when_not_cached(): void
    {
        $pikachuData = $this->getPikachuData();
        $pikachuData['abilities'][0]['ability']['url'] = 'https://pokeapi.co/api/v2/ability/9/';

        $this->mockService->expects($this->once())
            ->method('getStoredPokemon')
            ->with('pikachu')
            ->willReturn($pikachuData);

        $response = $this->getJson('/api/pokemon/pikachu');

        $response->assertStatus(200)
            ->assertJson([
                'id' => 25,
                'name' => 'pikachu',
            ]);
    }

    public function test_pokemon_show_not_found(): void
    {
        $this->mockService->expects($this->once())
            ->method('getStoredPokemon')
            ->with('nonexistent')
            ->willReturn(null);

        $response = $this->getJson('/api/pokemon/nonexistent');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Pokemon not found']);
    }

    public function test_pokemon_index_pagination_limits(): void
    {
        $this->mockService->method('searchPokemon')
            ->willReturn($this->createSearchResponse([], 0));

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
        $this->mockService->method('searchPokemon')
            ->willReturn($this->createSearchResponse([], 0));
        $this->mockService->method('getStoredPokemon')
            ->willReturn(null);

        // Start fresh session and explicitly remove authentication
        $this->startSession();
        session()->forget('authenticated');

        $response = $this->getJson('/api/pokemon');
        $response->assertStatus(401);

        $response = $this->getJson('/api/pokemon/pikachu');
        $response->assertStatus(401);
    }

    public function test_pokemon_data_structure(): void
    {
        $pikachu = $this->createPokemonData(25, 'pikachu', ['electric']);

        $this->mockService->expects($this->once())
            ->method('searchPokemon')
            ->with('', 1, 20)
            ->willReturn($this->createSearchResponse([$pikachu], 1));

        $response = $this->getJson('/api/pokemon');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'items' => [
                    '*' => [
                        'id',
                        'name',
                        'types',
                        'sprites',
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
        $this->assertIsArray($item['sprites']);
    }

    public function test_pokemon_search_with_no_results(): void
    {
        $this->mockService->expects($this->once())
            ->method('searchPokemon')
            ->with('nonexistentpokemon', 1, 20)
            ->willReturn($this->createSearchResponse([], 0));

        $response = $this->getJson('/api/pokemon?name=nonexistentpokemon');

        $response->assertStatus(200)
            ->assertJson([
                'items' => [],
                'total' => 0,
            ]);
    }
}
