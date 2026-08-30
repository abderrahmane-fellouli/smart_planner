<?php

use App\Models\OptimizedSchedule;

/*
| Calendar / Program page: renders the SINGLE canonical schedule slot
| (active first, then most recent) and lets the user visualise it in
| day/week/month views. It must never invent its own data.
*/

test('calendar page requires authentication', function () {
    $this->get('/calendar')->assertRedirect(route('login'));
});

test('calendar page loads for an authenticated user with an active schedule', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4]);
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    generateSchedules($this, $user);

    $active = OptimizedSchedule::where('user_id', $user->id)->first();
    $active->update(['is_active' => true]);

    $this->actingAs($user)->get('/calendar')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Calendar/Index')
            ->has('schedule')
            ->where('schedule.id', $active->id)
            ->where('schedule.is_active', true)
        );
});

test('calendar uses the active schedule as the source of truth', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4]);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    generateSchedules($this, $user);

    // Activate the "leger" type, not the first (most recent) schedule.
    $leger = OptimizedSchedule::where('user_id', $user->id)->where('type', 'leger')->first();
    $leger->update(['is_active' => true]);

    $this->actingAs($user)->get('/calendar')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Calendar/Index')
            ->where('schedule.id', $leger->id)
            ->where('schedule.type', 'leger')
        );
});

test('calendar falls back to the most recent schedule when none is active', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4]);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    generateSchedules($this, $user);

    // No schedule is active — should fall back to the newest created.
    $newest = OptimizedSchedule::where('user_id', $user->id)->orderBy('created_at', 'desc')->first();

    $this->actingAs($user)->get('/calendar')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('schedule.id', $newest->id)
        );
});

test('calendar page shows an empty state when the user has no schedule', function () {
    $user = createUserWithPreferences();
    $this->actingAs($user)->get('/calendar')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Calendar/Index')
            ->where('schedule', null)
        );
});

test('calendar exposes today name and course-existence flag', function () {
    $user = createUserWithPreferences();
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Mardi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    $this->actingAs($user)->get('/calendar')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Calendar/Index')
            ->where('hasCourses', true)
            ->whereNot('todayName', null)
        );
});
