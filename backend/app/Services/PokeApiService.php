<?php

namespace App\Services;

use App\Models\Pokemon;
use App\Services\Mixins\PokeApiDataTransformations;
use App\Services\Mixins\PokeApiFetcher;
use App\Services\Mixins\UrlExtractionMixin;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Concurrency;

class PokeApiService
{
    use PokeApiDataTransformations;
    use PokeApiFetcher;
    use UrlExtractionMixin;

    private const CACHE_POKEMON_INDEX = 'pokemon_index';

    private const CACHE_POKEMON_DETAILS = 'pokemon_details';

    public function searchPokemon(string $searchQuery, int $page, int $pageSize): array
    {
        $this->storePokemonIndex();

        $query = Pokemon::query();

        if (! empty($searchQuery)) {
            $query->search($searchQuery);
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
            if (! Cache::has($this->getCacheKeyForPokemon($pokemon->name))) {
                $tasks->push(fn () => $this->getStoredPokemon($pokemon->name));
            } else {
                $results->push(Cache::get($this->getCacheKeyForPokemon($pokemon->name)));
            }
        }

        $results->push(...Concurrency::driver('process')->run($tasks->toArray()));


        return [
            'items' => $results->filter()->sortBy('name')->toArray(),
            'total' => $total,
        ];
    }

    /**
     * Get all Pokemon names for indexing.
     */
    public function storePokemonIndex()
    {
        return Cache::remember(self::CACHE_POKEMON_INDEX, self::CACHE_TTL, function () {
            $ttl = 0;
            $data = $this->fetchWithCache(self::BASE_URL.'/pokemon?limit=20000&offset=0', $ttl);

            // batch insert into database
            $pokemonData = collect($data['results'])
                ->map(fn ($pokemon) => ['name' => $pokemon['name']])
                ->toArray();

            Pokemon::upsert($pokemonData, ['name']);

            return true;
        });
    }

    /**
     * Get Pokemon details by name or ID.
     */
    public function getStoredPokemon(string $identifier): ?array
    {
        $data = $this->getRawPokemonApiData($identifier);
        if (! $data) {
            return null;
        }

        $data = $this->fetchAndMapNestedUrls(
            $data,
            ['species.url'],
            fn ($urls) => $this->fetchWithCache($urls)
        );

        return $this->transformBasicData($data);
    }

    /**
     * Get Pokemon abilities data with detailed information.
     */
    public function getPokemonAbilities(string $identifier): ?array
    {
        $data = $this->getRawPokemonApiData($identifier);
        if (! $data) {
            return null;
        }

        $data = $this->fetchAndMapNestedUrls(
            $data,
            ['abilities.*.ability.url'],
            fn ($urls) => $this->fetchWithCache($urls)
        );

        return $this->transformAbilitiesData($data);
    }

    /**
     * Get Pokemon moves data with detailed information.
     */
    public function getPokemonMoves(string $identifier): ?array
    {
        $data = $this->getRawPokemonApiData($identifier);
        if (! $data) {
            return null;
        }

        $data = $this->fetchAndMapNestedUrls(
            $data,
            ['moves.*.move.url'],
            fn ($urls) => $this->fetchWithCache($urls)
        );

        return $this->transformMovesData($data);
    }

    /**
     * Get Pokemon forms data.
     */
    public function getPokemonForms(string $identifier): ?array
    {
        $data = $this->getRawPokemonApiData($identifier);
        if (! $data) {
            return null;
        }

        $data = $this->fetchAndMapNestedUrls(
            $data,
            ['forms.*.url'],
            fn ($urls) => $this->fetchWithCache($urls)
        );

        return $this->transformFormsData($data);
    }

    /**
     * Get Pokemon overview data (basic information).
     */
    public function getPokemonOverview(string $identifier): ?array
    {
        $cacheKey = "pokemon_overview_{$identifier}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($identifier) {
            $pokemonData = $this->getStoredPokemon($identifier);

            if (! $pokemonData) {
                return null;
            }

            return [
                'id' => $pokemonData['id'],
                'name' => $pokemonData['name'],
                'height' => $pokemonData['height'],
                'weight' => $pokemonData['weight'],
                'base_experience' => $pokemonData['base_experience'],
                'types' => $pokemonData['types'],
            ];
        });
    }

    private function getCacheKeyForPokemon(string $identifier): string
    {
        return self::CACHE_POKEMON_DETAILS.':'.$identifier;
    }
}
