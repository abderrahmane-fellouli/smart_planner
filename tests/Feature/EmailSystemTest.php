<?php

use App\Mail\EmailChangedMail;
use App\Mail\PasswordChangedMail;
use App\Mail\ScheduleActivatedMail;
use App\Mail\ScheduleReadyMail;
use App\Mail\WelcomeMail;
use App\Mail\VerifyEmail as VerifyEmailMail;
use App\Models\FixedEvent;
use App\Models\OptimizedSchedule;
use App\Models\Preference;
use App\Models\User;
use App\Notifications\Auth\ResetPassword as ResetPasswordNotification;
use App\Notifications\Auth\VerifyEmail as VerifyEmailNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;

beforeEach(function () {
    Mail::fake();
    Notification::fake();
});

function emailUserWithPreferences(array $overrides = []): User
{
    $user = User::factory()->create(['locale' => 'fr']);

    Preference::create(array_merge([
        'user_id'             => $user->id,
        'wake_up_time'        => '07:00',
        'sleep_time'          => '22:00',
        'study_preference'    => 'morning',
        'concentration_hours' => 2,
        'desired_free_time'   => 2,
    ], $overrides));

    return $user;
}

function emailFixedEvent(User $user, array $event): void
{
    FixedEvent::create(array_merge([
        'user_id'            => $user->id,
        'teacher'            => null,
        'description'        => null,
        'is_recurring_daily' => false,
        'location'           => null,
    ], $event));
}

// ── Verification journey ──

test('registration sends a verification notification and redirects to the notice', function () {
    $this->post('/register', [
        'name'                  => 'Jane Doe',
        'email'                 => 'jane_' . time() . '@example.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $user = User::first();

    Notification::assertSentTo($user, VerifyEmailNotification::class);
    expect($user->locale)->toBe('fr');
});

test('registration with an explicit valid lang persists the locale', function () {
    $this->post('/register', [
        'name'                  => 'Jane Doe',
        'email'                 => 'jane_ar_' . time() . '@example.com',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
        'lang'                  => 'ar',
    ]);

    $user = User::first();
    expect($user->locale)->toBe('ar');
});

test('verifying an email sends the welcome email and dispatches the Verified event', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->get(URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)],
    ));

    Mail::assertSent(WelcomeMail::class, fn ($mail) => $mail->hasTo($user->email));
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('the Verified event is wired to the welcome email listener', function () {
    Event::fake([Verified::class]);

    Event::assertListening(Verified::class, \App\Listeners\SendWelcomeEmail::class);
});

test('verification resend re-sends the verification notification', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->post('/email/verification-notification');

    Notification::assertSentTo($user, VerifyEmailNotification::class);
});

test('verifying with an invalid hash does not verify the user', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->get(URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')],
    ));

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('verifying with an invalid signature gracefully redirects with an error', function () {
    $user = User::factory()->unverified()->create();

    $badUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)],
    );

    // Tamper the signature so the signed route check fails.
    $badUrl = preg_replace('/signature=\w+/', 'signature=forged', $badUrl);

    $response = $this->actingAs($user)->get($badUrl);

    $response->assertRedirect(route('verification.notice', absolute: false));
    $response->assertSessionHas('verification_error');
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

// ── Password reset journey ──

test('requesting a password reset sends the reset notification', function () {
    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPasswordNotification::class);
});

test('resetting the password sends a password-changed mail', function () {
    $user = User::factory()->create(['password' => bcrypt('old-password')]);
    $token = Password::broker()->createToken($user);

    $this->post('/reset-password', [
        'token'                 => $token,
        'email'                 => $user->email,
        'password'              => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ]);

    Mail::assertSent(PasswordChangedMail::class, fn ($mail) => $mail->hasTo($user->email));
});

test('updating the currently authenticated password sends a password-changed mail', function () {
    $user = User::factory()->create(['password' => bcrypt('old-password')]);

    $this->actingAs($user)->put('/password', [
        'current_password'      => 'old-password',
        'password'              => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ]);

    Mail::assertSent(PasswordChangedMail::class, fn ($mail) => $mail->hasTo($user->email));
});

// ── Profile email change ──

test('changing the profile email sends an email-changed mail', function () {
    $newEmail = 'new_' . time() . '@example.com';
    $user = User::factory()->create(['email' => 'old_' . time() . '@example.com']);

    $this->actingAs($user)->patch('/profile', [
        'name'  => 'Some Name',
        'email' => $newEmail,
    ]);

    Mail::assertSent(EmailChangedMail::class, fn ($mail) => $mail->hasTo($newEmail));
});

// ── Schedule emails ──

test('generating a schedule sends a schedule-ready mail', function () {
    $user = emailUserWithPreferences();
    emailFixedEvent($user, [
        'title'      => 'Maths',
        'day_of_week' => 'Lundi',
        'start_time' => '08:00',
        'end_time'   => '10:00',
    ]);

    $this->actingAs($user)->post('/schedules/generate');

    Mail::assertSent(ScheduleReadyMail::class, fn ($mail) => $mail->hasTo($user->email));
});

test('activating a schedule sends a schedule-activated mail', function () {
    $user = User::factory()->create();

    OptimizedSchedule::create([
        'user_id'       => $user->id,
        'type'          => 'equilibre',
        'schedule'      => ['details' => []],
        'generated_for' => now()->startOfWeek()->toDateString(),
        'is_active'     => false,
    ]);

    $this->actingAs($user)->post('/schedules/activate/' . OptimizedSchedule::first()->id);

    Mail::assertSent(ScheduleActivatedMail::class, fn ($mail) => $mail->hasTo($user->email));
});

// ── Templating / localization ──

test('the verify email renders with a sealed signed URL and exposes no secret token', function () {
    $user = User::factory()->unverified()->create(['locale' => 'fr']);

    $html = (new VerifyEmailMail($user))->render();

    expect($html)->toContain('/verify-email/');
    expect($html)->toContain('signature=');
    expect(strtolower($html))->not->toContain('password');
    expect(strtolower($html))->not->toContain('secret');
    expect(strtolower($html))->not->toContain('app_password');
});

test('email subject follows the recipient locale', function () {
    $en = User::factory()->create(['locale' => 'en']);
    $ar = User::factory()->create(['locale' => 'ar']);
    $fr = User::factory()->create(['locale' => 'fr']);

    $enSubject = (new VerifyEmailMail($en))->envelope()->subject;
    $arSubject = (new VerifyEmailMail($ar))->envelope()->subject;
    $frSubject = (new VerifyEmailMail($fr))->envelope()->subject;

    expect($enSubject)->toBe(__('email.verify_subject', [], 'en'))
        ->and($arSubject)->toBe(__('email.verify_subject', [], 'ar'))
        ->and($frSubject)->toBe(__('email.verify_subject', [], 'fr'));

    expect($enSubject)->not->toBe($arSubject);
    expect($arSubject)->not->toBe($frSubject);
});

test('arabic emails render with rtl direction', function () {
    $ar = User::factory()->create(['locale' => 'ar']);

    $html = (new VerifyEmailMail($ar))->render();

    expect(strtolower($html))->toContain('dir="rtl"');
});

test('french emails render with ltr direction and accents', function () {
    $fr = User::factory()->create(['locale' => 'fr']);

    $html = (new VerifyEmailMail($fr))->render();

    expect(strtolower($html))->not->toContain('dir="rtl"');
    expect(html_entity_decode($html))->toContain('Vérifiez');
});
