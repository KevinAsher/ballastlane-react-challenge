<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\EnsureAuthenticated;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Session\Store;
use Mockery;
use Tests\TestCase;

class EnsureAuthenticatedTest extends TestCase
{
    private EnsureAuthenticated $middleware;

    protected function setUp(): void
    {
        parent::setUp();

        $this->middleware = new EnsureAuthenticated;
    }

    public function test_allows_authenticated_request(): void
    {
        $request = Request::create('/api/pokemon', 'GET');

        // Mock session with authenticated user
        $session = Mockery::mock(Store::class);
        $session->shouldReceive('get')
            ->with('authenticated')
            ->andReturn(true);

        $request->setLaravelSession($session);

        $next = function ($req) {
            return new Response('Success', 200);
        };

        $response = $this->middleware->handle($request, $next);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('Success', $response->getContent());
    }

    public function test_rejects_unauthenticated_request(): void
    {
        $request = Request::create('/api/pokemon', 'GET');

        // Mock session without authentication
        $session = Mockery::mock(Store::class);
        $session->shouldReceive('get')
            ->with('authenticated')
            ->andReturn(null);

        $request->setLaravelSession($session);

        $next = function ($req) {
            return new Response('Success', 200);
        };

        $response = $this->middleware->handle($request, $next);

        $this->assertEquals(401, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertEquals('Unauthenticated', $content['message']);
    }

    public function test_rejects_request_with_false_authentication(): void
    {
        $request = Request::create('/api/pokemon', 'GET');

        // Mock session with false authentication
        $session = Mockery::mock(Store::class);
        $session->shouldReceive('get')
            ->with('authenticated')
            ->andReturn(false);

        $request->setLaravelSession($session);

        $next = function ($req) {
            return new Response('Success', 200);
        };

        $response = $this->middleware->handle($request, $next);

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_passes_request_to_next_middleware_when_authenticated(): void
    {
        $request = Request::create('/api/pokemon', 'GET');

        $session = Mockery::mock(Store::class);
        $session->shouldReceive('get')
            ->with('authenticated')
            ->andReturn(true);

        $request->setLaravelSession($session);

        $nextCalled = false;
        $next = function ($req) use (&$nextCalled) {
            $nextCalled = true;

            return new Response('Next middleware called', 200);
        };

        $response = $this->middleware->handle($request, $next);

        $this->assertTrue($nextCalled);
        $this->assertEquals('Next middleware called', $response->getContent());
    }

    public function test_does_not_call_next_middleware_when_unauthenticated(): void
    {
        $request = Request::create('/api/pokemon', 'GET');

        $session = Mockery::mock(Store::class);
        $session->shouldReceive('get')
            ->with('authenticated')
            ->andReturn(null);

        $request->setLaravelSession($session);

        $nextCalled = false;
        $next = function ($req) use (&$nextCalled) {
            $nextCalled = true;

            return new Response('Should not be called', 200);
        };

        $response = $this->middleware->handle($request, $next);

        $this->assertFalse($nextCalled);
        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_returns_json_response(): void
    {
        $request = Request::create('/api/pokemon', 'GET');
        $request->headers->set('Accept', 'application/json');

        $session = Mockery::mock(Store::class);
        $session->shouldReceive('get')
            ->with('authenticated')
            ->andReturn(null);

        $request->setLaravelSession($session);

        $next = function ($req) {
            return new Response('Success', 200);
        };

        $response = $this->middleware->handle($request, $next);

        $this->assertEquals('application/json', $response->headers->get('Content-Type'));

        $content = json_decode($response->getContent(), true);
        $this->assertIsArray($content);
        $this->assertArrayHasKey('message', $content);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
