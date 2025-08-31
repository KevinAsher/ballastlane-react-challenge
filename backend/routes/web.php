<?php

use Illuminate\Support\Facades\Route;

// Serve the React app for all non-API routes
Route::get('/{any}', function () {
    return file_get_contents(public_path('app/index.html'));
})->where('any', '^(?!api).*$');
