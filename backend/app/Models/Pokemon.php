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
        'slug',
        'types',
        'sprite_url',
        'data',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'types' => 'array',
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
