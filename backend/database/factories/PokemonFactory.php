<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pokemon>
 */
class PokemonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $pokemonId = fake()->unique()->numberBetween(1, 1000);
        $name = fake()->unique()->word();
        $types = fake()->randomElements(['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'], fake()->numberBetween(1, 2));

        return [
            'pokemon_id' => $pokemonId,
            'name' => strtolower($name),
            'slug' => strtolower($name),
            'types' => $types,
            'sprite_url' => fake()->imageUrl(96, 96, 'pokemon'),
            'data' => [
                'id' => $pokemonId,
                'name' => strtolower($name),
                'types' => collect($types)->map(fn ($type) => ['type' => ['name' => $type]])->toArray(),
                'sprites' => [
                    'front_default' => fake()->imageUrl(96, 96, 'pokemon'),
                    'back_default' => fake()->imageUrl(96, 96, 'pokemon'),
                ],
                'abilities' => [
                    [
                        'ability' => [
                            'name' => fake()->word(),
                            'url' => fake()->url(),
                        ],
                        'is_hidden' => fake()->boolean(),
                    ],
                ],
                'stats' => [
                    ['base_stat' => fake()->numberBetween(10, 100), 'stat' => ['name' => 'hp']],
                    ['base_stat' => fake()->numberBetween(10, 100), 'stat' => ['name' => 'attack']],
                    ['base_stat' => fake()->numberBetween(10, 100), 'stat' => ['name' => 'defense']],
                    ['base_stat' => fake()->numberBetween(10, 100), 'stat' => ['name' => 'special-attack']],
                    ['base_stat' => fake()->numberBetween(10, 100), 'stat' => ['name' => 'special-defense']],
                    ['base_stat' => fake()->numberBetween(10, 100), 'stat' => ['name' => 'speed']],
                ],
                'height' => fake()->numberBetween(1, 50),
                'weight' => fake()->numberBetween(1, 1000),
                'base_experience' => fake()->numberBetween(50, 300),
            ],
        ];
    }

    /**
     * Create a Pokemon with specific name.
     */
    public function withName(string $name): static
    {
        return $this->state(function (array $attributes) use ($name) {
            $attributes['name'] = $name;
            $attributes['slug'] = $name;
            $attributes['data']['name'] = $name;

            return $attributes;
        });
    }

    /**
     * Create a Pokemon with specific ID.
     */
    public function withId(int $id): static
    {
        return $this->state(function (array $attributes) use ($id) {
            $attributes['pokemon_id'] = $id;
            $attributes['data']['id'] = $id;

            return $attributes;
        });
    }

    /**
     * Create a Pokemon with specific types.
     */
    public function withTypes(array $types): static
    {
        return $this->state(function (array $attributes) use ($types) {
            $attributes['types'] = $types;
            $attributes['data']['types'] = collect($types)->map(fn ($type) => ['type' => ['name' => $type]])->toArray();

            return $attributes;
        });
    }

    /**
     * Create Pikachu for consistent testing.
     */
    public function pikachu(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'pokemon_id' => 25,
                'name' => 'pikachu',
                'slug' => 'pikachu',
                'types' => ['electric'],
                'sprite_url' => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
                'data' => [
                    'id' => 25,
                    'name' => 'pikachu',
                    'types' => [['type' => ['name' => 'electric']]],
                    'sprites' => [
                        'front_default' => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
                        'back_default' => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png',
                    ],
                    'abilities' => [
                        [
                            'ability' => [
                                'name' => 'static',
                                'url' => 'https://pokeapi.co/api/v2/ability/9/',
                            ],
                            'is_hidden' => false,
                        ],
                        [
                            'ability' => [
                                'name' => 'lightning-rod',
                                'url' => 'https://pokeapi.co/api/v2/ability/31/',
                            ],
                            'is_hidden' => true,
                        ],
                    ],
                    'stats' => [
                        ['base_stat' => 35, 'stat' => ['name' => 'hp']],
                        ['base_stat' => 55, 'stat' => ['name' => 'attack']],
                        ['base_stat' => 40, 'stat' => ['name' => 'defense']],
                        ['base_stat' => 50, 'stat' => ['name' => 'special-attack']],
                        ['base_stat' => 50, 'stat' => ['name' => 'special-defense']],
                        ['base_stat' => 90, 'stat' => ['name' => 'speed']],
                    ],
                    'height' => 4,
                    'weight' => 60,
                    'base_experience' => 112,
                ],
            ];
        });
    }

    /**
     * Create Charizard for testing.
     */
    public function charizard(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'pokemon_id' => 6,
                'name' => 'charizard',
                'slug' => 'charizard',
                'types' => ['fire', 'flying'],
                'sprite_url' => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
                'data' => [
                    'id' => 6,
                    'name' => 'charizard',
                    'types' => [
                        ['type' => ['name' => 'fire']],
                        ['type' => ['name' => 'flying']],
                    ],
                    'sprites' => [
                        'front_default' => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
                    ],
                    'abilities' => [
                        [
                            'ability' => [
                                'name' => 'blaze',
                                'url' => 'https://pokeapi.co/api/v2/ability/66/',
                            ],
                            'is_hidden' => false,
                        ],
                    ],
                    'stats' => [
                        ['base_stat' => 78, 'stat' => ['name' => 'hp']],
                        ['base_stat' => 84, 'stat' => ['name' => 'attack']],
                        ['base_stat' => 78, 'stat' => ['name' => 'defense']],
                        ['base_stat' => 109, 'stat' => ['name' => 'special-attack']],
                        ['base_stat' => 85, 'stat' => ['name' => 'special-defense']],
                        ['base_stat' => 100, 'stat' => ['name' => 'speed']],
                    ],
                    'height' => 17,
                    'weight' => 905,
                    'base_experience' => 267,
                ],
            ];
        });
    }
}
