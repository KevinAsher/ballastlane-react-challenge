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

        // If we have a search query, filter from our cached names
        if ($query) {
            return $this->searchPokemon($query, $page, $pageSize);
        }

        // Otherwise, return all Pokemon from our database or seed from API
        return $this->listAllPokemon($page, $pageSize);
    }

    /**
     * Get detailed Pokemon information.
     */
    public function show(string $identifier): JsonResponse
    {
        // First check if we have it in our database
        $pokemon = Pokemon::where('name', $identifier)
            ->orWhere('pokemon_id', $identifier)
            ->first();

        if ($pokemon) {
            return response()->json($pokemon->data);
        }

        // If not in database, fetch from API
        $pokemonData = $this->pokeApiService->getPokemon($identifier);

        if (! $pokemonData) {
            return response()->json(['message' => 'Pokemon not found'], 404);
        }

        // Store in database for future requests
        $this->pokeApiService->storePokemon($pokemonData);

        return response()->json($pokemonData);
    }

    /**
     * Search Pokemon by name substring.
     */
    private function searchPokemon(string $query, int $page, int $pageSize): JsonResponse
    {
        $allNames = $this->pokeApiService->getAllPokemonNames();

        // Filter names by substring search
        $filteredNames = array_filter($allNames, function ($pokemon) use ($query) {
            return stripos($pokemon['name'], $query) !== false;
        });

        $total = count($filteredNames);
        $offset = ($page - 1) * $pageSize;
        $paginatedNames = array_slice($filteredNames, $offset, $pageSize);

        // Get or fetch details for these Pokemon
        $items = [];
        foreach ($paginatedNames as $pokemonName) {
            $name = $pokemonName['name'];

            // Check if we have it in database
            $pokemon = Pokemon::where('name', $name)->first();

            if ($pokemon) {
                $items[] = $pokemon->card_data;
            } else {
                // Fetch from API and store
                $pokemonData = $this->pokeApiService->getPokemon($name);
                if ($pokemonData) {
                    $storedPokemon = $this->pokeApiService->storePokemon($pokemonData);
                    $items[] = $storedPokemon->card_data;
                }
            }
        }

        return response()->json([
            'items' => $items,
            'page' => $page,
            'pageSize' => $pageSize,
            'total' => $total,
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
        $initialPokemon = array_slice($allNames, 0, 50);

        foreach ($initialPokemon as $pokemonName) {
            $pokemonData = $this->pokeApiService->getPokemon($pokemonName['name']);
            if ($pokemonData) {
                $this->pokeApiService->storePokemon($pokemonData);
            }
        }

        Cache::put($cacheKey, true, 3600); // Cache for 1 hour
    }
}
