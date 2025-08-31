<?php

namespace App\Services\Mixins;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

trait PokeApiFetcher
{
    private const CACHE_TTL = 24 * 60 * 60; // 24 hours

    private const BASE_URL = 'https://pokeapi.co/api/v2';

    private function getRawPokemonApiData(string|array $oneOrMoreIdentifiers): ?array
    {
        $isSingleIdentifier = ! is_array($oneOrMoreIdentifiers);
        $identifiers = $isSingleIdentifier ? [$oneOrMoreIdentifiers] : $oneOrMoreIdentifiers;

        $urls = collect($identifiers)->map(fn ($identifier) => self::BASE_URL."/pokemon/{$identifier}")->toArray();

        if ($isSingleIdentifier) {
            return $this->fetchWithCache($urls[0]);
        }

        return $this->fetchWithCache($urls);
    }

    /**
     * Execute batch HTTP GET requests with per-URL caching.
     *
     * @param  array  $urls  Array of URLs keyed by identifier
     * @return array Results keyed by the same identifiers
     */
    private function fetchWithCache(array|string $oneOrMoreUrls, int $cacheTtl = self::CACHE_TTL): ?array
    {
        $isSingleUrl = ! is_array($oneOrMoreUrls);
        $urls = $isSingleUrl ? [$oneOrMoreUrls] : $oneOrMoreUrls;

        $results = [];
        $urlsToFetch = [];

        // Check cache first and separate URLs that need to be fetched
        foreach ($urls as $key => $url) {
            $cacheKey = $this->getCacheKeyForUrl($url);
            $cached = Cache::get($cacheKey);

            if ($cached !== null) {
                $results[$key] = $cached;
            } else {
                $urlsToFetch[$key] = $url;
            }
        }

        // If all URLs were cached, return early
        if (empty($urlsToFetch)) {
            if ($isSingleUrl) {
                return $results[0];
            }

            return $results;
        }


        Log::info('Fetching '.count($urlsToFetch).' URLs');

        // Execute concurrent requests for uncached URLs
        $responses = Http::pool(fn ($pool) => collect($urlsToFetch)->mapWithKeys(fn ($url, $key) => [
            $key => $pool->as($key)->timeout(10)->retry(2, 100, throw: false)->get($url),
        ])->toArray());

        // Process responses and update cache
        foreach ($responses as $key => $response) {
            $cacheKey = $this->getCacheKeyForUrl($urlsToFetch[$key]);

            if ($response->successful()) {
                $data = $response->json();
                Cache::put($cacheKey, $data, $cacheTtl);
                $results[$key] = $data;
            } else {
                // Try to get stale cache data if request failed
                $cached = Cache::get($cacheKey);
                if ($cached !== null) {
                    $results[$key] = $cached;
                } else {
                    Log::warning("Failed to fetch data for key: {$key}", [
                        'status' => $response->status(),
                        'url' => $urlsToFetch[$key],
                    ]);
                }
            }
        }

        if (empty($results)) {
            return null;
        }

        if ($isSingleUrl) {
            return $results[0];
        }

        return $results;
    }

    /**
     * Generate cache key for URL-based data.
     */
    private function getCacheKeyForUrl(string $url): string
    {
        $path = str_replace(self::BASE_URL, '', $url);

        return "pokeapi_{$path}";
    }
}
