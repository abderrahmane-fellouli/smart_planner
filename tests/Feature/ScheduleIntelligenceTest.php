<?php

use App\Models\FixedEvent;
use App\Models\OptimizedSchedule;
use App\Models\Preference;
use App\Models\SleepSchedule;
use App\Models\TodoItem;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

// Reuses helpers from E2ETest.php (createUserWithPreferences, createFixedEvents,
// createScheduledTodo, generateSchedules, timeToMinutes, intervalsOverlap,
// countStudyMinutes).

test('generated schedules populate the explanations column honestly', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 3,
    ]);
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);

    $schedules = generateSchedules($this, $user);

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $s = $schedules[$type];
        expect($s->explanations)->not->toBeNull();
        expect($s->explanations)->toBeString();
        expect($s->explanations)->toContain('session');
    }
});

test('every generated day carries capacity, overloaded and explanation metadata', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 3,
    ]);
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);

    $schedules = generateSchedules($this, $user);
    $equilibre = $schedules['equilibre'];
    $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    foreach ($days as $jour) {
        $day = $equilibre->schedule['details'][$jour];
        expect($day)->toHaveKey('capacity');
        expect($day)->toHaveKey('overloaded');
        expect($day)->toHaveKey('explanation');
        expect($day['capacity'])->toHaveKeys(['awake', 'occupied', 'free', 'load', 'overloaded']);
    }

    expect($equilibre->schedule['resume'])->toHaveKeys(['overloaded', 'overloaded_days']);
});

test('available time is computed as awake minus hard commitments, not wake-sleep', function () {
    // Sleep 08:00–22:00 (840 min awake) with 2h fixed = 720 available.
    $user = createUserWithPreferences([
        'wake_up_time' => '08:00', 'sleep_time' => '22:00', 'concentration_hours' => 8,
        'desired_free_time' => 0,
    ]);
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);

    $schedules = generateSchedules($this, $user);
    $lundi = $schedules['equilibre']->schedule['details']['Lundi'];

    expect($lundi['capacity']['awake'])->toBe(840);
    expect($lundi['capacity']['occupied'])->toBe(120);
    expect($lundi['capacity']['free'])->toBe(720);
});

test('sleep schedule is respected as a HARD boundary for committed daily tasks', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '08:00', 'sleep_time' => '20:00', 'concentration_hours' => 2,
    ]);
    // Override with a per-day sleep schedule: wake 07:00, sleep 21:00.
    SleepSchedule::create([
        'user_id' => $user->id,
        'wake_mode' => 'same', 'wake_same_time' => '07:00',
        'bedtime_mode' => 'same', 'bedtime_same_time' => '21:00',
    ]);

    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    createScheduledTodo($user, [
        'title' => 'Devoir', 'scheduled_day' => 'Lundi', 'scheduled_time' => '11:00', 'scheduled_duration' => 60,
    ]);

    $schedules = generateSchedules($this, $user);

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $sessions = $schedules[$type]->schedule['details']['Lundi']['sessions_etude'] ?? [];
        foreach ($sessions as $sess) {
            $sEnd = timeToMinutes($sess['fin']);
            expect($sEnd)->toBeLessThanOrEqual(timeToMinutes('21:00'));
            expect(timeToMinutes($sess['debut']))->toBeGreaterThanOrEqual(timeToMinutes('07:00'));
        }
    }
});

test('a committed scheduled todo is placed and auto sessions never overlap it', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4,
    ]);
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    $todo = createScheduledTodo($user, [
        'title' => 'Lab', 'scheduled_day' => 'Lundi', 'scheduled_time' => '14:00', 'scheduled_duration' => 90,
    ]);

    $schedules = generateSchedules($this, $user);

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $lundi = $schedules[$type]->schedule['details']['Lundi'];
        $sessions = $lundi['sessions_etude'] ?? [];
        $todoStart = timeToMinutes('14:00');
        $todoEnd   = $todoStart + 90;

        // The task itself should appear (committed HARD).
        $taskFound = collect($sessions)->contains(fn ($s) => $s['matiere'] === 'Lab');
        expect($taskFound)->toBeTrue();

        foreach ($sessions as $sess) {
            // Skip the committed task's own placed session.
            if (($sess['matiere'] ?? '') === 'Lab') continue;
            $sStart = timeToMinutes($sess['debut']);
            $sEnd   = timeToMinutes($sess['fin']);
            $overlapsTask = $sStart < $todoEnd && $todoStart < $sEnd;
            expect($overlapsTask)->toBeFalse("session {$sess['debut']}-{$sess['fin']} overlaps committed task 14:00-15:30");
        }
    }
});

test('a flexible pending todo is placed in free time with a difficulty-based duration', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4,
        'desired_free_time' => 0,
    ]);
    // Very light day (only one fixed course) so there is ample free time.
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '09:00'],
    ]);

    // A pending, non-committed task with high difficulty (5).
    TodoItem::create([
        'user_id' => $user->id, 'title' => 'Réviser chimie',
        'completed' => false, 'priority' => 5, 'is_scheduled' => false,
    ]);

    $schedules = generateSchedules($this, $user);
    $lundi = $schedules['equilibre']->schedule['details']['Lundi'];
    $sessions = $lundi['sessions_etude'] ?? [];

    $flex = collect($sessions)->first(fn ($s) => str_contains($s['matiere'] ?? '', 'Réviser chimie'));
    expect($flex)->not->toBeNull('flexible todo should be placed');
    // Difficulty 5 → 75 minutes default.
    expect($flex['duree'])->toBe(75);
});

test('higher difficulty todos are placed before easier ones in flexible scheduling', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4,
        'desired_free_time' => 0,
    ]);
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '07:30', 'end_time' => '08:00'],
    ]);

    foreach ([
        ['title' => 'Facile', 'priority' => 1],
        ['title' => 'Difficile', 'priority' => 5],
    ] as $t) {
        TodoItem::create([
            'user_id' => $user->id, 'title' => $t['title'],
            'completed' => false, 'priority' => $t['priority'], 'is_scheduled' => false,
        ]);
    }

    $schedules = generateSchedules($this, $user);
    $lundi = $schedules['equilibre']->schedule['details']['Lundi'];
    $sessions = $lundi['sessions_etude'] ?? [];

    $posDifficile = $posFacile = null;
    foreach ($sessions as $i => $s) {
        if (str_contains($s['matiere'] ?? '', 'Difficile')) $posDifficile = $i;
        if (str_contains($s['matiere'] ?? '', 'Facile'))     $posFacile = $i;
    }

    expect($posDifficile)->not->toBeNull();
    expect($posFacile)->not->toBeNull();
    expect($posDifficile)->toBeLessThan($posFacile, 'hardest todo should be placed first');
});

test('desired_free_time meaningfully reduces how much a day is filled', function () {
    $make = function ($freeHours) {
        $user = createUserWithPreferences([
            'wake_up_time' => '07:00', 'sleep_time' => '20:00', 'concentration_hours' => 8,
            'desired_free_time' => $freeHours,
        ]);
        // Split Mardi into several free gaps so session count can actually vary.
        createFixedEvents($user, [
            ['title' => 'A', 'day_of_week' => 'Mardi', 'start_time' => '08:00', 'end_time' => '10:00'],
            ['title' => 'B', 'day_of_week' => 'Mardi', 'start_time' => '13:00', 'end_time' => '15:00'],
        ]);
        $s = generateSchedules($this, $user)['intensif'];
        return countStudyMinutes($s->schedule['details']['Mardi']);
    };

    $noFree     = $make(0);
    $lotsOfFree = $make(8); // 8h of free time reserved every day

    expect($noFree)->toBeGreaterThan($lotsOfFree,
        "desired_free_time should visibly reduce study volume (noFree={$noFree}min vs lotsOfFree={$lotsOfFree}min)"
    );
});

test('an overloaded day is reported in resume and reduces study placement', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 8,
        'desired_free_time' => 0,
    ]);

    // Fill nearly the whole evening awake window on Lundi with fixed courses.
    $hours = [];
    for ($h = 7; $h < 20; $h++) { // 13h of 15h awake
        $hours[] = ['title' => "H{$h}", 'day_of_week' => 'Lundi', 'start_time' => sprintf('%02d:00', $h), 'end_time' => sprintf('%02d:00', $h + 1)];
    }
    createFixedEvents($user, $hours);

    // Light weeks on other days so total free time > 30 min (else generation is blocked).
    createFixedEvents($user, [
        ['title' => 'M', 'day_of_week' => 'Mardi', 'start_time' => '08:00', 'end_time' => '09:00'],
    ]);

    $schedules = generateSchedules($this, $user);
    $equilibre = $schedules['equilibre'];
    $lundi = $equilibre->schedule['details']['Lundi'];

    expect($lundi['overloaded'])->toBeTrue();
    expect($equilibre->schedule['resume']['overloaded'])->toBeTrue();
    expect($equilibre->schedule['resume']['overloaded_days'])->toBeGreaterThanOrEqual(1);
    // Little to no study time fits in an overloaded day.
    expect($lundi['total_heures_etude'])->toBeLessThanOrEqual(2.0);
});
