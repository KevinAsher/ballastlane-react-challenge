<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PokeApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        // Fetch from cache/API
        $pokemonData = $this->pokeApiService->getStoredPokemon($identifier);

        if (! $pokemonData) {
            return response()->json(['message' => 'Pokemon not found'], 404);
        }

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

        return response()->json($enhancedPokemonData);
    }

    /**
     * Get Pokemon overview data.
     */
    public function overview(string $identifier): JsonResponse
    {
        $overviewData = $this->pokeApiService->getPokemonOverview($identifier);

        if (! $overviewData) {
            return response()->json(['message' => 'Pokemon not found'], 404);
        }

        return response()->json($overviewData);
    }

    /**
     * Get Pokemon abilities data.
     */
    public function abilities(string $identifier): JsonResponse
    {
        $abilitiesData = $this->pokeApiService->getPokemonAbilities($identifier);

        if (! $abilitiesData) {
            return response()->json(['message' => 'Pokemon not found or error fetching abilities'], 404);
        }

        return response()->json($abilitiesData);
    }

    /**
     * Get Pokemon moves data.
     */
    public function moves(string $identifier): JsonResponse
    {
        $movesData = $this->pokeApiService->getPokemonMoves($identifier);

        if (! $movesData) {
            return response()->json(['message' => 'Pokemon not found or error fetching moves'], 404);
        }

        return response()->json($movesData);
    }

    /**
     * Get Pokemon forms data.
     */
    public function forms(string $identifier): JsonResponse
    {
        $formsData = $this->pokeApiService->getPokemonForms($identifier);

        if (! $formsData) {
            return response()->json(['message' => 'Pokemon not found'], 404);
        }

        return response()->json($formsData);
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
}
