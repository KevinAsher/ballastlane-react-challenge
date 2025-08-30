<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pokemon', function (Blueprint $table) {
            $table->id();
            $table->integer('pokemon_id')->unique()->nullable(); // PokeAPI pokemon ID
            $table->string('name')->unique();
            $table->json('data')->nullable(); // Full PokeAPI response for caching
            $table->timestamps();

            $table->index(['name']);
            $table->index(['pokemon_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pokemon');
    }
};
