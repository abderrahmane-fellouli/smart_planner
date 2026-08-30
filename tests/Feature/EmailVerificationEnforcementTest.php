<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\Auth\VerifyEmail as VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationEnforcementTest extends TestCase
{
    use RefreshDatabase;

    // A. Unverified user is redirected to the verification notice (not the page).
    public function test_unverified_user_is_redirected_from_dashboard_to_verify_email(): void
    {
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        $response = $this->get('/dashboard');
        $response->assertRedirect('/verify-email');
    }

    // A'. Each protected application route blocks an unverified user.
    public function test_unverified_user_blocked_from_protected_routes(): void
    {
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        $protected = [
            '/dashboard',
            '/profile',
            '/preferences',
            '/calendar',
            '/schedules',
            '/statistics',
            '/export',
            '/fixed-events',
            '/todos',
            '/sleep-schedule',
            '/search',
        ];

        foreach ($protected as $route) {
            $response = $this->get($route);
            $this->assertEquals(302, $response->getStatusCode(), "Unverified user should be redirected from {$route}");
            $this->assertEquals('/verify-email', parse_url($response->headers->get('Location'), PHP_URL_PATH), "{$route} should redirect to verify-email");
        }
    }

    // A''. Unverified user is blocked from POST application endpoints too (server-side).
    public function test_unverified_user_blocked_from_post_endpoints(): void
    {
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        foreach (['/todos', '/preferences', '/tutorial/state'] as $route) {
            $response = $this->post($route, ['_token' => csrf_token()]);
            $this->assertEquals(302, $response->getStatusCode(), "Unverified POST {$route} should redirect");
            $this->assertEquals('/verify-email', parse_url($response->headers->get('Location'), PHP_URL_PATH), "{$route} should redirect to verify-email");
        }
    }

    // B. Verified user reaches the dashboard.
    public function test_verified_user_can_access_dashboard(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get('/dashboard');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard'));
    }

    // F. Verified user reaches other protected routes.
    public function test_verified_user_can_access_protected_routes(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $protected = [
            '/dashboard',
            '/profile',
            '/preferences',
            '/calendar',
            '/schedules',
            '/statistics',
            '/export',
            '/fixed-events',
            '/todos',
            '/sleep-schedule',
        ];

        foreach ($protected as $route) {
            $response = $this->get($route);
            $this->assertEquals(200, $response->getStatusCode(), "Verified user should access {$route}");
        }
    }

    // C. Verification notice stays accessible to unverified users.
    public function test_unverified_user_can_access_verification_notice(): void
    {
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        $this->get('/verify-email')->assertStatus(200);
    }

    // C'. Verified user is redirected away from the notice to the dashboard.
    public function test_verified_user_redirected_from_verification_notice_to_dashboard(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->get('/verify-email')->assertRedirect('/dashboard');
    }

    // D. Unverified user can open the signed verification URL and become verified.
    public function test_unverified_user_can_verify_via_signed_url(): void
    {
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        $response = $this->get($url);
        $response->assertRedirect('/dashboard?verified=1');
        $this->assertNotNull($user->fresh()->email_verified_at);

        // now the dashboard is reachable
        $this->get('/dashboard')->assertStatus(200);
    }

    // E. Unverified user can request a resend; the notification is sent.
    public function test_unverified_user_can_resend_verification_email(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        $response = $this->post('/email/verification-notification');
        $response->assertStatus(302);
        $response->assertSessionHas('success');
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    // E'. Unverified user cannot be sent to an infinite loop; resend targets notice.
    public function test_resend_stays_on_notice_for_unverified_user(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $this->actingAs($user);

        $response = $this->post('/email/verification-notification');
        $path = parse_url($response->headers->get('Location'), PHP_URL_PATH);
        $this->assertNotEquals('/dashboard', $path, 'Unverified user should not be redirected to dashboard');
    }
}
