<?php

namespace App\Services;

use App\Models\Pokemon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Concurrency;

class PokeApiService
{
    private const BASE_URL = 'https://pokeapi.co/api/v2';

    private const CACHE_TTL = 24 * 60 * 60; // 24 hours
    private const CACHE_POKEMON_INDEX = 'pokemon_index';
    private const CACHE_POKEMON_DETAILS = 'pokemon_details';

    public function searchPokemon(string $searchQuery, int $page, int $pageSize): array
    {
        $this->storePokemonIndex();



        $query = Pokemon::query();

        if (!empty($searchQuery)) {
            $query->where('name', 'like', "%{$searchQuery}%");
        }

        $total = $query->count();
        $pokemons = $query->select('name')
            ->orderBy('name', 'asc')
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->get();


        $tasks = collect();
        $results = collect();
        foreach ($pokemons as $pokemon) {
            if (!Cache::has($this->getCacheKeyForPokemon($pokemon->name))) {
                $tasks->push(fn() => $this->getStoredPokemon($pokemon->name));
            } else {
                $results->push(Cache::get($this->getCacheKeyForPokemon($pokemon->name)));
            }
        }


        $results->push(...Concurrency::run($tasks->toArray()));

        return [
            'items' => $results->filter()->sortBy('name')->toArray(),
            'total' => $total,
        ];
    }

    /**
     * Get all Pokemon names for indexing.
     */
    public function storePokemonIndex(): array
    {
        return Cache::remember(self::CACHE_POKEMON_INDEX, self::CACHE_TTL, function () {
            try {
                $response = Http::timeout(30)->get(self::BASE_URL . '/pokemon', [
                    'limit' => 20000,
                    'offset' => 0,
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    // batch insert into database
                    $pokemonData = collect($data['results'])
                        ->map(fn($pokemon) => ['name' => $pokemon['name']])
                        ->toArray();

                    Pokemon::upsert($pokemonData, ['name']);
                }

                Log::error('Failed to fetch Pokemon names from PokeAPI', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [];
            } catch (\Exception $e) {
                Log::error('Exception while fetching Pokemon names', [
                    'message' => $e->getMessage(),
                ]);

                return [];
            }
        });
    }

    /**
     * Get Pokemon details by name or ID.
     */
    public function getStoredPokemon(string $identifier): ?array
    {
        return Cache::remember($this->getCacheKeyForPokemon($identifier), self::CACHE_TTL, function () use ($identifier) {
            try {
                $response = Http::timeout(30)->get(self::BASE_URL . "/pokemon/{$identifier}");

                if ($response->successful()) {
                    $data = $response->json();

                    // Optionally expand abilities to include effect text
                    $data = $this->expandAbilities($data);

                    // Fetch and include species data
                    $data = $this->expandSpeciesData($data);

                    $this->storePokemon($data);
                    return $data;
                }

                if ($response->status() === 404) {
                    return false;
                }

                Log::error('Failed to fetch Pokemon details from PokeAPI', [
                    'identifier' => $identifier,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            } catch (\Exception $e) {
                Log::error('Exception while fetching Pokemon details', [
                    'identifier' => $identifier,
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * Get enhanced Pokemon details with all additional data.
     */
    public function getEnhancedPokemon(string $identifier): ?array
    {
        $cacheKey = "enhanced_pokemon_detail_{$identifier}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($identifier) {
            try {
                $pokemonData = $this->getPokemon($identifier);

                // Fetch additional data concurrently (for future use)
                $enhancedData = $this->fetchEnhancedDataConcurrently($pokemonData);

                $enhancedData = $this->transformToEnhancedPokemon($pokemonData, $enhancedData);

                $this->storePokemon($enhancedData);

                return $enhancedData;
            } catch (\Exception $e) {
                Log::error('Exception while fetching enhanced Pokemon details', [
                    'identifier' => $identifier,
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * Expand abilities to include effect text.
     */
    private function expandAbilities(array $pokemonData): array
    {
        if (! isset($pokemonData['abilities'])) {
            return $pokemonData;
        }

        foreach ($pokemonData['abilities'] as &$abilitySlot) {
            if (isset($abilitySlot['ability']['url'])) {
                $abilityUrl = $abilitySlot['ability']['url'];
                $abilityDetails = $this->getAbilityDetails($abilityUrl);

                if ($abilityDetails) {
                    $abilitySlot['ability']['effect_entries'] = $abilityDetails['effect_entries'] ?? [];
                    $abilitySlot['ability']['flavor_text_entries'] = $abilityDetails['flavor_text_entries'] ?? [];
                }
            }
        }

        return $pokemonData;
    }

    /**
     * Get ability details from URL.
     */
    private function getAbilityDetails(string $url): ?array
    {
        $cacheKey = 'ability_' . md5($url);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($url) {
            try {
                $response = Http::timeout(10)->get($url);

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            } catch (\Exception $e) {
                Log::warning('Failed to fetch ability details', [
                    'url' => $url,
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * Get species details from URL.
     */
    private function getSpeciesDetails(string $url): ?array
    {
        $cacheKey = 'species_' . md5($url);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($url) {
            try {
                $response = Http::timeout(10)->get($url);

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            } catch (\Exception $e) {
                Log::warning('Failed to fetch species details', [
                    'url' => $url,
                    'message' => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * Expand species data to include detailed species information.
     */
    private function expandSpeciesData(array $pokemonData): array
    {
        if (! isset($pokemonData['species']['url'])) {
            return $pokemonData;
        }

        $speciesUrl = $pokemonData['species']['url'];
        $speciesDetails = $this->getSpeciesDetails($speciesUrl);

        if ($speciesDetails) {
            $pokemonData['species']['data'] = $speciesDetails;
        }

        return $pokemonData;
    }

    /**
     * Fetch enhanced data concurrently for a Pokemon.
     */
    private function fetchEnhancedDataConcurrently(array $pokemonData): array
    {
        $urls = [];

        // Species data request
        if (isset($pokemonData['species']['url'])) {
            $urls['species'] = $pokemonData['species']['url'];
        }

        // Type damage relations requests
        $typeUrls = collect($pokemonData['types'])->pluck('type.url')->filter()->toArray();
        foreach ($typeUrls as $index => $typeUrl) {
            $urls["type_{$index}"] = $typeUrl;
        }

        // Location encounters request
        if (isset($pokemonData['location_area_encounters'])) {
            $locationUrl = $pokemonData['location_area_encounters'];
            // Handle both full URLs and relative paths
            if (! str_starts_with($locationUrl, 'http')) {
                $locationUrl = rtrim(self::BASE_URL, '/') . '/' . ltrim($locationUrl, '/');
            }
            $urls['locations'] = $locationUrl;
        }

        // Execute concurrent requests
        $poolRequests = [];
        foreach ($urls as $key => $url) {
            $poolRequests[$key] = $url;
        }

        $responses = Http::pool(fn($pool) => collect($poolRequests)->mapWithKeys(fn($url, $key) => [
            $key => $pool->as($key)->timeout(10)->retry(2)->get($url),
        ])->toArray());

        // Process responses with caching
        $results = [];

        foreach ($responses as $key => $response) {
            $cacheKey = $this->getCacheKeyForUrl($key, $urls[$key]);

            if ($response->successful()) {
                $data = $response->json();
                Cache::put($cacheKey, $data, self::CACHE_TTL);
                $results[$key] = $data;
            } else {
                // Try to get from cache if request failed
                $cached = Cache::get($cacheKey);
                if ($cached) {
                    $results[$key] = $cached;
                } else {
                    Log::warning("Failed to fetch enhanced data for key: {$key}", [
                        'status' => $response->status(),
                        'url' => $urls[$key],
                    ]);
                }
            }
        }

        return $results;
    }

    /**
     * Generate cache key for URL-based data.
     */
    private function getCacheKeyForUrl(string $type, string $url): string
    {
        return "pokeapi_{$type}_" . md5($url);
    }

    private function getCacheKeyForPokemon(string $identifier): string
    {
        return self::CACHE_POKEMON_DETAILS . ":" . $identifier;
    }

    /**
     * Transform base Pokemon data with enhanced data into the enhanced structure.
     */
    private function transformToEnhancedPokemon(array $pokemonData, array $enhancedData): array
    {
        // Add species data from enhanced data if available
        if (isset($enhancedData['species'])) {
            $pokemonData['species']['data'] = $enhancedData['species'];
        }

        // Since other enhanced fields are commented out in the TypeScript interface,
        // just return the Pokemon data with species data for now
        return $pokemonData;
    }

    /**
     * Store or update Pokemon in database.
     */
    public function storePokemon(array $pokemonData)
    {
        return Pokemon::where('name', $pokemonData['name'])->update(
            [
                'pokemon_id' => $pokemonData['id'],
                'data' => $pokemonData,
            ],
        );
    }
}
