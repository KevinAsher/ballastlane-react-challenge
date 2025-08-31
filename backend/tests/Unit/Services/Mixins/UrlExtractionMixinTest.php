<?php

namespace Tests\Unit\Services\Mixins;

use App\Services\Mixins\UrlExtractionMixin;
use PHPUnit\Framework\TestCase;

/**
 * Test implementation class for the UrlExtractionMixin.
 */
class TestableUrlExtractionService
{
    use UrlExtractionMixin;

    private array $mockResponses = [];

    public function setMockResponses(array $responses): void
    {
        $this->mockResponses = $responses;
    }

    public function getBatchFetcher(): callable
    {
        return function (array $urls): array {
            $results = [];
            foreach ($urls as $key => $url) {
                $results[$key] = $this->mockResponses[$url] ?? null;
            }

            return $results;
        };
    }

    // Make protected methods public for testing by using reflection
    public function testExtractNestedUrls(array $data, string $urlPath): array
    {
        $reflection = new \ReflectionMethod($this, 'extractNestedUrls');
        $reflection->setAccessible(true);

        return $reflection->invoke($this, $data, $urlPath);
    }

    public function testMapFetchedDataToNestedStructure(array $originalData, array $fetchedData, string $targetField = 'data'): array
    {
        $reflection = new \ReflectionMethod($this, 'mapFetchedDataToNestedStructure');
        $reflection->setAccessible(true);

        return $reflection->invoke($this, $originalData, $fetchedData, $targetField);
    }
}

class UrlExtractionMixinTest extends TestCase
{
    private TestableUrlExtractionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TestableUrlExtractionService;
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_extract_urls_from_simple_nested_structure(): void
    {
        $data = [
            'species' => [
                'url' => 'https://api.example.com/species/1',
                'name' => 'bulbasaur',
            ],
        ];

        $urls = $this->service->testExtractNestedUrls($data, 'species.url');

        $this->assertEquals([
            'species' => 'https://api.example.com/species/1',
        ], $urls);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_extract_urls_with_wildcard_from_array(): void
    {
        $data = [
            'abilities' => [
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/1',
                        'name' => 'overgrow',
                    ],
                ],
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/2',
                        'name' => 'chlorophyll',
                    ],
                ],
            ],
        ];

        $urls = $this->service->testExtractNestedUrls($data, 'abilities.*.ability.url');

        $this->assertEquals([
            'abilities.0.ability' => 'https://api.example.com/ability/1',
            'abilities.1.ability' => 'https://api.example.com/ability/2',
        ], $urls);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_extract_multiple_wildcard_levels(): void
    {
        $data = [
            'moves' => [
                [
                    'move' => [
                        'url' => 'https://api.example.com/move/1',
                        'name' => 'tackle',
                    ],
                    'version_group_details' => [
                        [
                            'version_group' => [
                                'url' => 'https://api.example.com/version/1',
                            ],
                        ],
                        [
                            'version_group' => [
                                'url' => 'https://api.example.com/version/2',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $urls = $this->service->testExtractNestedUrls($data, 'moves.*.version_group_details.*.version_group.url');

        $this->assertEquals([
            'moves.0.version_group_details.0.version_group' => 'https://api.example.com/version/1',
            'moves.0.version_group_details.1.version_group' => 'https://api.example.com/version/2',
        ], $urls);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_empty_array_when_path_not_found(): void
    {
        $data = [
            'name' => 'bulbasaur',
            'id' => 1,
        ];

        $urls = $this->service->testExtractNestedUrls($data, 'species.url');

        $this->assertEquals([], $urls);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_non_string_values_gracefully(): void
    {
        $data = [
            'abilities' => [
                [
                    'ability' => [
                        'url' => 123, // Non-string value
                        'name' => 'overgrow',
                    ],
                ],
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/2',
                        'name' => 'chlorophyll',
                    ],
                ],
            ],
        ];

        $urls = $this->service->testExtractNestedUrls($data, 'abilities.*.ability.url');

        $this->assertEquals([
            'abilities.1.ability' => 'https://api.example.com/ability/2',
        ], $urls);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_map_fetched_data_back_to_nested_structure(): void
    {
        $originalData = [
            'species' => [
                'url' => 'https://api.example.com/species/1',
                'name' => 'bulbasaur',
            ],
        ];

        $fetchedData = [
            'species' => [
                'flavor_text_entries' => [
                    ['flavor_text' => 'A seed Pokémon'],
                ],
            ],
        ];

        $result = $this->service->testMapFetchedDataToNestedStructure($originalData, $fetchedData);

        $expected = [
            'species' => [
                'url' => 'https://api.example.com/species/1',
                'name' => 'bulbasaur',
                'data' => [
                    'flavor_text_entries' => [
                        ['flavor_text' => 'A seed Pokémon'],
                    ],
                ],
            ],
        ];

        $this->assertEquals($expected, $result);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_map_fetched_data_with_custom_target_field(): void
    {
        $originalData = [
            'species' => [
                'url' => 'https://api.example.com/species/1',
                'name' => 'bulbasaur',
            ],
        ];

        $fetchedData = [
            'species' => [
                'flavor_text_entries' => [
                    ['flavor_text' => 'A seed Pokémon'],
                ],
            ],
        ];

        $result = $this->service->testMapFetchedDataToNestedStructure($originalData, $fetchedData, 'details');

        $expected = [
            'species' => [
                'url' => 'https://api.example.com/species/1',
                'name' => 'bulbasaur',
                'details' => [
                    'flavor_text_entries' => [
                        ['flavor_text' => 'A seed Pokémon'],
                    ],
                ],
            ],
        ];

        $this->assertEquals($expected, $result);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_map_wildcard_fetched_data_back_to_array_structure(): void
    {
        $originalData = [
            'abilities' => [
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/1',
                        'name' => 'overgrow',
                    ],
                ],
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/2',
                        'name' => 'chlorophyll',
                    ],
                ],
            ],
        ];

        $fetchedData = [
            'abilities.0.ability' => [
                'effect_entries' => [
                    ['effect' => 'Powers up Grass-type moves'],
                ],
            ],
            'abilities.1.ability' => [
                'effect_entries' => [
                    ['effect' => 'Raises Speed in sunshine'],
                ],
            ],
        ];

        $result = $this->service->testMapFetchedDataToNestedStructure($originalData, $fetchedData);

        $expected = [
            'abilities' => [
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/1',
                        'name' => 'overgrow',
                        'data' => [
                            'effect_entries' => [
                                ['effect' => 'Powers up Grass-type moves'],
                            ],
                        ],
                    ],
                ],
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/2',
                        'name' => 'chlorophyll',
                        'data' => [
                            'effect_entries' => [
                                ['effect' => 'Raises Speed in sunshine'],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $this->assertEquals($expected, $result);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_fetch_and_map_nested_urls_in_single_operation(): void
    {
        $data = [
            'abilities' => [
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/1',
                        'name' => 'overgrow',
                    ],
                ],
            ],
            'species' => [
                'url' => 'https://api.example.com/species/1',
                'name' => 'bulbasaur',
            ],
        ];

        // Set up mock responses
        $this->service->setMockResponses([
            'https://api.example.com/ability/1' => [
                'effect_entries' => [
                    ['effect' => 'Powers up Grass-type moves'],
                ],
            ],
            'https://api.example.com/species/1' => [
                'flavor_text_entries' => [
                    ['flavor_text' => 'A seed Pokémon'],
                ],
            ],
        ]);

        $result = $this->service->fetchAndMapNestedUrls($data, [
            'abilities.*.ability.url',
            'species.url',
        ], $this->service->getBatchFetcher());

        $expected = [
            'abilities' => [
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/1',
                        'name' => 'overgrow',
                        'data' => [
                            'effect_entries' => [
                                ['effect' => 'Powers up Grass-type moves'],
                            ],
                        ],
                    ],
                ],
            ],
            'species' => [
                'url' => 'https://api.example.com/species/1',
                'name' => 'bulbasaur',
                'data' => [
                    'flavor_text_entries' => [
                        ['flavor_text' => 'A seed Pokémon'],
                    ],
                ],
            ],
        ];

        $this->assertEquals($expected, $result);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_duplicate_urls_correctly(): void
    {
        $data = [
            'abilities' => [
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/1',
                        'name' => 'overgrow',
                    ],
                ],
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/1', // Same URL
                        'name' => 'overgrow',
                    ],
                ],
            ],
        ];

        // Set up mock response for the URL
        $this->service->setMockResponses([
            'https://api.example.com/ability/1' => [
                'effect_entries' => [
                    ['effect' => 'Powers up Grass-type moves'],
                ],
            ],
        ]);

        $result = $this->service->fetchAndMapNestedUrls($data, ['abilities.*.ability.url'], $this->service->getBatchFetcher());

        // Both abilities should have the same fetched data
        $this->assertEquals(
            $result['abilities'][0]['ability']['data'],
            $result['abilities'][1]['ability']['data']
        );
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_original_data_when_no_urls_found(): void
    {
        $data = [
            'name' => 'bulbasaur',
            'id' => 1,
        ];

        $result = $this->service->fetchAndMapNestedUrls($data, ['species.url'], $this->service->getBatchFetcher());

        $this->assertEquals($data, $result);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_empty_url_paths_array(): void
    {
        $data = [
            'name' => 'bulbasaur',
            'id' => 1,
        ];

        $result = $this->service->fetchAndMapNestedUrls($data, [], $this->service->getBatchFetcher());

        $this->assertEquals($data, $result);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_deeply_nested_structures(): void
    {
        $data = [
            'moves' => [
                [
                    'move' => [
                        'url' => 'https://api.example.com/move/1',
                        'name' => 'tackle',
                    ],
                    'version_group_details' => [
                        [
                            'version_group' => [
                                'url' => 'https://api.example.com/version/1',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $this->service->setMockResponses([
            'https://api.example.com/move/1' => [
                'power' => 40,
                'accuracy' => 100,
            ],
            'https://api.example.com/version/1' => [
                'name' => 'red-blue',
            ],
        ]);

        $result = $this->service->fetchAndMapNestedUrls($data, [
            'moves.*.move.url',
            'moves.*.version_group_details.*.version_group.url',
        ], $this->service->getBatchFetcher());

        $this->assertArrayHasKey('data', $result['moves'][0]['move']);
        $this->assertArrayHasKey('data', $result['moves'][0]['version_group_details'][0]['version_group']);

        $this->assertEquals([
            'power' => 40,
            'accuracy' => 100,
        ], $result['moves'][0]['move']['data']);

        $this->assertEquals([
            'name' => 'red-blue',
        ], $result['moves'][0]['version_group_details'][0]['version_group']['data']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_mixed_existing_and_missing_data(): void
    {
        $data = [
            'abilities' => [
                [
                    'ability' => [
                        'url' => 'https://api.example.com/ability/1',
                        'name' => 'overgrow',
                    ],
                ],
                [
                    'ability' => [
                        'name' => 'chlorophyll',
                        // Missing URL
                    ],
                ],
            ],
        ];

        $this->service->setMockResponses([
            'https://api.example.com/ability/1' => [
                'effect_entries' => [
                    ['effect' => 'Powers up Grass-type moves'],
                ],
            ],
        ]);

        $result = $this->service->fetchAndMapNestedUrls($data, ['abilities.*.ability.url'], $this->service->getBatchFetcher());

        // First ability should have data, second should remain unchanged
        $this->assertArrayHasKey('data', $result['abilities'][0]['ability']);
        $this->assertArrayNotHasKey('data', $result['abilities'][1]['ability']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_extract_urls_with_wildcard_at_beginning_of_path(): void
    {
        $data = [
            [
                'name' => 'bulbasaur',
                'species' => [
                    'url' => 'https://api.example.com/species/1',
                    'name' => 'bulbasaur-species',
                ],
            ],
            [
                'name' => 'ivysaur',
                'species' => [
                    'url' => 'https://api.example.com/species/2',
                    'name' => 'ivysaur-species',
                ],
            ],
            [
                'name' => 'venusaur',
                'species' => [
                    'url' => 'https://api.example.com/species/3',
                    'name' => 'venusaur-species',
                ],
            ],
        ];

        $urls = $this->service->testExtractNestedUrls($data, '*.species.url');

        $this->assertEquals([
            '0.species' => 'https://api.example.com/species/1',
            '1.species' => 'https://api.example.com/species/2',
            '2.species' => 'https://api.example.com/species/3',
        ], $urls);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_can_fetch_and_map_urls_with_wildcard_at_beginning_of_path(): void
    {
        // Tests that wildcard paths starting with * generate consistent key names 
        // and properly map data back to all elements including the first one.
        $data = [
            [
                'name' => 'bulbasaur',
                'species' => [
                    'url' => 'https://api.example.com/species/1',
                    'name' => 'bulbasaur-species',
                ],
            ],
            [
                'name' => 'ivysaur',
                'species' => [
                    'url' => 'https://api.example.com/species/2',
                    'name' => 'ivysaur-species',
                ],
            ],
        ];

        // Set up mock responses
        $this->service->setMockResponses([
            'https://api.example.com/species/1' => [
                'flavor_text_entries' => [
                    ['flavor_text' => 'A seed Pokémon'],
                ],
                'evolution_chain' => [
                    'url' => 'https://api.example.com/evolution/1',
                ],
            ],
            'https://api.example.com/species/2' => [
                'flavor_text_entries' => [
                    ['flavor_text' => 'A seed Pokémon evolved'],
                ],
                'evolution_chain' => [
                    'url' => 'https://api.example.com/evolution/1',
                ],
            ],
        ]);

        $result = $this->service->fetchAndMapNestedUrls($data, ['*.species.url'], $this->service->getBatchFetcher());

        $expected = [
            [
                'name' => 'bulbasaur',
                'species' => [
                    'url' => 'https://api.example.com/species/1',
                    'name' => 'bulbasaur-species',
                    'data' => [
                        'flavor_text_entries' => [
                            ['flavor_text' => 'A seed Pokémon'],
                        ],
                        'evolution_chain' => [
                            'url' => 'https://api.example.com/evolution/1',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'ivysaur',
                'species' => [
                    'url' => 'https://api.example.com/species/2',
                    'name' => 'ivysaur-species',
                    'data' => [
                        'flavor_text_entries' => [
                            ['flavor_text' => 'A seed Pokémon evolved'],
                        ],
                        'evolution_chain' => [
                            'url' => 'https://api.example.com/evolution/1',
                        ],
                    ],
                ],
            ],
        ];

        $this->assertEquals($expected, $result);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_empty_array_with_wildcard_at_beginning(): void
    {
        $data = [];

        $urls = $this->service->testExtractNestedUrls($data, '*.species.url');

        $this->assertEquals([], $urls);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_handles_mixed_valid_and_invalid_items_with_wildcard_at_beginning(): void
    {
        $data = [
            [
                'name' => 'bulbasaur',
                'species' => [
                    'url' => 'https://api.example.com/species/1',
                    'name' => 'bulbasaur-species',
                ],
            ],
            [
                'name' => 'ivysaur',
                // Missing species object
            ],
            [
                'name' => 'venusaur',
                'species' => [
                    'name' => 'venusaur-species',
                    // Missing url field
                ],
            ],
            [
                'name' => 'charmander',
                'species' => [
                    'url' => 'https://api.example.com/species/4',
                    'name' => 'charmander-species',
                ],
            ],
        ];

        $urls = $this->service->testExtractNestedUrls($data, '*.species.url');

        $this->assertEquals([
            '0.species' => 'https://api.example.com/species/1',
            '3.species' => 'https://api.example.com/species/4',
        ], $urls);
    }
}
