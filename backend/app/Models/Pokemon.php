<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pokemon extends Model
{
    use HasFactory;

    protected $table = 'pokemon';

    protected $fillable = [
        'pokemon_id',
        'name',
        'data',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
            'pokemon_id' => 'integer',
        ];
    }

    /**
     * Scope to search by name substring.
     */
    public function scopeSearch($query, string $name): void
    {
        $query->where('name', 'LIKE', '%'.$name.'%');
    }

    /**
     * Get slug derived from data.
     */
    public function getSlugAttribute(): string
    {
        return $this->data['name'] ?? $this->name;
    }

    /**
     * Get types derived from data.
     */
    public function getTypesAttribute(): array
    {
        if (! isset($this->data['types'])) {
            return [];
        }

        return collect($this->data['types'])->map(fn ($type) => $type['type']['name'])->toArray();
    }

    /**
     * Get sprite URL derived from data.
     */
    public function getSpriteUrlAttribute(): ?string
    {
        return $this->data['sprites']['front_default'] ?? null;
    }

    /**
     * Get minimal card data for listing.
     */
    public function getCardDataAttribute(): array
    {
        return [
            'id' => $this->pokemon_id,
            'name' => $this->name,
            'types' => $this->types,
            'sprite' => $this->sprite_url,
        ];
    }
}
