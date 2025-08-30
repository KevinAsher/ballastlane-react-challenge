<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pokemon;
use App\Services\PokeApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PokemonController extends Controller
{
    public function __construct(
        private PokeApiService $pokeApiService
    ) {}

    /**
     * Search and list Pokemon with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->input('name', '');
        $page = max(1, (int) $request->input('page', 1));
        $pageSize = min(100, max(1, (int) $request->input('pageSize', 20)));

        return $this->searchPokemon($query, $page, $pageSize);
    }

    /**
     * Get detailed Pokemon information.
     */
    public function show(string $identifier): JsonResponse
    {
        // Fetch from API to ensure we have the latest data with species information
        $pokemonData = $this->pokeApiService->getPokemon($identifier);

        if (! $pokemonData) {
            return response()->json(['message' => 'Pokemon not found'], 404);
        }

        // Store in database for future requests
        $this->pokeApiService->storePokemon($pokemonData);

        return response()->json($pokemonData);
    }

    /**
     * Get enhanced Pokemon information with additional data.
     */
    public function enhanced(string $identifier): JsonResponse
    {
        // Fetch enhanced Pokemon data
        $enhancedPokemonData = $this->pokeApiService->getEnhancedPokemon($identifier);

        if (! $enhancedPokemonData) {
            return response()->json(['message' => 'Pokemon not found'], 404);
        }

        // Store base Pokemon in database for future requests
        $this->pokeApiService->storePokemon($enhancedPokemonData);

        return response()->json($enhancedPokemonData);
    }

    /**
     * Search Pokemon by name substring.
     */
    private function searchPokemon(string $query, int $page, int $pageSize): JsonResponse
    {
        $results = $this->pokeApiService->searchPokemon($query, $page, $pageSize);

        return response()->json([
            'items' => $results['items'],
            'page' => $page,
            'pageSize' => $pageSize,
            'total' => $results['total'],
        ]);
    }

    /**
     * List all Pokemon with pagination.
     */
    private function listAllPokemon(int $page, int $pageSize): JsonResponse
    {
        // Check if we need to seed our database
        $pokemonCount = Pokemon::count();

        if ($pokemonCount === 0) {
            // We need to seed some Pokemon for the initial load
            $this->seedInitialPokemon();
        }

        $query = Pokemon::query();
        $total = $query->count();

        $pokemon = $query->offset(($page - 1) * $pageSize)
            ->limit($pageSize)
            ->get();

        $items = $pokemon->map(fn ($p) => $p->card_data)->toArray();

        return response()->json([
            'items' => $items,
            'page' => $page,
            'pageSize' => $pageSize,
            'total' => $total,
        ]);
    }

    /**
     * Seed initial Pokemon for the database.
     */
    private function seedInitialPokemon(): void
    {
        $cacheKey = 'initial_pokemon_seeded';

        if (Cache::get($cacheKey)) {
            return;
        }

        // Get first 50 Pokemon for initial seeding
        $allNames = $this->pokeApiService->getAllPokemonNames();

        foreach ($initialPokemon as $pokemonName) {
            $pokemonData = $this->pokeApiService->getPokemon($pokemonName['name']);
            if ($pokemonData) {
                $this->pokeApiService->storePokemon($pokemonData);
            }
        }

        Cache::put($cacheKey, true, 3600); // Cache for 1 hour
    }
}
