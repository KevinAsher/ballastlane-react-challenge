<?php

namespace App\Services;

use App\Models\Pokemon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PokeApiService
{
    private const BASE_URL = 'https://pokeapi.co/api/v2';

    private const CACHE_TTL = 24 * 60 * 60; // 24 hours

    /**
     * Get all Pokemon names for indexing.
     */
    public function getAllPokemonNames(): array
    {
        $cacheKey = 'pokemon_names_index';

        return Cache::remember($cacheKey, self::CACHE_TTL, function () {
            try {
                $response = Http::timeout(30)->get(self::BASE_URL.'/pokemon', [
                    'limit' => 20000,
                    'offset' => 0,
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    return collect($data['results'])->map(function ($pokemon) {
                        return [
                            'name' => $pokemon['name'],
                            'url' => $pokemon['url'],
                        ];
                    })->toArray();
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
    public function getPokemon(string $identifier): ?array
    {
        $cacheKey = "pokemon_detail_{$identifier}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($identifier) {
            try {
                $response = Http::timeout(30)->get(self::BASE_URL."/pokemon/{$identifier}");

                if ($response->successful()) {
                    $data = $response->json();

                    // Optionally expand abilities to include effect text
                    $data = $this->expandAbilities($data);

                    return $data;
                }

                if ($response->status() === 404) {
                    return null;
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
        $cacheKey = 'ability_'.md5($url);

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
     * Store or update Pokemon in database.
     */
    public function storePokemon(array $pokemonData): Pokemon
    {
        $types = collect($pokemonData['types'])->map(fn ($type) => $type['type']['name'])->toArray();
        $spriteUrl = $pokemonData['sprites']['front_default'] ?? null;

        return Pokemon::updateOrCreate(
            ['pokemon_id' => $pokemonData['id']],
            [
                'name' => $pokemonData['name'],
                'slug' => $pokemonData['name'],
                'types' => $types,
                'sprite_url' => $spriteUrl,
                'data' => $pokemonData,
            ]
        );
    }
}
