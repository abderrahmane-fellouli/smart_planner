<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

// ── Registration rate limiting (throttle:10,1 on POST /register) ──

test('normal registration still works', function () {
    Notification::fake();

    $response = $this->post('/register', [
        'name' => 'Throttle Test User',
        'email' => 'throttle-ok@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false));
    $this->assertDatabaseHas('users', ['email' => 'throttle-ok@example.com']);
});

test('repeated excessive registration attempts from same IP get throttled', function () {
    Notification::fake();

    // Complete 10 legitimate registrations (logging out after each so the
    // guest guard processes every attempt and the IP limiter accumulates).
    for ($i = 0; $i < 10; $i++) {
        $this->post('/register', [
            'name' => "User $i",
            'email' => "throttle-$i@example.com",
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        Auth::logout();
        $this->flushSession();
    }

    $response = $this->post('/register', [
        'name' => 'Blocked User',
        'email' => 'throttle-blocked@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    expect($response->status())->toBe(429);
    $this->assertDatabaseMissing('users', ['email' => 'throttle-blocked@example.com']);
});

test('throttled registration does not create additional users', function () {
    Notification::fake();

    for ($i = 0; $i < 10; $i++) {
        $this->post('/register', [
            'name' => "User $i",
            'email' => "throttle-count-$i@example.com",
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        Auth::logout();
        $this->flushSession();
    }

    $before = User::count();

    $this->post('/register', [
        'name' => 'Blocked Again',
        'email' => 'throttle-count-blocked@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    expect(User::count())->toBe($before);
});

test('throttled registration returns 429 and flashes a throttled notice', function () {
    Notification::fake();

    for ($i = 0; $i < 10; $i++) {
        $this->post('/register', [
            'name' => "User $i",
            'email' => "throttle-flash-$i@example.com",
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        Auth::logout();
        $this->flushSession();
    }

    $response = $this->post('/register', [
        'name' => 'Blocked Flash',
        'email' => 'throttle-flash-blocked@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(429);
    $response->assertSessionHas('throttled', true);
});

