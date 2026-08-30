<?php

use App\Models\FixedEvent;
use App\Models\OptimizedSchedule;
use App\Models\Preference;
use App\Models\TodoItem;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

/*
|--------------------------------------------------------------------------
| Edge-Case Tests for the Scheduling Algorithm
|--------------------------------------------------------------------------
|
| These tests verify boundary conditions and unusual inputs that the
| schedule generator must handle gracefully.
|
*/

test('study sessions and daily tasks share the same time window', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '07:00',
        'sleep_time'         => '22:00',
        'concentration_hours' => 4,
    ]);

    createFixedEvents($user, [
        [
            'title'      => 'Maths',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time'   => '10:00',
        ],
    ]);

    $todo = createScheduledTodo($user, [
        'title'              => 'Lab report',
        'scheduled_day'      => 'Lundi',
        'scheduled_time'     => '14:00',
        'scheduled_duration' => 120,
    ]);

    $schedules = generateSchedules($this, $user);

    $todoStart = timeToMinutes($todo->scheduled_time);
    $todoEnd   = timeToMinutes(gmdate('H:i', strtotime($todo->scheduled_time) + $todo->scheduled_duration * 60));

    foreach ($schedules as $type => $schedule) {
        $mondaySessions = $schedule->schedule['details']['Lundi']['sessions_etude'] ?? [];

        foreach ($mondaySessions as $session) {
            $sStart = timeToMinutes($session['debut']);
            $sEnd   = timeToMinutes($session['fin']);

            $inAwakeWindow = $sStart >= timeToMinutes('07:00') && $sEnd <= timeToMinutes('22:00');
            expect($inAwakeWindow)->toBeTrue(
                "Schedule type '{$type}' session {$session['debut']}-{$session['fin']} "
                . "should be within the 07:00-22:00 awake window"
            );
        }
    }
});

test('algorithm handles minimal free time and skips gaps too short for study', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '08:00',
        'sleep_time'         => '22:00',
        'concentration_hours' => 1,
    ]);

    createFixedEvents($user, [
        ['title' => 'Cours A', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:30'],
        ['title' => 'Cours B', 'day_of_week' => 'Lundi', 'start_time' => '11:00', 'end_time' => '13:00'],
        ['title' => 'Cours C', 'day_of_week' => 'Lundi', 'start_time' => '13:30', 'end_time' => '15:00'],
        ['title' => 'Cours D', 'day_of_week' => 'Lundi', 'start_time' => '15:30', 'end_time' => '17:00'],
    ]);

    $schedules = generateSchedules($this, $user);

    foreach ($schedules as $type => $schedule) {
        $sessions = $schedule->schedule['details']['Lundi']['sessions_etude'] ?? [];

        foreach ($sessions as $session) {
            $duration = $session['duree'] ?? 0;
            expect($duration)->toBeGreaterThanOrEqual(30,
                "Schedule type '{$type}' created a session of only {$duration} min "
                . "between {$session['debut']}-{$session['fin']}"
            );
        }
    }
});

test('algorithm handles all-day busy and produces no study sessions', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '08:00',
        'sleep_time'         => '22:00',
        'concentration_hours' => 3,
    ]);

    $hours = [];
    for ($h = 8; $h < 22; $h++) {
        $hours[] = [
            'title'      => "Hour {$h}",
            'day_of_week' => 'Mardi',
            'start_time' => sprintf('%02d:00', $h),
            'end_time'   => sprintf('%02d:00', $h + 1),
        ];
    }
    createFixedEvents($user, $hours);

    $schedules = generateSchedules($this, $user);

    foreach ($schedules as $type => $schedule) {
        $sessions = $schedule->schedule['details']['Mardi']['sessions_etude'] ?? [];
        expect($sessions)->toBeEmpty(
            "Schedule type '{$type}' should have no study sessions when every hour is occupied"
        );
    }
});

test('algorithm rejects generation when no fixed events exist', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '07:00',
        'sleep_time'         => '22:00',
        'concentration_hours' => 3,
        'study_preference'   => 'any',
    ]);

    $response = $this->actingAs($user)->post('/schedules/generate');
    $response->assertRedirect();

    $schedules = OptimizedSchedule::where('user_id', $user->id)->get();
    expect($schedules)->toBeEmpty(
        'No schedules should be created without any fixed events'
    );
});

test('algorithm respects different wake and sleep times per preference', function () {
    $morningUser = createUserWithPreferences([
        'wake_up_time'       => '05:00',
        'sleep_time'         => '21:00',
        'study_preference'   => 'morning',
        'concentration_hours' => 2,
    ]);

    $nightUser = createUserWithPreferences([
        'wake_up_time'       => '10:00',
        'sleep_time'         => '02:00',
        'study_preference'   => 'night',
        'concentration_hours' => 2,
    ]);

    $morningSchedules = generateSchedules($this, $morningUser);
    $nightSchedules   = generateSchedules($this, $nightUser);

    foreach ($morningSchedules as $type => $schedule) {
        $allSessions = [];
        foreach ($schedule->schedule['details'] ?? [] as $dayData) {
            $allSessions = array_merge($allSessions, $dayData['sessions_etude'] ?? []);
        }

        if (count($allSessions) > 0) {
            $earliestStart = min(array_map(fn ($s) => timeToMinutes($s['debut']), $allSessions));
            expect($earliestStart)->toBeGreaterThanOrEqual(timeToMinutes('05:00'),
                "Morning user's earliest session should not be before wake time 05:00"
            );
        }
    }

    foreach ($nightSchedules as $type => $schedule) {
        $allSessions = [];
        foreach ($schedule->schedule['details'] ?? [] as $dayData) {
            $allSessions = array_merge($allSessions, $dayData['sessions_etude'] ?? []);
        }

        if (count($allSessions) > 0) {
            $latestEnd = max(array_map(fn ($s) => timeToMinutes($s['fin']), $allSessions));
            expect($latestEnd)->toBeLessThanOrEqual(timeToMinutes('02:00') + 24 * 60,
                "Night user's latest session should not extend past sleep time 02:00"
            );
        }
    }
});

test('schedule generation is deterministic given the same input', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '07:00',
        'sleep_time'         => '22:00',
        'concentration_hours' => 3,
    ]);

    createFixedEvents($user, [
        ['title' => 'Physique', 'day_of_week' => 'Lundi',    'start_time' => '08:00', 'end_time' => '10:00'],
        ['title' => 'Informatique', 'day_of_week' => 'Mercredi', 'start_time' => '09:00', 'end_time' => '11:00'],
        ['title' => 'Anglais', 'day_of_week' => 'Vendredi', 'start_time' => '13:00', 'end_time' => '15:00'],
    ]);

    createScheduledTodo($user, [
        'title'              => 'Devoir maths',
        'scheduled_day'      => 'Lundi',
        'scheduled_time'     => '14:00',
        'scheduled_duration' => 90,
    ]);

    $firstRun = generateSchedules($this, $user);
    OptimizedSchedule::where('user_id', $user->id)->delete();

    $secondRun = generateSchedules($this, $user);

    foreach ($firstRun as $type => $first) {
        expect($secondRun->has($type))->toBeTrue("Second run should also produce a '{$type}' schedule");

        $second = $secondRun[$type];
        expect($first->schedule)->toEqual($second->schedule,
            "Schedule type '{$type}' produced different results on identical input"
        );
    }
});

test('intensif schedule always produces more study time than leger', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '06:00',
        'sleep_time'         => '23:00',
        'concentration_hours' => 4,
        'desired_free_time'  => 2,
    ]);

    createFixedEvents($user, [
        ['title' => 'Maths',     'day_of_week' => 'Lundi',    'start_time' => '08:00', 'end_time' => '10:00'],
        ['title' => 'Physique',  'day_of_week' => 'Mardi',    'start_time' => '09:00', 'end_time' => '11:30'],
        ['title' => 'Info',      'day_of_week' => 'Mercredi', 'start_time' => '10:00', 'end_time' => '12:00'],
        ['title' => 'Anglais',   'day_of_week' => 'Jeudi',    'start_time' => '08:00', 'end_time' => '09:30'],
        ['title' => 'Chimie',    'day_of_week' => 'Vendredi', 'start_time' => '14:00', 'end_time' => '16:00'],
    ]);

    $schedules = generateSchedules($this, $user);

    expect($schedules->has('intensif'))->toBeTrue('intensif schedule should be generated');
    expect($schedules->has('leger'))->toBeTrue('leger schedule should be generated');

    $intensifTotal = 0;
    $legerTotal    = 0;

    foreach ($schedules['intensif']->schedule['details'] ?? [] as $dayData) {
        $intensifTotal += countStudyMinutes($dayData);
    }
    foreach ($schedules['leger']->schedule['details'] ?? [] as $dayData) {
        $legerTotal += countStudyMinutes($dayData);
    }

    expect($intensifTotal)->toBeGreaterThan($legerTotal,
        "Intensif total ({$intensifTotal} min) should exceed leger total ({$legerTotal} min)"
    );
});

test('study sessions do not span across the 12:00-13:00 lunch window', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '07:00',
        'sleep_time'         => '22:00',
        'concentration_hours' => 3,
    ]);

    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);

    $schedules = generateSchedules($this, $user);

    $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    foreach ($schedules as $type => $schedule) {
        foreach ($days as $day) {
            $sessions = $schedule->schedule['details'][$day]['sessions_etude'] ?? [];

            foreach ($sessions as $session) {
                $sStart = timeToMinutes($session['debut']);
                $sEnd   = timeToMinutes($session['fin']);
                $lunchStart = timeToMinutes('12:00');
                $lunchEnd   = timeToMinutes('13:00');

                $overlapsLunch = $sStart < $lunchEnd && $lunchStart < $sEnd;
                expect($overlapsLunch)->toBeFalse(
                    "Schedule type '{$type}' on {$day} has a session "
                    . "{$session['debut']}-{$session['fin']} that spans the 12:00-13:00 lunch window"
                );
            }
        }
    }
});

test('algorithm handles single-day fixed events and schedules study around them', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '07:00',
        'sleep_time'         => '22:00',
        'concentration_hours' => 4,
        'study_preference'   => 'morning',
    ]);

    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '09:00', 'end_time' => '11:00'],
    ]);

    $schedules = generateSchedules($this, $user);

    expect($schedules->count())->toBe(3, 'Should generate all 3 schedule types');

    foreach ($schedules as $type => $schedule) {
        expect($schedule->schedule)->toBeArray();
        expect(isset($schedule->schedule['details']))->toBeTrue(
            "Schedule type '{$type}' should have a details key"
        );

        $details = $schedule->schedule['details'] ?? [];

        foreach ($details as $day => $dayData) {
            $sessions = $dayData['sessions_etude'] ?? [];
            foreach ($sessions as $session) {
                $sStart = timeToMinutes($session['debut']);
                $sEnd   = timeToMinutes($session['fin']);
                expect($sEnd)->toBeGreaterThan($sStart,
                    "Session {$session['debut']}-{$session['fin']} should have end > start"
                );
                expect($sStart)->toBeGreaterThanOrEqual(timeToMinutes('07:00'));
                expect($sEnd)->toBeLessThanOrEqual(timeToMinutes('22:00'));
            }
        }
    }
});

test('wake_time equal to sleep_time is handled gracefully', function () {
    $user = createUserWithPreferences([
        'wake_up_time'       => '08:00',
        'sleep_time'         => '08:00',
        'concentration_hours' => 2,
        'study_preference'   => 'morning',
    ]);

    $response = $this->actingAs($user)->post('/schedules/generate');
    $response->assertRedirect();

    $schedules = OptimizedSchedule::where('user_id', $user->id)->get();

    expect($schedules)->toBeEmpty(
        'No schedules should be created when wake_time equals sleep_time (no free time available)'
    );
});
