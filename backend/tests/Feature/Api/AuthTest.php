<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear rate limiter for each test
        RateLimiter::clear('login.127.0.0.1');
    }

    public function test_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'username' => 'admin',
                ],
            ]);

        // Check that session was created
        $this->assertNotNull(session('authenticated'));
        $this->assertTrue(session('authenticated'));
        $this->assertEquals(['username' => 'admin'], session('user'));
    }

    public function test_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'username' => 'wrong',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username'])
            ->assertJson([
                'errors' => [
                    'username' => ['The provided credentials are incorrect.'],
                ],
            ]);

        // Check that no session was created
        $this->assertNull(session('authenticated'));
    }

    public function test_login_validation_errors(): void
    {
        // Test missing username
        $response = $this->postJson('/api/login', [
            'password' => 'admin',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        // Test missing password
        $response = $this->postJson('/api/login', [
            'username' => 'admin',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Test empty credentials
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username', 'password']);
    }

    public function test_login_rate_limiting(): void
    {
        // Make 5 failed attempts
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'username' => 'wrong',
                'password' => 'wrong',
            ]);
        }

        // 6th attempt should be rate limited
        $response = $this->postJson('/api/login', [
            'username' => 'wrong',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        $errors = $response->json('errors.username');
        $this->assertStringContainsString('Too many login attempts', $errors[0]);
    }

    public function test_successful_login_clears_rate_limit(): void
    {
        // Make 4 failed attempts
        for ($i = 0; $i < 4; $i++) {
            $this->postJson('/api/login', [
                'username' => 'wrong',
                'password' => 'wrong',
            ]);
        }

        // Successful login should clear rate limit
        $response = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);

        $response->assertStatus(200);

        // Start new session for next test
        $this->startSession();

        // Should be able to make attempts again
        $response = $this->postJson('/api/login', [
            'username' => 'wrong',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);

        $errors = $response->json('errors.username');
        $this->assertEquals(['The provided credentials are incorrect.'], $errors);
    }

    public function test_me_endpoint_when_authenticated(): void
    {
        // Login first
        $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);

        $response = $this->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'username' => 'admin',
                ],
            ]);
    }

    public function test_me_endpoint_when_not_authenticated(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated',
            ]);
    }

    public function test_logout_when_authenticated(): void
    {
        // Login first
        $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);

        // Verify session exists
        $this->assertNotNull(session('authenticated'));

        // Logout
        $response = $this->postJson('/api/logout');

        $response->assertStatus(204);

        // Verify session was cleared
        $this->assertNull(session('authenticated'));
        $this->assertNull(session('user'));
    }

    public function test_logout_when_not_authenticated(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(204);
    }

    public function test_csrf_cookie_endpoint(): void
    {
        $response = $this->get('/sanctum/csrf-cookie');

        $response->assertStatus(204);

        // Check that CSRF cookie was set
        $response->assertCookie('XSRF-TOKEN');
    }

    public function test_protected_routes_require_authentication(): void
    {
        // Test Pokemon routes without authentication
        $response = $this->getJson('/api/pokemon');
        $response->assertStatus(401);

        $response = $this->getJson('/api/pokemon/pikachu');
        $response->assertStatus(401);
    }

    public function test_session_persistence_across_requests(): void
    {
        // Login
        $loginResponse = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);

        $loginResponse->assertStatus(200);

        // Make another request - should still be authenticated
        $meResponse = $this->getJson('/api/me');
        $meResponse->assertStatus(200);

        // Make a third request - should still be authenticated
        $anotherMeResponse = $this->getJson('/api/me');
        $anotherMeResponse->assertStatus(200)
            ->assertJson([
                'user' => [
                    'username' => 'admin',
                ],
            ]);
    }
}
