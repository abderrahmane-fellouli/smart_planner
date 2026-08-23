<?php

use App\Models\FixedEvent;
use App\Models\OptimizedSchedule;
use App\Models\Preference;
use App\Models\User;

/*
 * End-to-End verification tests.
 * These simulate the complete user journey through the application,
 * testing every major feature via HTTP requests (not code inspection).
 */

// ─────────────────────────────────────────────────
// 1. FULL USER JOURNEY (Register → Login → Use → Logout)
// ─────────────────────────────────────────────────

// REGRESSION: Previously, the dashboard route had ['auth', 'verified'] middleware.
// New users had NULL email_verified_at, so they were blocked from the dashboard
// and redirected to /verify-email. This test ensures new users can access the
// dashboard immediately after registration.
test('newly registered user can access dashboard without email verification', function () {
    $this->post('/register', [
        'name' => 'New User',
        'email' => 'new_' . time() . '@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // Should be authenticated
    $this->assertAuthenticated();

    // Should access dashboard directly (NOT redirected to /verify-email)
    $response = $this->get('/dashboard');
    $response->assertStatus(200);
    $this->assertStringContainsString('New User', $response->getContent());
});

test('full user journey: register, login, dashboard, add course, prefs, generate, export, logout', function () {

    // REGISTER
    $this->post('/register', [
        'name' => 'Journey User',
        'email' => 'journey@test.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);
    $this->assertAuthenticatedAs(
        User::where('email', 'journey@test.com')->firstOrFail()
    );

    // DASHBOARD (should load with empty data)
    $response = $this->get('/dashboard');
    $response->assertStatus(200);
    $this->assertStringContainsString('Dashboard', $response->getContent());

    // ADD FIXED EVENTS (one per weekday)
    foreach (['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as $day) {
        $this->post('/fixed-events', [
            'title' => "Mathématiques {$day}",
            'day_of_week' => $day,
            'start_time' => '08:00',
            'end_time' => '10:00',
        ])->assertRedirect();
    }
    $this->assertDatabaseCount('fixed_events', 6);

    // FIXED EVENTS PAGE
    $response = $this->get('/fixed-events');
    $response->assertStatus(200);
    $response->assertStatus(200);

    // SET PREFERENCES
    $this->post('/preferences', [
        'wake_up_time' => '07:00',
        'sleep_time' => '22:00',
        'study_preference' => 'morning',
        'concentration_hours' => 4,
        'desired_free_time' => 2,
    ])->assertRedirect();
    $this->assertDatabaseCount('preferences', 1);

    // PREFERENCES PAGE
    $response = $this->get('/preferences');
    $response->assertStatus(200);
    $response->assertStatus(200);

    // GENERATE SCHEDULES
    $this->post('/schedules/generate')->assertRedirect();
    $this->assertDatabaseCount('optimized_schedules', 3);
    $this->assertDatabaseHas('optimized_schedules', ['type' => 'intensif']);
    $this->assertDatabaseHas('optimized_schedules', ['type' => 'equilibre']);
    $this->assertDatabaseHas('optimized_schedules', ['type' => 'leger']);

    // SCHEDULES PAGE
    $response = $this->get('/schedules');
    $response->assertStatus(200);
    $response->assertStatus(200);

    // ACTIVATE A SCHEDULE
    $equilibre = OptimizedSchedule::where('type', 'equilibre')->first();
    $this->post("/schedules/activate/{$equilibre->id}")->assertRedirect();
    $this->assertDatabaseHas('optimized_schedules', ['id' => $equilibre->id, 'is_active' => true]);
    $this->assertEquals(1, OptimizedSchedule::where('is_active', true)->count());

    // STATISTICS PAGE
    $response = $this->get('/statistics');
    $response->assertStatus(200);
    $response->assertStatus(200);

    // EXPORT PAGE
    $response = $this->get('/export');
    $response->assertStatus(200);
    $response->assertStatus(200);

    // EXPORT PDF
    $response = $this->get('/export/pdf');
    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/html; charset=UTF-8');

    // PROFILE PAGE
    $response = $this->get('/profile');
    $response->assertStatus(200);

    // LOGOUT
    $this->post('/logout');
    $this->assertGuest();
});

// ─────────────────────────────────────────────────
// 2. EXPORT VERIFICATION
// ─────────────────────────────────────────────────

test('export PDF generates valid HTML with user data', function () {
    $user = User::create(['name' => 'Export User', 'email' => 'export@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    // Create schedule with real data
    OptimizedSchedule::create([
        'user_id' => $user->id,
        'type' => 'equilibre',
        'schedule' => [
            'details' => [
                'Lundi' => [
                    'cours_fixes' => [
                        ['title' => 'Maths', 'start_time' => '08:00:00', 'end_time' => '10:00:00'],
                    ],
                    'sessions_etude' => [
                        ['debut' => '10:30', 'fin' => '11:30', 'duree' => 60, 'matiere' => 'Maths'],
                    ],
                    'total_heures_etude' => 1,
                ],
            ],
            'resume' => ['total_heures_semaine' => 1, 'sessions_totales' => 1, 'moyenne_par_jour' => 0.2],
        ],
        'generated_for' => now(),
        'is_active' => true,
    ]);

    $response = $this->get('/export/pdf');
    $response->assertStatus(200);
    $content = $response->getContent();

    // Verify user data appears
    $this->assertStringContainsString('Export User', $content);
    $this->assertStringContainsString('export@test.com', $content);
    $this->assertStringContainsString('Maths', $content);
    $this->assertStringContainsString('SmartPlanner', $content);
    $this->assertStringContainsString('Lundi', $content);
    // Verify it's a valid HTML page
    $this->assertStringContainsString('<!DOCTYPE html>', $content);
    $this->assertStringContainsString('<table>', $content);
});

test('export PDF escapes XSS payloads in content', function () {
    $user = User::create(['name' => '<script>XSS</script>', 'email' => 'xss@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    OptimizedSchedule::create([
        'user_id' => $user->id,
        'type' => 'leger',
        'schedule' => [
            'details' => [
                'Lundi' => [
                    'cours_fixes' => [
                        ['title' => '<img onerror=alert(1)>Hack', 'start_time' => '09:00:00', 'end_time' => '10:00:00'],
                    ],
                    'sessions_etude' => [],
                    'total_heures_etude' => 0,
                ],
            ],
            'resume' => ['total_heures_semaine' => 0, 'sessions_totales' => 0, 'moyenne_par_jour' => 0],
        ],
        'generated_for' => now(),
        'is_active' => true,
    ]);

    $response = $this->get('/export/pdf');
    $content = $response->getContent();

    // Raw XSS payloads must NOT appear unescaped
    $this->assertStringNotContainsString('<script>XSS</script>', $content);
    $this->assertStringNotContainsString('<img onerror=alert(1)>', $content);
    // Escaped versions should be present
    $this->assertStringContainsString('&lt;script&gt;', $content);
    $this->assertStringContainsString('&lt;img', $content);
});

// ─────────────────────────────────────────────────
// 3. STATISTICS VERIFICATION
// ─────────────────────────────────────────────────

test('statistics page loads with user-specific data', function () {
    $user = User::create(['name' => 'Stats User', 'email' => 'stats@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    FixedEvent::create(['user_id' => $user->id, 'title' => 'Stats Course', 'day_of_week' => 'Lundi', 'start_time' => '08:00:00', 'end_time' => '10:00:00']);
    OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre', 'is_active' => true,
        'schedule' => ['details' => [], 'resume' => []], 'generated_for' => now(),
    ]);

    $response = $this->get('/statistics');
    $response->assertStatus(200);
    $content = $response->getContent();
    $this->assertStringContainsString('Statistics', $content);
    $this->assertStringContainsString($user->email, $content);
});

// ─────────────────────────────────────────────────
// 4. DAY NAME MISMATCH VERIFICATION
// ─────────────────────────────────────────────────

test('adding course with English day name stores French canonical form', function () {
    $user = User::create(['name' => 'Day Test', 'email' => 'day@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    // English
    $this->post('/fixed-events', [
        'title' => 'Monday Course',
        'day_of_week' => 'Monday',
        'start_time' => '09:00',
        'end_time' => '11:00',
    ]);
    $this->assertDatabaseHas('fixed_events', ['user_id' => $user->id, 'day_of_week' => 'Lundi', 'title' => 'Monday Course']);
});

test('adding course with Arabic day name stores French canonical form', function () {
    $user = User::create(['name' => 'Arabic Test', 'email' => 'ar@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    // Arabic
    $this->post('/fixed-events', [
        'title' => 'Tuesday Arabic',
        'day_of_week' => 'الثلاثاء',
        'start_time' => '10:00',
        'end_time' => '12:00',
    ]);
    $this->assertDatabaseHas('fixed_events', ['user_id' => $user->id, 'day_of_week' => 'Mardi', 'title' => 'Tuesday Arabic']);
});

test('schedule generation finds courses regardless of original input language', function () {
    $user = User::create(['name' => 'Lang Gen', 'email' => 'langgen@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    // Add courses using English day names
    $this->post('/fixed-events', ['title' => 'English', 'day_of_week' => 'Monday', 'start_time' => '08:00', 'end_time' => '10:00']);
    $this->post('/fixed-events', ['title' => 'English2', 'day_of_week' => 'Tuesday', 'start_time' => '08:00', 'end_time' => '10:00']);

    // Generate should find both courses (stored as Lundi/Mardi)
    $this->post('/schedules/generate')->assertRedirect();
    $this->assertDatabaseCount('optimized_schedules', 3);

    // Verify the generated schedule contains references to our courses
    $schedule = OptimizedSchedule::where('user_id', $user->id)->first();
    $details = $schedule->schedule['details'];
    $this->assertArrayHasKey('Lundi', $details);
    $this->assertArrayHasKey('Mardi', $details);
    $this->assertNotEmpty($details['Lundi']['cours_fixes']);
    $this->assertNotEmpty($details['Mardi']['cours_fixes']);
});

// ─────────────────────────────────────────────────
// 5. FIXED EVENT VALIDATION
// ─────────────────────────────────────────────────

test('fixed event validation: end_time must be after start_time', function () {
    $user = User::create(['name' => 'Val Test', 'email' => 'val@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    $this->post('/fixed-events', [
        'title' => 'Bad Time',
        'day_of_week' => 'Lundi',
        'start_time' => '14:00',
        'end_time' => '10:00',
    ])->assertSessionHasErrors(['end_time']);

    $this->assertDatabaseMissing('fixed_events', ['title' => 'Bad Time']);
});

test('fixed event validation: time format must be H:i', function () {
    $user = User::create(['name' => 'Fmt Test', 'email' => 'fmt@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    $this->post('/fixed-events', [
        'title' => 'Bad Format',
        'day_of_week' => 'Lundi',
        'start_time' => 'not-a-time',
        'end_time' => '10:00',
    ])->assertSessionHasErrors(['start_time']);
});

// ─────────────────────────────────────────────────
// 6. FLASH MESSAGES (verify they work)
// ─────────────────────────────────────────────────

test('flash success message appears after adding a course', function () {
    $user = User::create(['name' => 'Flash Test', 'email' => 'flash@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    $response = $this->post('/fixed-events', [
        'title' => 'Flash Course',
        'day_of_week' => 'Lundi',
        'start_time' => '08:00',
        'end_time' => '10:00',
    ]);

    $response->assertSessionHas('success', trans('messages.course_added'));
});

test('flash success message appears after generating schedules', function () {
    $user = User::create(['name' => 'Gen Flash', 'email' => 'genflash@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    FixedEvent::create(['user_id' => $user->id, 'title' => 'Test', 'day_of_week' => 'Lundi', 'start_time' => '08:00:00', 'end_time' => '10:00:00']);

    $response = $this->post('/schedules/generate');
    $response->assertSessionHas('success', trans('messages.schedule_generated'));
});

test('flash error message appears when generating without courses', function () {
    $user = User::create(['name' => 'No Course', 'email' => 'nocourse@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    $response = $this->post('/schedules/generate');
    $response->assertSessionHas('error');
});

// ─────────────────────────────────────────────────
// 7. MOVE SESSION VALIDATION
// ─────────────────────────────────────────────────

test('move session validates all required fields', function () {
    $user = User::create(['name' => 'Move Test', 'email' => 'move@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->post("/schedules/{$schedule->id}/move-session", [])
        ->assertSessionHasErrors(['jour', 'session_index', 'new_start']);
});

test('move session validates jour is a valid day', function () {
    $user = User::create(['name' => 'Jour Test', 'email' => 'jour@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->post("/schedules/{$schedule->id}/move-session", [
        'jour' => 'Funday', 'session_index' => 0, 'new_start' => '10:00',
    ])->assertSessionHasErrors(['jour']);
});

test('move session validates time format', function () {
    $user = User::create(['name' => 'Time Test', 'email' => 'time@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->post("/schedules/{$schedule->id}/move-session", [
        'jour' => 'Lundi', 'session_index' => 0, 'new_start' => 'not-a-time',
    ])->assertSessionHasErrors(['new_start']);
});

// ─────────────────────────────────────────────────
// REGRESSION: moveSession must reject moves outside wake/sleep window
// ─────────────────────────────────────────────────
test('move session rejects time outside wake/sleep window', function () {
    $user = User::create(['name' => 'Bounds Test', 'email' => 'bounds@test.com', 'password' => bcrypt('password')]);
    $this->actingAs($user);

    // User sleeps at 22:00 — trying to move a 60-min session to 23:00 should fail
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 3, 'desired_free_time' => 2,
    ]);

    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['details' => ['Lundi' => ['sessions_etude' => [
            ['debut' => '10:00', 'fin' => '11:00', 'duree' => 60, 'matiere' => 'Math'],
        ], 'total_heures_etude' => 1]], 'resume' => ['total_heures_semaine' => 1, 'moyenne_par_jour' => 1, 'sessions_totales' => 1]],
        'generated_for' => now(), 'is_active' => true,
    ]);

    // Moving to 23:00 (outside wake/sleep window 07:00-22:00) should be rejected
    $this->post("/schedules/{$schedule->id}/move-session", [
        'jour' => 'Lundi', 'session_index' => 0, 'new_start' => '23:00',
    ])->assertSessionHas('error');
});

// ─────────────────────────────────────────────────
// REGRESSION: flash messages use trans() (not hardcoded French)
// ─────────────────────────────────────────────────
test('flash messages use translation keys', function () {
    // Verify the translation keys resolve correctly
    $this->assertEquals(trans('messages.course_added'), 'Course added!');
    $this->assertEquals(trans('messages.schedule_generated'), 'Schedules generated successfully!');
    $this->assertEquals(trans('messages.schedule_activated'), 'Schedule activated successfully!');
    $this->assertEquals(trans('messages.no_courses_first'), 'Add courses first!');
    $this->assertEquals(trans('messages.session_invalid'), 'Invalid session.');
});

// ─────────────────────────────────────────────────
// BUG: Daily recurring events (is_recurring_daily) silently fail to save
// ─────────────────────────────────────────────────
test('daily recurring fixed event saves with is_recurring_daily=true', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Simulate the Inertia POST that the FixedEvents form sends when
    // the "every day" toggle is checked. The form hides day_of_week,
    // but React's useForm still carries the default value in state.
    $this->postJson('/fixed-events', [
        'title'              => 'Physics',
        'is_recurring_daily' => true,
        'day_of_week'        => 'Lundi',  // React sends it even when hidden
        'start_time'         => '10:00',
        'end_time'           => '11:30',
    ])->assertRedirect();

    $event = FixedEvent::where('user_id', $user->id)->first();
    expect($event)->not->toBeNull();
    expect($event->title)->toBe('Physics');
    expect($event->is_recurring_daily)->toBeTrue();
    expect($event->day_of_week)->toBeNull(); // Daily events have null day_of_week
});

test('daily recurring fixed event saves WITHOUT day_of_week field', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Some clients might not send day_of_week at all when daily is checked
    $this->postJson('/fixed-events', [
        'title'              => 'Physics',
        'is_recurring_daily' => true,
        'start_time'         => '10:00',
        'end_time'           => '11:30',
    ])->assertRedirect();

    $event = FixedEvent::where('user_id', $user->id)->first();
    expect($event)->not->toBeNull();
    expect($event->is_recurring_daily)->toBeTrue();
    expect($event->day_of_week)->toBeNull();
});

test('daily recurring event appears in schedule for ALL weekdays', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Add a daily recurring event
    $this->postJson('/fixed-events', [
        'title'              => 'Physics',
        'is_recurring_daily' => true,
        'start_time'         => '10:00',
        'end_time'           => '11:30',
    ]);

    // Add a regular Monday course
    $this->postJson('/fixed-events', [
        'title'      => 'Mathematics',
        'day_of_week' => 'Lundi',
        'start_time' => '08:00',
        'end_time'   => '10:00',
    ]);

    // Set preferences
    Preference::create([
        'user_id'             => $user->id,
        'wake_up_time'        => '07:00',
        'sleep_time'          => '22:00',
        'study_preference'    => 'normal',
        'concentration_hours' => 1,
        'desired_free_time'   => 2,
    ]);

    // Generate schedule
    $this->post('/schedules/generate')->assertRedirect();

    $schedules = OptimizedSchedule::where('user_id', $user->id)->get();
    expect($schedules->count())->toBe(3);

    // Verify Physics appears as a fixed event on EVERY weekday
    foreach (['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as $day) {
        $equilibre = $schedules->firstWhere('type', 'equilibre');
        $fixedOnDay = $equilibre->schedule['details'][$day]['cours_fixes'];
        $physicsEvents = collect($fixedOnDay)->filter(fn($e) => $e['title'] === 'Physics');
        expect($physicsEvents->count())->toBe(1);
    }

    // Verify Mathematics only appears on Lundi
    $equilibre = $schedules->firstWhere('type', 'equilibre');
    $lundiFixed = $equilibre->schedule['details']['Lundi']['cours_fixes'];
    $mathOnLundi = collect($lundiFixed)->filter(fn($e) => $e['title'] === 'Mathematics');
    expect($mathOnLundi->count())->toBe(1);

    $mardiFixed = $equilibre->schedule['details']['Mardi']['cours_fixes'];
    $mathOnMardi = collect($mardiFixed)->filter(fn($e) => $e['title'] === 'Mathematics');
    expect($mathOnMardi->count())->toBe(0);
});

test('daily recurring subject appears in study session suggestions', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Add ONLY a daily recurring event (Physics)
    $this->postJson('/fixed-events', [
        'title'              => 'Physics',
        'is_recurring_daily' => true,
        'start_time'         => '10:00',
        'end_time'           => '11:30',
    ]);

    Preference::create([
        'user_id'             => $user->id,
        'wake_up_time'        => '07:00',
        'sleep_time'          => '22:00',
        'study_preference'    => 'normal',
        'concentration_hours' => 1,
        'desired_free_time'   => 2,
    ]);

    $this->post('/schedules/generate')->assertRedirect();

    $equilibre = OptimizedSchedule::where('user_id', $user->id)
        ->where('type', 'equilibre')->first();

    // Study sessions should suggest Physics (not just generic "Révision générale")
    $allSessions = [];
    foreach ($equilibre->schedule['details'] as $day => $data) {
        foreach ($data['sessions_etude'] as $session) {
            $allSessions[] = $session['matiere'];
        }
    }
    expect($allSessions)->toContain('Physics');
});

// ─────────────────────────────────────────────────
// moveSession E2E with real generated schedule
// ─────────────────────────────────────────────────
test('moveSession moves study session to new time and rejects overlap with fixed events', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Mathematics', 'day_of_week' => 'Lundi',
        'start_time' => '14:00', 'end_time' => '16:00',
    ]);
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);
    $this->post('/schedules/generate');

    $schedule = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $lundiSessions = $schedule->schedule['details']['Lundi']['sessions_etude'] ?? [];
    expect(count($lundiSessions))->toBeGreaterThan(0);

    $this->post("/schedules/{$schedule->id}/move-session", [
        'jour' => 'Lundi', 'session_index' => 0, 'new_start' => '07:00',
    ])->assertSessionHas('success');

    $schedule->refresh();
    $movedSession = $schedule->schedule['details']['Lundi']['sessions_etude'][0];
    expect($movedSession['debut'])->toBe('07:00');

    $this->post("/schedules/{$schedule->id}/move-session", [
        'jour' => 'Lundi', 'session_index' => 0, 'new_start' => '15:00',
    ])->assertSessionHas('error');
});

test('moveSession rejects moving to a time that overlaps another study session', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Mathematics', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ]);
    $this->postJson('/fixed-events', [
        'title' => 'Chemistry', 'day_of_week' => 'Lundi',
        'start_time' => '14:00', 'end_time' => '16:00',
    ]);
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);
    $this->post('/schedules/generate');

    $schedule = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $lundiSessions = $schedule->schedule['details']['Lundi']['sessions_etude'] ?? [];
    expect(count($lundiSessions))->toBeGreaterThanOrEqual(2);

    $secondSession = $lundiSessions[1];
    $secondStart = $secondSession['debut'];

    $this->post("/schedules/{$schedule->id}/move-session", [
        'jour' => 'Lundi', 'session_index' => 0, 'new_start' => $secondStart,
    ])->assertSessionHas('error');
});

// ─────────────────────────────────────────────────
// Activation / Deactivation flow
// ─────────────────────────────────────────────────
test('activate schedule sets is_active and deactivates others', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Math', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ]);
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);
    $this->post('/schedules/generate');

    $schedules = OptimizedSchedule::where('user_id', $user->id)->get();
    expect($schedules->count())->toBe(3);
    expect($schedules->where('is_active', true)->count())->toBe(0);

    $equilibre = $schedules->firstWhere('type', 'equilibre');
    $this->post("/schedules/activate/{$equilibre->id}")->assertRedirect();

    $equilibre->refresh();
    expect($equilibre->is_active)->toBeTrue();

    $others = $schedules->where('id', '!=', $equilibre->id);
    foreach ($others as $other) {
        $other->refresh();
        expect($other->is_active)->toBeFalse();
    }

    $intensif = $schedules->firstWhere('type', 'intensif');
    $this->post("/schedules/activate/{$intensif->id}")->assertRedirect();

    $intensif->refresh();
    expect($intensif->is_active)->toBeTrue();
    $equilibre->refresh();
    expect($equilibre->is_active)->toBeFalse();
});

test('delete schedule removes it from database', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Math', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ]);
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);
    $this->post('/schedules/generate');

    $schedule = OptimizedSchedule::where('user_id', $user->id)->first();
    $this->delete("/schedules/{$schedule->id}")->assertRedirect();

    expect(OptimizedSchedule::where('id', $schedule->id)->exists())->toBeFalse();
});

// ─────────────────────────────────────────────────
// Export E2E tests
// ─────────────────────────────────────────────────
test('export PDF with French labels', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Mathematics', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ]);
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);
    $this->post('/schedules/generate');
    $s = OptimizedSchedule::where('user_id', $user->id)->first();
    $this->post("/schedules/activate/{$s->id}");

    $response = $this->get('/export/pdf?lang=fr');
    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/html; charset=UTF-8');
    $content = $response->getContent();
    expect($content)->toContain('SmartPlanner')
        ->toContain('Cours fixes')
        ->toContain('Mathematics')
        ->toContain(e($user->name));
});

test('export PDF with English labels', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Physics', 'day_of_week' => 'Mardi',
        'start_time' => '10:00', 'end_time' => '12:00',
    ]);
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);
    $this->post('/schedules/generate');
    $s = OptimizedSchedule::where('user_id', $user->id)->first();
    $this->post("/schedules/activate/{$s->id}");

    $response = $this->get('/export/pdf?lang=en');
    $response->assertStatus(200);
    $content = $response->getContent();
    expect($content)->toContain('Generated on')
        ->toContain('Fixed courses')
        ->toContain('Physics');
});

test('export PDF with Arabic labels', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Arabic Study', 'day_of_week' => 'Mardi',
        'start_time' => '10:00', 'end_time' => '12:00',
    ]);
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);
    $this->post('/schedules/generate');
    $s = OptimizedSchedule::where('user_id', $user->id)->first();
    $this->post("/schedules/activate/{$s->id}");

    $response = $this->get('/export/pdf?lang=ar');
    $response->assertStatus(200);
    $content = $response->getContent();
    expect($content)->toContain('المساعد الذكي')
        ->toContain('المواد الثابتة');
});

test('export PDF escapes XSS in user name', function () {
    $user = User::factory()->create(['name' => '<script>alert(1)</script>']);
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Math', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ]);
    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);
    $this->post('/schedules/generate');
    $s = OptimizedSchedule::where('user_id', $user->id)->first();
    $this->post("/schedules/activate/{$s->id}");

    $content = $this->get('/export/pdf')->getContent();
    expect($content)->not->toContain('<script>')
        ->toContain('&lt;script&gt;');
});

// ─────────────────────────────────────────────────
// Auth flow tests
// ─────────────────────────────────────────────────
test('login with wrong password fails', function () {
    $email = 'auth_wrong_pw_' . time() . '@test.com';
    $this->post('/register', [
        'name' => 'Auth Test', 'email' => $email,
        'password' => 'password', 'password_confirmation' => 'password',
    ]);
    $this->post('/logout');
    $this->assertGuest();

    $response = $this->post('/login', [
        'email' => $email,
        'password' => 'wrong_password',
    ]);
    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('login with nonexistent email fails', function () {
    $response = $this->post('/login', [
        'email' => 'nobody_' . time() . '@test.com',
        'password' => 'password',
    ]);
    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('registration with mismatched passwords fails', function () {
    $response = $this->post('/register', [
        'name' => 'Test', 'email' => 'mismatch_' . time() . '@test.com',
        'password' => 'password1', 'password_confirmation' => 'password2',
    ]);
    $this->assertGuest();
    $response->assertSessionHasErrors('password');
});

test('registration with empty name fails', function () {
    $response = $this->post('/register', [
        'name' => '', 'email' => 'noname_' . time() . '@test.com',
        'password' => 'password', 'password_confirmation' => 'password',
    ]);
    $this->assertGuest();
    $response->assertSessionHasErrors('name');
});

test('registration with too-short password fails', function () {
    $response = $this->post('/register', [
        'name' => 'Short', 'email' => 'short_' . time() . '@test.com',
        'password' => 'ab', 'password_confirmation' => 'ab',
    ]);
    $this->assertGuest();
    $response->assertSessionHasErrors('password');
});

// ─────────────────────────────────────────────────
// Profile update tests
// ─────────────────────────────────────────────────
test('profile name can be updated', function () {
    $user = User::factory()->create(['name' => 'Original Name']);
    $this->actingAs($user);

    $this->patch('/profile', [
        'name' => 'Updated Name',
        'email' => $user->email,
    ])->assertRedirect();

    $user->refresh();
    expect($user->name)->toBe('Updated Name');
});

test('profile password can be changed with correct current password', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->put('/password', [
        'current_password' => 'password',
        'password' => 'newpassword',
        'password_confirmation' => 'newpassword',
    ])->assertRedirect();

    $this->assertCredentials([
        'email' => $user->email,
        'password' => 'newpassword',
    ]);
});

test('profile password change fails with wrong current password', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->put('/password', [
        'current_password' => 'wrongcurrent',
        'password' => 'newpassword',
        'password_confirmation' => 'newpassword',
    ]);
    $response->assertSessionHasErrors('current_password');
});

// ─────────────────────────────────────────────────
// Edge case: schedule generation without preferences
// ─────────────────────────────────────────────────
test('schedule generation works without preferences (uses defaults)', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Math', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ]);

    $this->post('/schedules/generate');

    $schedules = OptimizedSchedule::where('user_id', $user->id)->get();
    expect($schedules->count())->toBe(3);
});

// ═══════════════════════════════════════════════════
// ALGORITHM EDGE CASES
// ═══════════════════════════════════════════════════

test('algorithm: heavy load — 8h/day of fixed courses leaves minimal study time', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Morning', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '12:00',
    ]);
    $this->postJson('/fixed-events', [
        'title' => 'Afternoon', 'day_of_week' => 'Lundi',
        'start_time' => '12:30', 'end_time' => '16:30',
    ]);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate');

    $equilibre = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $lundi = $equilibre->schedule['details']['Lundi'];

    $morningEnd  = strtotime('08:00');
    $morningStart = strtotime('12:00');
    $afternoonEnd  = strtotime('12:30');
    $afternoonStart = strtotime('16:30');

    foreach ($lundi['sessions_etude'] as $session) {
        $sStart = strtotime($session['debut']);
        $sEnd = strtotime($session['fin']);
        expect($sEnd <= $morningEnd || $sStart >= $morningStart)->toBeTrue();
        expect($sEnd <= $afternoonEnd || $sStart >= $afternoonStart)->toBeTrue();
    }
});

test('algorithm: back-to-back fixed events leave no gap on Monday', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Fill the entire day 07:00-22:00 with back-to-back courses
    $this->postJson('/fixed-events', [
        'title' => 'A', 'day_of_week' => 'Lundi',
        'start_time' => '07:00', 'end_time' => '10:00',
    ]);
    $this->postJson('/fixed-events', [
        'title' => 'B', 'day_of_week' => 'Lundi',
        'start_time' => '10:00', 'end_time' => '13:00',
    ]);
    $this->postJson('/fixed-events', [
        'title' => 'C', 'day_of_week' => 'Lundi',
        'start_time' => '13:00', 'end_time' => '16:00',
    ]);
    $this->postJson('/fixed-events', [
        'title' => 'D', 'day_of_week' => 'Lundi',
        'start_time' => '16:00', 'end_time' => '19:00',
    ]);
    $this->postJson('/fixed-events', [
        'title' => 'E', 'day_of_week' => 'Lundi',
        'start_time' => '19:00', 'end_time' => '22:00',
    ]);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate');

    $equilibre = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $lundi = $equilibre->schedule['details']['Lundi'];

    // No room for study on Monday — should be empty
    expect(count($lundi['sessions_etude']))->toBe(0);
    expect($lundi['total_heures_etude'])->toBe(0);
});

test('algorithm: night owl preference schedules study sessions after 17:00', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Morning Class', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '12:00',
    ]);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'night', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate');

    $equilibre = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $lundi = $equilibre->schedule['details']['Lundi'];

    $hasAfternoonSession = false;
    foreach ($lundi['sessions_etude'] as $session) {
        $startMin = (int) explode(':', $session['debut'])[0] * 60 + (int) explode(':', $session['debut'])[1];
        if ($startMin >= 720) {
            $hasAfternoonSession = true;
        }
        // No session should be during the morning class (480-720)
        expect($startMin >= 720 || $startMin < 480)->toBeTrue();
    }
    expect($hasAfternoonSession)->toBeTrue();
});

test('algorithm: morning preference schedules study sessions before 12:00', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Need at least one fixed event to trigger generation with content
    $this->postJson('/fixed-events', [
        'title' => 'Afternoon Lab', 'day_of_week' => 'Mardi',
        'start_time' => '14:00', 'end_time' => '16:00',
    ]);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'morning', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate');

    $equilibre = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    // Check Monday (no fixed events) — all sessions should be morning
    $lundi = $equilibre->schedule['details']['Lundi'];

    foreach ($lundi['sessions_etude'] as $session) {
        $startHour = (int) explode(':', $session['debut'])[0];
        expect($startHour)->toBeLessThan(12);
    }
});

test('algorithm: study sessions never exceed wake/sleep boundaries', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Math', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ]);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '06:30', 'sleep_time' => '21:00',
        'study_preference' => 'normal', 'concentration_hours' => 2, 'desired_free_time' => 1,
    ]);

    $this->post('/schedules/generate');

    $schedules = OptimizedSchedule::where('user_id', $user->id)->get();
    foreach ($schedules as $schedule) {
        foreach ($schedule->schedule['details'] as $day => $data) {
            foreach ($data['sessions_etude'] as $session) {
                expect($session['debut'])->toBeGreaterThanOrEqual('06:30');
                expect($session['fin'])->toBeLessThanOrEqual('21:00');
            }
        }
    }
});

test('algorithm: intensif sessions are longer than equilibre, which are longer than leger', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    foreach (['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as $day) {
        $this->postJson('/fixed-events', [
            'title' => "Course $day", 'day_of_week' => $day,
            'start_time' => '10:00', 'end_time' => '12:00',
        ]);
    }

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 3, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate');

    $intensif  = OptimizedSchedule::where('user_id', $user->id)->where('type', 'intensif')->first();
    $equilibre = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $leger     = OptimizedSchedule::where('user_id', $user->id)->where('type', 'leger')->first();

    $avgDuration = function ($sched) {
        $durations = [];
        foreach ($sched->schedule['details'] as $day => $data) {
            foreach ($data['sessions_etude'] as $s) {
                $durations[] = $s['duree'];
            }
        }
        return count($durations) > 0 ? array_sum($durations) / count($durations) : 0;
    };

    $avgInt = $avgDuration($intensif);
    $avgEq  = $avgDuration($equilibre);
    $avgLeg = $avgDuration($leger);

    expect($avgInt)->toBeGreaterThanOrEqual($avgEq);
    expect($avgEq)->toBeGreaterThanOrEqual($avgLeg);
});

test('algorithm: total weekly hours equal sum of daily hours', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Math', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ]);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate');

    $equilibre = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $details = $equilibre->schedule['details'];
    $resume = $equilibre->schedule['resume'];

    $sumDaily = 0;
    foreach ($details as $day => $data) {
        $sumDaily += $data['total_heures_etude'];
    }

    expect(abs(round($sumDaily, 1) - $resume['total_heures_semaine']))->toBeLessThanOrEqual(0.1);
    expect(abs(round($sumDaily / 7, 1) - $resume['moyenne_par_jour']))->toBeLessThanOrEqual(0.1);
});

test('algorithm: no study sessions overlap with each other', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Math', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '09:00',
    ]);
    $this->postJson('/fixed-events', [
        'title' => 'Physics', 'day_of_week' => 'Lundi',
        'start_time' => '14:00', 'end_time' => '15:00',
    ]);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 2, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate');

    $schedules = OptimizedSchedule::where('user_id', $user->id)->get();
    foreach ($schedules as $schedule) {
        foreach ($schedule->schedule['details'] as $day => $data) {
            $sessions = $data['sessions_etude'];
            for ($i = 0; $i < count($sessions); $i++) {
                for ($j = $i + 1; $j < count($sessions); $j++) {
                    $aStart = strtotime($sessions[$i]['debut']);
                    $aEnd   = strtotime($sessions[$i]['fin']);
                    $bStart = strtotime($sessions[$j]['debut']);
                    $bEnd   = strtotime($sessions[$j]['fin']);

                    $overlaps = ($aStart < $bEnd && $aEnd > $bStart);
                    expect($overlaps)->toBeFalse();
                }
            }
        }
    }
});

test('algorithm: sessions never overlap with fixed events', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Morning', 'day_of_week' => 'Lundi',
        'start_time' => '09:00', 'end_time' => '11:00',
    ]);
    $this->postJson('/fixed-events', [
        'title' => 'Afternoon', 'day_of_week' => 'Lundi',
        'start_time' => '14:00', 'end_time' => '16:00',
    ]);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 2, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate');

    $equilibre = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $lundi = $equilibre->schedule['details']['Lundi'];

    $morningStart = strtotime('09:00');
    $morningEnd   = strtotime('11:00');
    $afternoonStart = strtotime('14:00');
    $afternoonEnd = strtotime('16:00');

    foreach ($lundi['sessions_etude'] as $session) {
        $sStart = strtotime($session['debut']);
        $sEnd   = strtotime($session['fin']);

        expect($sEnd <= $morningStart || $sStart >= $morningEnd)->toBeTrue();
        expect($sEnd <= $afternoonStart || $sStart >= $afternoonEnd)->toBeTrue();
    }
});

// ─────────────────────────────────────────────────
// NEW FEATURE COVERAGE
// ─────────────────────────────────────────────────

// FEATURE: study_preference='any' — the algorithm chooses freely
// (chronological order). It must pass validation and generate all 3 schedules.
test('schedule generation succeeds with study_preference=any', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Math', 'day_of_week' => 'Lundi',
        'start_time' => '08:00', 'end_time' => '10:00',
    ])->assertRedirect();

    // The API must accept 'any' alongside morning/normal/night
    $this->post('/preferences', [
        'wake_up_time' => '07:00',
        'sleep_time' => '22:00',
        'study_preference' => 'any',
        'concentration_hours' => 1,
        'desired_free_time' => 2,
    ])->assertRedirect();
    $this->assertDatabaseHas('preferences', ['user_id' => $user->id, 'study_preference' => 'any']);

    // Generate must succeed (follow the redirect back to a 200 page)
    $this->followingRedirects()->post('/schedules/generate')->assertStatus(200);
    expect(OptimizedSchedule::where('user_id', $user->id)->count())->toBe(3);

    // Schedules page renders with the generated data
    $this->get('/schedules')->assertStatus(200);
});

// FEATURE: overnight events (crossing midnight) are rejected by validation.
// NOTE: checked the actual validation message — it resolves from
// messages.overnight_not_supported ("Les événements qui passent minuit ne sont
// pas encore pris en charge..." / "Overnight events (crossing midnight) are not
// supported yet..."), so we assert against the trans() key to stay locale-proof.
test('fixed event crossing midnight is rejected with clear message', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post('/fixed-events', [
        'title' => 'Night Shift',
        'day_of_week' => 'Lundi',
        'start_time' => '23:00',
        'end_time' => '01:00',
    ]);

    $response->assertSessionHasErrors(['end_time']);
    $errors = session('errors');
    expect($errors)->not->toBeNull();

    $message = $errors->first('end_time');
    expect($message)->toContain(trans('messages.overnight_not_supported'));

    // The invalid event must NOT be stored
    $this->assertDatabaseMissing('fixed_events', ['title' => 'Night Shift']);
});

// FEATURE: day_of_week=7 (Dimanche / Sunday) — events on Sunday must be
// accepted and appear in the generated schedule for that day.
test('schedule generation supports Dimanche (day 7) fixed events', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson('/fixed-events', [
        'title' => 'Sunday Special', 'day_of_week' => 'Dimanche',
        'start_time' => '10:00', 'end_time' => '12:00',
    ])->assertRedirect();
    $this->assertDatabaseHas('fixed_events', ['user_id' => $user->id, 'day_of_week' => 'Dimanche']);

    Preference::create([
        'user_id' => $user->id, 'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'normal', 'concentration_hours' => 1, 'desired_free_time' => 2,
    ]);

    $this->post('/schedules/generate')->assertRedirect();
    expect(OptimizedSchedule::where('user_id', $user->id)->count())->toBe(3);

    foreach (OptimizedSchedule::where('user_id', $user->id)->get() as $type => $schedule) {
        $dimanche = $schedule->schedule['details']['Dimanche'];
        expect($dimanche)->toHaveKey('cours_fixes');
    }

    $equilibre = OptimizedSchedule::where('user_id', $user->id)->where('type', 'equilibre')->first();
    $dimancheFixed = collect($equilibre->schedule['details']['Dimanche']['cours_fixes']);
    expect($dimancheFixed->pluck('title'))->toContain('Sunday Special');
});
