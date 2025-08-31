<?php

namespace App\Services\Mixins;

/**
 * Mixin for extracting URLs from deeply nested array structures and mapping fetched data back.
 */
trait UrlExtractionMixin
{
    /**
     * Extract URLs from deeply nested array structures using dot notation paths.
     *
     * @param  array  $data  The input array/object data
     * @param  string  $urlPath  Dot notation path to the URL field (e.g., 'abilities.*.ability.url')
     * @return array Array of URLs with generated keys indicating their original location
     */
    protected function extractNestedUrls(array $data, string $urlPath): array
    {
        $urls = [];
        $this->extractUrlsRecursive($data, $urlPath, '', $urls);

        return $urls;
    }

    /**
     * Recursive helper to extract URLs from nested structures.
     *
     * @param  array  $data  Current data being processed
     * @param  string  $remaining  Remaining path to process
     * @param  string  $currentPath  Current path built so far
     * @param  array  $urls  Reference to URLs array being built
     */
    private function extractUrlsRecursive(array $data, string $remaining, string $currentPath, array &$urls): void
    {
        $pathParts = explode('.', $remaining, 2);
        $currentKey = $pathParts[0];
        $remainingPath = $pathParts[1] ?? '';

        if ($currentKey === '*') {
            // Handle wildcard - iterate through all array elements
            foreach ($data as $index => $item) {
                $newPath = $currentPath ? "{$currentPath}.{$index}" : (string) $index;

                if (empty($remainingPath)) {
                    // This is the final level, extract URL
                    if (is_string($item)) {
                        $urls[$newPath] = $item;
                    }
                } else {
                    // Continue recursion
                    if (is_array($item)) {
                        $this->extractUrlsRecursive($item, $remainingPath, $newPath, $urls);
                    }
                }
            }
        } else {
            // Handle specific key
            if (! isset($data[$currentKey])) {
                return;
            }

            $newPath = $currentPath ? "{$currentPath}.{$currentKey}" : $currentKey;

            if (empty($remainingPath)) {
                // This is the final level, extract URL
                if (is_string($data[$currentKey])) {
                    // Remove the final '.url' or '.link' etc. from the path to get the container path
                    $containerPath = $currentPath ?: str_replace('.url', '', $newPath);
                    $urls[$containerPath] = $data[$currentKey];
                }
            } else {
                // Continue recursion
                if (is_array($data[$currentKey])) {
                    $this->extractUrlsRecursive($data[$currentKey], $remainingPath, $newPath, $urls);
                }
            }
        }
    }

    /**
     * Map fetched data back to the original nested structure based on the path keys.
     *
     * @param  array  $originalData  The original data structure
     * @param  array  $fetchedData  The fetched data keyed by path
     * @param  string  $targetField  The field name to store the fetched data (defaults to 'data')
     * @return array The original structure with fetched data mapped back
     */
    protected function mapFetchedDataToNestedStructure(array $originalData, array $fetchedData, string $targetField = 'data'): array
    {
        $result = $originalData;

        foreach ($fetchedData as $path => $data) {
            $this->setNestedValue($result, $path.'.'.$targetField, $data);
        }

        return $result;
    }

    /**
     * Set a value in a nested array using dot notation.
     *
     * @param  array  $array  Reference to the array to modify
     * @param  string  $path  Dot notation path where to set the value
     * @param  mixed  $value  Value to set
     */
    private function setNestedValue(array &$array, string $path, $value): void
    {
        $keys = explode('.', $path);
        $current = &$array;

        // Navigate to the parent of the final key
        for ($i = 0; $i < count($keys) - 1; $i++) {
            $key = $keys[$i];
            if (! isset($current[$key]) || ! is_array($current[$key])) {
                $current[$key] = [];
            }
            $current = &$current[$key];
        }

        // Set the final value
        $finalKey = end($keys);
        $current[$finalKey] = $value;
    }

    /**
     * Enhanced method to fetch and map nested URL data in a single operation.
     *
     * @param  array  $data  The input data structure
     * @param  array  $urlPaths  Array of dot notation paths to URL fields
     * @param  callable  $batchFetcher  Closure that accepts array of URLs and returns fetched data
     * @param  string  $targetField  Field name to store fetched data (defaults to 'data')
     * @return array The enhanced data structure with all URLs fetched and mapped
     */
    public function fetchAndMapNestedUrls(array $data, array $urlPaths, callable $batchFetcher, string $targetField = 'data'): array
    {
        $allUrls = [];
        $pathToOriginalKey = [];

        // Extract URLs from all specified paths
        foreach ($urlPaths as $urlPath) {
            $extractedUrls = $this->extractNestedUrls($data, $urlPath);
            foreach ($extractedUrls as $key => $url) {
                $uniqueKey = md5($url).'_'.$key;
                $allUrls[$uniqueKey] = $url;
                $pathToOriginalKey[$uniqueKey] = $key;
            }
        }

        // If no URLs found, return original data
        if (empty($allUrls)) {
            return $data;
        }

        // Fetch all URLs in batch using the provided closure
        $fetchedData = $batchFetcher($allUrls);

        // Remap data back using original path keys
        $remappedData = [];
        foreach ($fetchedData as $uniqueKey => $fetchedItem) {
            if (isset($pathToOriginalKey[$uniqueKey])) {
                $remappedData[$pathToOriginalKey[$uniqueKey]] = $fetchedItem;
            }
        }

        // Map the fetched data back to the original structure
        return $this->mapFetchedDataToNestedStructure($data, $remappedData, $targetField);
    }
}
