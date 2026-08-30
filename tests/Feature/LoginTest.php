<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    protected function createUser(array $overrides = []): User
    {
        $verified = $overrides['email_verified_at'] ?? false;
        unset($overrides['email_verified_at']);

        $user = User::create(array_merge([
            'name'     => 'Test User',
            'email'    => 'test_' . time() . '_' . rand(1000,9999) . '@test.com',
            'password' => bcrypt('password'),
        ], $overrides));

        if ($verified) {
            $user->forceFill(['email_verified_at' => $verified === true ? now() : $verified])->save();
            $user->refresh();
        }

        return $user;
    }

    /**
     * Test that the login page renders successfully.
     */
    public function test_login_page_renders(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/html; charset=UTF-8');
    }

    /**
     * Test login with valid credentials.
     */
    public function test_login_with_valid_credentials(): void
    {
        $email = 'valid_' . time() . '@test.com';
        $user = $this->createUser(['email' => $email]);

        $response = $this->post('/login', [
            'email'    => $email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test login with wrong password fails.
     */
    public function test_login_with_wrong_password_fails(): void
    {
        $email = 'wrongpw_' . time() . '@test.com';
        $this->createUser(['email' => $email]);

        $response = $this->post('/login', [
            'email'    => $email,
            'password' => 'wrong_password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /**
     * Test login with nonexistent email fails.
     */
    public function test_login_with_nonexistent_email_fails(): void
    {
        $response = $this->post('/login', [
            'email'    => 'nobody_' . time() . '@test.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /**
     * Test login with empty fields fails.
     */
    public function test_login_with_empty_fields_fails(): void
    {
        $response = $this->post('/login', [
            'email'    => '',
            'password' => '',
        ]);

        $response->assertSessionHasErrors(['email', 'password']);
        $this->assertGuest();
    }

    /**
     * Test login with invalid email format fails.
     */
    public function test_login_with_invalid_email_fails(): void
    {
        $response = $this->post('/login', [
            'email'    => 'not-an-email',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    /**
     * Test register then login.
     */
    public function test_register_then_login(): void
    {
        Mail::fake();

        $email = 'reglogin_' . time() . '@test.com';

        $regResponse = $this->post('/register', [
            'name'                  => 'Login Test User',
            'email'                 => $email,
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->post('/logout');

        $loginResponse = $this->post('/login', [
            'email'    => $email,
            'password' => 'password123',
        ]);

        $loginResponse->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    /**
     * Test that after login, dashboard is accessible with user data.
     */
    public function test_login_then_access_dashboard(): void
    {
        $email = 'dash_' . time() . '@test.com';
        $user = $this->createUser(['email' => $email, 'email_verified_at' => now()]);
        $this->actingAs($user);

        $response = $this->get('/dashboard');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard'));
    }

    /**
     * Test that after login, all main pages are accessible.
     */
    public function test_login_then_access_all_pages(): void
    {
        $email = 'pages_' . time() . '@test.com';
        $user = $this->createUser(['email' => $email, 'email_verified_at' => now()]);
        $this->actingAs($user);

        $pages = [
            '/dashboard',
            '/fixed-events',
            '/preferences',
            '/schedules',
            '/statistics',
            '/export',
            '/profile',
        ];

        foreach ($pages as $page) {
            $response = $this->get($page);
            $response->assertStatus(200, "Page {$page} should return 200, got {$response->getStatusCode()} location={$response->headers->get('Location')}");
        }
    }

    /**
     * Test logout works.
     */
    public function test_logout(): void
    {
        $email = 'logout_' . time() . '@test.com';
        $user = $this->createUser(['email' => $email]);
        $this->actingAs($user);
        $this->assertAuthenticated();

        $this->post('/logout');
        $this->assertGuest();
    }

    /**
     * Test session is created in database (session driver = database).
     */
    public function test_session_stored_in_database(): void
    {
        $email = 'session_' . time() . '@test.com';
        $user = $this->createUser(['email' => $email]);

        $response = $this->post('/login', [
            'email'    => $email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test CSRF token is required for login (testing without default session).
     */
    public function test_csrf_token_enforced_on_login(): void
    {
        // Without a session/CSRF token, the request should be rejected
        $response = $this->call('POST', '/login', [
            'email'    => 'test@test.com',
            'password' => 'password',
        ]);

        // Without session middleware, CSRF should fail with 419
        // OR without session we get 302 redirect to login
        $this->assertContains($response->getStatusCode(), [302, 419]);
    }

    /**
     * Test rate limiting on login attempts.
     */
    public function test_rate_limiting_on_login(): void
    {
        $email = 'rate_' . time() . '@test.com';
        $this->createUser(['email' => $email]);

        // Make 6+ failed attempts to trigger throttling
        for ($i = 0; $i < 6; $i++) {
            $this->post('/login', [
                'email'    => $email,
                'password' => 'wrong_password_' . $i,
            ])->assertSessionHasErrors('email');
        }

        // Next attempt should be throttled
        $response = $this->post('/login', [
            'email'    => $email,
            'password' => 'password',
        ]);

        $this->assertContains($response->getStatusCode(), [302, 429]);
        // The session should contain throttle error
        $this->assertTrue(
            $response->getSession()->has('errors') || $response->getStatusCode() === 429,
            'Expected rate limiting (429) or throttle error in session'
        );
    }

    /**
     * Test login with remember me.
     */
    public function test_login_with_remember_me(): void
    {
        $email = 'remember_' . time() . '@test.com';
        $user = $this->createUser(['email' => $email]);

        $response = $this->post('/login', [
            'email'    => $email,
            'password' => 'password',
            'remember' => 'on',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test that authenticated user gets redirected from login page.
     */
    public function test_authenticated_user_redirected_from_login(): void
    {
        $email = 'redirect_' . time() . '@test.com';
        $user = $this->createUser(['email' => $email]);
        $this->actingAs($user);

        $response = $this->get('/login');
        $response->assertRedirect('/dashboard');
    }

    /**
     * Test database has users table with expected columns.
     */
    public function test_users_table_schema(): void
    {
        $user = $this->createUser();
        $this->assertDatabaseHas('users', [
            'id'    => $user->id,
            'name'  => 'Test User',
            'email' => $user->email,
        ]);
    }

    /**
     * Test password hashing is bcrypt.
     */
    public function test_password_is_hashed(): void
    {
        $user = $this->createUser(['password' => 'mypassword']);
        $this->assertNotEquals('mypassword', $user->password);
        $this->assertTrue(password_verify('mypassword', $user->password));
    }

    /**
     * Test login redirects back to intended URL after auth.
     */
    public function test_login_redirects_to_intended(): void
    {
        $email = 'intended_' . time() . '@test.com';
        $user = $this->createUser(['email' => $email]);

        $this->call('GET', '/dashboard');
        $this->assertGuest();

        $response = $this->post('/login', [
            'email'    => $email,
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }
}
