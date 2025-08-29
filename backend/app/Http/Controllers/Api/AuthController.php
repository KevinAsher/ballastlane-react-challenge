<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $key = 'login.'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'username' => ["Too many login attempts. Please try again in {$seconds} seconds."],
            ]);
        }

        $credentials = $request->only(['username', 'password']);

        // For this demo, we only allow admin/admin (exact match)
        if (trim($credentials['username']) === 'admin' && trim($credentials['password']) === 'admin' &&
            $credentials['username'] === trim($credentials['username']) &&
            $credentials['password'] === trim($credentials['password'])) {
            // Create a fake user session
            $request->session()->put('authenticated', true);
            $request->session()->put('user', ['username' => 'admin']);

            RateLimiter::clear($key);

            return response()->json([
                'user' => ['username' => 'admin'],
            ]);
        }

        RateLimiter::hit($key, 60); // Lock for 60 seconds after failed attempt

        throw ValidationException::withMessages([
            'username' => ['The provided credentials are incorrect.'],
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        if (! $request->session()->get('authenticated')) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'user' => $request->session()->get('user'),
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->session()->flush();

        return response()->json(null, 204);
    }
}
