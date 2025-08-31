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
        $name = fake()->unique()->word();

        return [
            'name' => strtolower($name),
        ];
    }

    /**
     * Create a Pokemon with specific name.
     */
    public function withName(string $name): static
    {
        return $this->state(function (array $attributes) use ($name) {
            $attributes['name'] = $name;

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
                'name' => 'pikachu',
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
                'name' => 'charizard',
            ];
        });
    }
}
