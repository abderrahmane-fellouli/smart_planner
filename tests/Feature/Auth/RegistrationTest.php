<?php

use App\Notifications\Auth\VerifyEmail;
use Illuminate\Support\Facades\Notification;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register and receive a verification notification', function () {
    Notification::fake();

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice', absolute: false));

    // A verification notification must be sent to the new (unverified) user.
    Notification::assertSentTo(
        \App\Models\User::where('email', 'test@example.com')->first(),
        VerifyEmail::class
    );
});

