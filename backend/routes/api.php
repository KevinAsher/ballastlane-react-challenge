<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PokemonController;
use Illuminate\Support\Facades\Route;

// Authentication routes
Route::middleware(['web'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Protected routes that require authentication
Route::middleware(['web', 'auth.session'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    // Pokemon routes
    Route::get('/pokemon', [PokemonController::class, 'index']);
    Route::get('/pokemon/{identifier}', [PokemonController::class, 'show']);
    Route::get('/pokemon/{identifier}/enhanced', [PokemonController::class, 'enhanced']);

    // Pokemon detail tabs
    Route::get('/pokemon/{identifier}/overview', [PokemonController::class, 'overview']);
    Route::get('/pokemon/{identifier}/abilities', [PokemonController::class, 'abilities']);
    Route::get('/pokemon/{identifier}/moves', [PokemonController::class, 'moves']);
    Route::get('/pokemon/{identifier}/forms', [PokemonController::class, 'forms']);
});
