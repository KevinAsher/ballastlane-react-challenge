<?php

namespace App\Services\Mixins;

/**
 * Mixin for transforming PokeAPI data.
 */
trait PokeApiDataTransformations
{
    protected function transformBasicData(array $data): array
    {
        $sprite = $data['sprites']['other']['official-artwork']['front_default'] ?? $data['sprites']['front_default'];

        return [
            'id' => $data['id'],
            'name' => $data['name'],
            'height' => $data['height'],
            'weight' => $data['weight'],
            'base_experience' => $data['base_experience'],
            'types' => collect($data['types'])->pluck('type.name')->unique(),
            'stats' => collect($data['stats'])->map(function ($stat) {
                return [
                    'name' => $stat['stat']['name'],
                    'value' => $stat['base_stat'],
                ];
            })->toArray(),
            'sprites' => [
                'front_default' => $sprite,
            ],
            'species' => [
                'name' => $data['species']['name'],
            ],
        ];
    }

    protected function transformOverviewData(array $data): array
    {
        return [
            'id' => $data['id'],
            'name' => $data['name'],
            'height' => $data['height'],
            'weight' => $data['weight'],
            'base_experience' => $data['base_experience'],
            'types' => $data['types'],
        ];
    }

    protected function transformAbilitiesData(array $data, $dataKey = 'data'): array
    {
        $abilities = $data['abilities'] ?? [];
        $transformedAbilities = [];

        // Transform abilities with enhanced detail data
        foreach ($abilities as $ability) {
            // Check if detailed data was fetched for this ability
            $abilityData = [
                'name' => $ability['ability']['name'],
                'is_hidden' => $ability['is_hidden'],
            ];

            if (isset($ability['ability'][$dataKey])) {
                $abilityDetail = $ability['ability'][$dataKey];

                // Extract English effect
                $englishEffect = null;
                if (isset($abilityDetail['effect_entries'])) {
                    foreach ($abilityDetail['effect_entries'] as $entry) {
                        if ($entry['language']['name'] === 'en') {
                            $englishEffect = $entry['effect'];
                            break;
                        }
                    }
                }

                $abilityData = array_merge($abilityData, [
                    'effect' => $englishEffect,
                ]);
            }

            $transformedAbilities[] = $abilityData;
        }

        return $transformedAbilities;
    }

    protected function transformMovesData(array $data, $dataKey = 'data'): array
    {
        $moves = $data['moves'] ?? [];
        $transformedMoves = [];

        // Transform moves without grouping
        foreach ($moves as $move) {
            // filter only level-up details
            $versionGroupDetail = collect($move['version_group_details'])
                ->filter(fn($detail) => $detail['move_learn_method']['name'] === 'level-up')
                ->first();

            $moveData = [
                'name' => $move['move']['name'],
            ];
            
            if ($versionGroupDetail) {
                $moveData = array_merge($moveData, [
                    'level_learned_at' => $versionGroupDetail['level_learned_at'],
                    'learn_method' => $versionGroupDetail['move_learn_method']['name'],
                ]);
            }

            // Add detailed move information if available
            if (isset($move['move'][$dataKey])) {
                $moveDetail = $move['move'][$dataKey];

                // Extract English flavor text
                $englishDescription = null;
                if (isset($moveDetail['flavor_text_entries'])) {
                    foreach ($moveDetail['flavor_text_entries'] as $entry) {
                        if ($entry['language']['name'] === 'en') {
                            $englishDescription = $entry['flavor_text'];
                            break;
                        }
                    }
                }

                $moveData = array_merge($moveData, [
                    'power' => $moveDetail['power'],
                    'accuracy' => $moveDetail['accuracy'],
                    'pp' => $moveDetail['pp'],
                    'type' => $moveDetail['type']['name'] ?? null,
                    'damage_class' => $moveDetail['damage_class']['name'] ?? null,
                    'description' => $englishDescription,
                ]);
            }

            $transformedMoves[] = $moveData;
        }


        return collect($transformedMoves)->sortBy(function ($item) {
            return strtolower($item['name']);
        })->values()->toArray();
    }

    protected function transformFormsData(array $data, $dataKey = 'data'): array
    {
        $forms = $data['forms'] ?? [];
        $transformedForms = [];

        foreach ($forms as $form) {

            $formData = [
                'name' => $form['name'],
            ];

            if (isset($form[$dataKey])) {
                $formDetail = $form[$dataKey];

                $formData = array_merge($formData, [
                    'is_default' => $formDetail['is_default'],
                    'is_mega' => $formDetail['is_mega'],
                    'is_battle_only' => $formDetail['is_battle_only'],
                    'sprites' => [
                        'front_default' => $formDetail['sprites']['front_default'],
                    ],
                ]);
            }

            $transformedForms[] = $formData;
        }

        return $transformedForms;
    }
}
