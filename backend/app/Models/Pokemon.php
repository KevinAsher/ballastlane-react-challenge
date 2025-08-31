<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pokemon extends Model
{
    use HasFactory;

    protected $table = 'pokemon';

    public $timestamps = false;

    /**
     * Scope to search by name substring.
     */
    public function scopeSearch($query, string $name): void
    {
        $query->where('name', 'LIKE', '%'.$name.'%');
    }
}
