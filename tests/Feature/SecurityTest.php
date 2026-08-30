<?php

use App\Models\FixedEvent;
use App\Models\OptimizedSchedule;
use App\Models\Preference;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    Mail::fake();
});

// ── Authorization tests: users cannot access other users' data ──

test('unauthenticated user is redirected to login', function () {
    $this->get('/dashboard')->assertRedirect('/login');
    $this->get('/schedules')->assertRedirect('/login');
    $this->get('/fixed-events')->assertRedirect('/login');
    $this->get('/preferences')->assertRedirect('/login');
    $this->get('/statistics')->assertRedirect('/login');
});

test('user can access their own dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get('/dashboard')->assertStatus(200);
});

test('user can access their own fixed events', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get('/fixed-events')->assertStatus(200);
});

test('user can access their own schedules page', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get('/schedules')->assertStatus(200);
});

test('user can access their own preferences', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get('/preferences')->assertStatus(200);
});

test('user can access their own statistics', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get('/statistics')->assertStatus(200);
});

test('user can access their own export page', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get('/export')->assertStatus(200);
});

// ── FixedEvent validation tests ──

test('fixed event requires all fields', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/fixed-events', [])->assertSessionHasErrors(['title', 'day_of_week', 'start_time', 'end_time']);
});

test('fixed event rejects invalid time format', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/fixed-events', [
        'title' => 'Math',
        'day_of_week' => 'Lundi',
        'start_time' => 'not-a-time',
        'end_time' => '10:00',
    ])->assertSessionHasErrors(['start_time']);
});

test('fixed event validates end_time after start_time', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/fixed-events', [
        'title' => 'Math',
        'day_of_week' => 'Lundi',
        'start_time' => '10:00',
        'end_time' => '08:00',
    ])->assertSessionHasErrors(['end_time']);
});

test('fixed event accepts valid data', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/fixed-events', [
        'title' => 'Mathématiques',
        'day_of_week' => 'Lundi',
        'start_time' => '08:00',
        'end_time' => '10:00',
    ]);
    $this->assertDatabaseHas('fixed_events', [
        'user_id' => $user->id,
        'title' => 'Mathématiques',
        'day_of_week' => 'Lundi',
    ]);
});

test('fixed event normalizes English day name to French', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/fixed-events', [
        'title' => 'Info',
        'day_of_week' => 'Monday',
        'start_time' => '09:00',
        'end_time' => '11:00',
    ]);
    $this->assertDatabaseHas('fixed_events', [
        'user_id' => $user->id,
        'day_of_week' => 'Lundi',
    ]);
});

test('fixed event normalizes Arabic day name to French', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/fixed-events', [
        'title' => 'Info',
        'day_of_week' => 'الثلاثاء',
        'start_time' => '09:00',
        'end_time' => '11:00',
    ]);
    $this->assertDatabaseHas('fixed_events', [
        'user_id' => $user->id,
        'day_of_week' => 'Mardi',
    ]);
});

// ── Preference validation tests ──

test('preference requires all fields', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/preferences', [])->assertSessionHasErrors([
        'wake_up_time', 'sleep_time', 'study_preference',
        'concentration_hours', 'desired_free_time',
    ]);
});

test('preference rejects invalid time format', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/preferences', [
        'wake_up_time' => 'invalid',
        'sleep_time' => '22:00',
        'study_preference' => 'morning',
        'concentration_hours' => 2,
        'desired_free_time' => 2,
    ])->assertSessionHasErrors(['wake_up_time']);
});

test('preference rejects invalid study_preference', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/preferences', [
        'wake_up_time' => '08:00',
        'sleep_time' => '22:00',
        'study_preference' => 'invalid',
        'concentration_hours' => 2,
        'desired_free_time' => 2,
    ])->assertSessionHasErrors(['study_preference']);
});

test('preference rejects out-of-range concentration_hours', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/preferences', [
        'wake_up_time' => '08:00',
        'sleep_time' => '22:00',
        'study_preference' => 'morning',
        'concentration_hours' => 0,
        'desired_free_time' => 2,
    ])->assertSessionHasErrors(['concentration_hours']);
});

test('preference accepts valid data and creates record', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/preferences', [
        'wake_up_time' => '07:00',
        'sleep_time' => '23:00',
        'study_preference' => 'morning',
        'concentration_hours' => 4,
        'desired_free_time' => 3,
    ]);
    $this->assertDatabaseHas('preferences', [
        'user_id' => $user->id,
        'wake_up_time' => '07:00',
    ]);
});

test('preference upserts (updateOrCreate) on second submission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/preferences', [
        'wake_up_time' => '07:00', 'sleep_time' => '22:00',
        'study_preference' => 'morning', 'concentration_hours' => 2, 'desired_free_time' => 2,
    ]);

    $this->actingAs($user)->post('/preferences', [
        'wake_up_time' => '06:00', 'sleep_time' => '23:00',
        'study_preference' => 'night', 'concentration_hours' => 8, 'desired_free_time' => 1,
    ]);

    // Should still be 1 record per user
    $this->assertDatabaseCount('preferences', 1);
    $this->assertDatabaseHas('preferences', ['wake_up_time' => '06:00', 'study_preference' => 'night']);
});

// ── Schedule generation tests ──

test('schedule generation requires fixed events first', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/schedules/generate')
        ->assertRedirect();
});

test('schedule generation creates 3 schedules when events exist', function () {
    $user = User::factory()->create();

    foreach (['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as $day) {
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Mathématiques',
            'day_of_week' => $day,
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
        ]);
    }

    $this->actingAs($user)->post('/schedules/generate')->assertRedirect();

    $this->assertDatabaseCount('optimized_schedules', 3);
    $this->assertDatabaseHas('optimized_schedules', ['user_id' => $user->id, 'type' => 'intensif']);
    $this->assertDatabaseHas('optimized_schedules', ['user_id' => $user->id, 'type' => 'equilibre']);
    $this->assertDatabaseHas('optimized_schedules', ['user_id' => $user->id, 'type' => 'leger']);
});

test('schedule generation deletes previous schedules before creating new ones', function () {
    $user = User::factory()->create();

    OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['old' => true], 'generated_for' => now()->subWeek(), 'is_active' => false,
    ]);

    foreach (['Lundi', 'Mardi'] as $day) {
        FixedEvent::create([
            'user_id' => $user->id, 'title' => 'Info',
            'day_of_week' => $day, 'start_time' => '09:00:00', 'end_time' => '11:00:00',
        ]);
    }

    $this->actingAs($user)->post('/schedules/generate');

    $this->assertDatabaseCount('optimized_schedules', 3);
    $this->assertDatabaseMissing('optimized_schedules', ['schedule' => json_encode(['old' => true])]);
});

test('user can activate a schedule', function () {
    $user = User::factory()->create();
    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->actingAs($user)->post("/schedules/activate/{$schedule->id}")->assertRedirect();
    $this->assertDatabaseHas('optimized_schedules', ['id' => $schedule->id, 'is_active' => true]);
});

test('user can delete a schedule', function () {
    $user = User::factory()->create();
    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'leger',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->actingAs($user)->delete("/schedules/{$schedule->id}")->assertRedirect();
    $this->assertDatabaseMissing('optimized_schedules', ['id' => $schedule->id]);
});

// ── Export security tests ──

test('export requires authenticated user', function () {
    $this->get('/export/pdf')->assertRedirect('/login');
});

test('export pdf handles missing schedule gracefully', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get('/export/pdf')
        ->assertRedirect(); // Redirects back with error, doesn't crash
});

// ── XSS prevention in export ──

test('export escapes user content to prevent XSS', function () {
    $user = User::factory()->create();

    OptimizedSchedule::create([
        'user_id' => $user->id,
        'type' => 'equilibre',
        'schedule' => [
            'details' => [
                'Lundi' => [
                    'cours_fixes' => [
                        ['title' => '<script>alert("xss")</script>Math', 'start_time' => '08:00:00', 'end_time' => '10:00:00'],
                    ],
                    'sessions_etude' => [
                        ['debut' => '10:00', 'fin' => '11:00', 'duree' => 60, 'matiere' => '<img onerror=alert(1)>Physics'],
                    ],
                    'total_heures_etude' => 1,
                ],
            ],
            'resume' => ['total_heures_semaine' => 1, 'sessions_totales' => 1, 'moyenne_par_jour' => 0.2],
        ],
        'generated_for' => now(),
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->get('/export/pdf');
    $response->assertStatus(200);

    $content = $response->getContent();
    $this->assertStringNotContainsString('<script>alert("xss")</script>', $content);
    $this->assertStringNotContainsString('<img onerror=alert(1)>', $content);
    $this->assertStringContainsString('&lt;script&gt;', $content);
});

// ── Move session validation tests ──

test('move session validates required fields', function () {
    $user = User::factory()->create();
    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->actingAs($user)->post("/schedules/{$schedule->id}/move-session", [])->assertSessionHasErrors(['jour', 'session_index', 'new_start']);
});

test('move session validates jour against allowed values', function () {
    $user = User::factory()->create();
    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->actingAs($user)->post("/schedules/{$schedule->id}/move-session", [
        'jour' => 'InvalidDay', 'session_index' => 0, 'new_start' => '10:00',
    ])->assertSessionHasErrors(['jour']);
});

test('move session validates time format', function () {
    $user = User::factory()->create();
    $schedule = OptimizedSchedule::create([
        'user_id' => $user->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->actingAs($user)->post("/schedules/{$schedule->id}/move-session", [
        'jour' => 'Lundi', 'session_index' => 0, 'new_start' => 'not-a-time',
    ])->assertSessionHasErrors(['new_start']);
});

// ── Cross-user isolation tests ──

test('user cannot delete another users schedule', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();

    $schedule = OptimizedSchedule::create([
        'user_id' => $owner->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->actingAs($attacker)->delete("/schedules/{$schedule->id}")->assertNotFound();
    $this->assertDatabaseHas('optimized_schedules', ['id' => $schedule->id]);
});

test('user cannot activate another users schedule', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();

    $schedule = OptimizedSchedule::create([
        'user_id' => $owner->id, 'type' => 'equilibre',
        'schedule' => ['details' => []], 'generated_for' => now(), 'is_active' => false,
    ]);

    $this->actingAs($attacker)->post("/schedules/activate/{$schedule->id}")->assertNotFound();
    $this->assertDatabaseHas('optimized_schedules', ['id' => $schedule->id, 'is_active' => false]);
});

test('user cannot delete another users fixed event', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();

    $event = FixedEvent::create([
        'user_id' => $owner->id, 'title' => 'Math',
        'day_of_week' => 'Lundi', 'start_time' => '08:00:00', 'end_time' => '10:00:00',
    ]);

    $this->actingAs($attacker)->delete("/fixed-events/{$event->id}")->assertNotFound();
    $this->assertDatabaseHas('fixed_events', ['id' => $event->id]);
});

// ── Regression: TodoItem belongs to correct user ──

test('user cannot see another users todos', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $this->actingAs($user1)->post('/todos', ['title' => 'User1 Todo']);
    $this->actingAs($user2)->post('/todos', ['title' => 'User2 Todo']);

    $response = $this->actingAs($user1)->get('/todos');
    $response->assertStatus(200);
    $content = $response->getContent();
    $this->assertStringContainsString('User1 Todo', $content);
    $this->assertStringNotContainsString('User2 Todo', $content);
});

test('user cannot delete another users todo', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $this->actingAs($user1)->post('/todos', ['title' => 'User1 Todo']);
    $this->actingAs($user2)->post('/todos', ['title' => 'User2 Todo']);

    $todo = \App\Models\TodoItem::where('user_id', $user2->id)->first();
    $this->actingAs($user1)->delete("/todos/{$todo->id}")->assertNotFound();
    $this->assertDatabaseHas('todo_items', ['id' => $todo->id]);
});

// ── Regression: Preference update does not lose theme ──

test('updating preferences preserves theme', function () {
    $user = User::factory()->create();

    Preference::create([
        'user_id' => $user->id,
        'wake_up_time' => '07:00',
        'sleep_time' => '22:00',
        'study_preference' => 'morning',
        'concentration_hours' => 4,
        'desired_free_time' => 2,
        'theme' => 'softBlush',
    ]);

    $this->actingAs($user)->post('/preferences', [
        'wake_up_time' => '06:30',
        'sleep_time' => '22:00',
        'study_preference' => 'morning',
        'concentration_hours' => 4,
        'desired_free_time' => 2,
        'theme' => 'softBlush',
    ]);

    $this->assertDatabaseHas('preferences', [
        'user_id' => $user->id,
        'theme' => 'softBlush',
        'wake_up_time' => '06:30',
    ]);
});

// ── Regression: Schedule generation with no preferences uses defaults ──

test('schedule generation succeeds without preference record', function () {
    $user = User::factory()->create();

    $this->assertDatabaseMissing('preferences', ['user_id' => $user->id]);

    FixedEvent::create([
        'user_id' => $user->id,
        'title' => 'Math',
        'day_of_week' => 'Lundi',
        'start_time' => '08:00:00',
        'end_time' => '10:00:00',
    ]);

    $this->actingAs($user)->post('/schedules/generate')->assertRedirect();
    $this->assertDatabaseCount('optimized_schedules', 3);
});

// ── Regression: TodoItem description is optional ──

test('todo item can be created without description', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/todos', ['title' => 'No Description Todo']);
    $this->assertDatabaseHas('todo_items', [
        'user_id' => $user->id,
        'title' => 'No Description Todo',
        'description' => null,
    ]);
});

// ── Regression: TodoItem scheduling fields are optional ──

test('todo item saves with defaults when scheduling fields omitted', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/todos', [
        'title' => 'Simple Todo',
        'priority' => 2,
    ]);

    $todo = \App\Models\TodoItem::where('user_id', $user->id)->first();
    $this->assertEquals(false, $todo->is_scheduled);
    $this->assertNull($todo->scheduled_day);
    $this->assertNull($todo->scheduled_time);
    $this->assertNull($todo->scheduled_duration);
});
