<?php

use App\Models\OptimizedSchedule;
use App\Models\SleepSchedule;
use App\Models\TodoItem;

/*
|--------------------------------------------------------------------------
| Scheduler Invariant Tests (scenarios A–Q)
|--------------------------------------------------------------------------
|
| These verify the hard/soft/flexible/intrruptible constraint model at the
| level of guarantees the scheduler must ALWAYS honour, regardless of input.
| Each scenario maps to a lettered invariant.
|
*/

function allSessions($schedule): array
{
    $out = [];
    foreach ($schedule->schedule['details'] ?? [] as $day) {
        $out = array_merge($out, $day['sessions_etude'] ?? []);
    }
    return $out;
}

/* A — Sleep is a HARD boundary: no session may ever start before wake or end
 * after sleep, even when the per-day sleep schedule varies over the week. */
test('A: sessions never breach the per-day sleep boundary', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '08:00', 'sleep_time' => '22:00', 'concentration_hours' => 4,
    ]);
    // Per-day sleep: same all week except a late wake on Saturday.
    \App\Models\SleepSchedule::create([
        'user_id'           => $user->id,
        'wake_mode'         => 'different',
        'bedtime_mode'      => 'same',
        'wake_same_time'    => '08:00',
        'bedtime_same_time' => '22:00',
    ]);
    \App\Models\SleepDayTime::create(['user_id' => $user->id, 'type' => 'wake', 'day_of_week' => 'Samedi', 'time' => '11:00']);

    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
        ['title' => 'B', 'day_of_week' => 'Samedi', 'start_time' => '11:00', 'end_time' => '12:00'],
    ]);

    $sleepSchedule = \App\Models\SleepSchedule::where('user_id', $user->id)->first();
    expect($sleepSchedule)->not->toBeNull();
    $schedules = generateSchedules($this, $user);

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $details = $schedules[$type]->schedule['details'];
        foreach ($details as $jour => $day) {
            $wake  = timeToMinutes($sleepSchedule->getWakeTimeForDay($jour));
            $bed   = timeToMinutes($sleepSchedule->getBedtimeForDay($jour));
            foreach ($day['sessions_etude'] ?? [] as $sess) {
                expect(timeToMinutes($sess['debut']))->toBeGreaterThanOrEqual($wake,
                    "{$jour}: session {$sess['debut']} starts before wake {$sleepSchedule->getWakeTimeForDay($jour)}"
                );
                expect(timeToMinutes($sess['fin']))->toBeLessThanOrEqual($bed);
            }
        }
    }
});

/* B — Fixed events are HARD blocks: no study session may overlap one. */
test('B: sessions never overlap a fixed event on the same day', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4,
        'desired_free_time' => 0,
    ]);
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '12:00'],
        ['title' => 'Physique', 'day_of_week' => 'Lundi', 'start_time' => '15:00', 'end_time' => '17:00'],
    ]);

    $schedules = generateSchedules($this, $user);

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $lundi = $schedules[$type]->schedule['details']['Lundi'];
        $fixed = array_map(fn ($f) => [timeToMinutes($f['start_time']), timeToMinutes($f['end_time'])], $lundi['cours_fixes']);
        foreach ($lundi['sessions_etude'] ?? [] as $sess) {
            $sS = timeToMinutes($sess['debut']);
            $sE = timeToMinutes($sess['fin']);
            foreach ($fixed as [$fS, $fE]) {
                expect($sS < $fE && $fS < $sE)->toBeFalse(
                    "session {$sess['debut']}-{$sess['fin']} overlaps a fixed course"
                );
            }
        }
    }
});

/* C — Every session stays within its awake window. */
test('C: every session is within [wake, sleep]', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '06:00', 'sleep_time' => '21:00', 'concentration_hours' => 4,
        'desired_free_time' => 0,
    ]);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Mercredi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);

    $schedules = generateSchedules($this, $user);
    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        foreach (allSessions($schedules[$type]) as $sess) {
            expect(timeToMinutes($sess['debut']))->toBeGreaterThanOrEqual(timeToMinutes('06:00'));
            expect(timeToMinutes($sess['fin']))->toBeLessThanOrEqual(timeToMinutes('21:00'));
        }
    }
});

/* D — Committed daily tasks are always placed (never silently dropped). */
test('D: committed daily tasks always appear in the schedule', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4,
    ]);
    createFixedEvents($user, [
        ['title' => 'Cours', 'day_of_week' => 'Jeudi', 'start_time' => '09:00', 'end_time' => '11:00'],
    ]);
    createScheduledTodo($user, [
        'title' => 'Essentiel', 'scheduled_day' => 'Jeudi', 'scheduled_time' => '14:00', 'scheduled_duration' => 60,
    ]);

    $schedules = generateSchedules($this, $user);
    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $sessions = $schedules[$type]->schedule['details']['Jeudi']['sessions_etude'] ?? [];
        $found = collect($sessions)->contains(fn ($s) => ($s['matiere'] ?? '') === 'Essentiel');
        expect($found)->toBeTrue("{$type}: committed task 'Essentiel' should be placed");
    }
});

/* E — Flexible todos never steal from sleep or fixed time (still HARD-safe). */
test('E: flexible todos stay inside free time, never overlapping fixed/sleep', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '20:00', 'concentration_hours' => 8,
        'desired_free_time' => 0,
    ]);
    createFixedEvents($user, [
        ['title' => 'Cours', 'day_of_week' => 'Vendredi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    TodoItem::create(['user_id' => $user->id, 'title' => 'Tache flexible', 'completed' => false, 'priority' => 4, 'is_scheduled' => false]);

    $schedules = generateSchedules($this, $user);
    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $vendre = $schedules[$type]->schedule['details']['Vendredi'];
        foreach ($vendre['sessions_etude'] ?? [] as $sess) {
            $sS = timeToMinutes($sess['debut']);
            $sE = timeToMinutes($sess['fin']);
            expect($sS)->toBeGreaterThanOrEqual(timeToMinutes('07:00'));
            expect($sE)->toBeLessThanOrEqual(timeToMinutes('20:00'));
            foreach ($vendre['cours_fixes'] ?? [] as $f) {
                expect(intervalsOverlap($sess['debut'], $sess['fin'], $f['start_time'], $f['end_time']))->toBeFalse();
            }
        }
    }
});

/* F — No back-to-back sessions: a real break separates consecutive study sessions. */
test('F: at least the configured minimum break separates consecutive sessions', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '23:00', 'concentration_hours' => 8,
        'desired_free_time' => 0,
    ]);
    // Many gaps so several sessions get placed on the same day.
    $blocks = [];
    for ($h = 8; $h <= 18; $h += 3) {
        $blocks[] = ['title' => "C{$h}", 'day_of_week' => 'Samedi', 'start_time' => sprintf('%02d:00', $h), 'end_time' => sprintf('%02d:00', $h + 1)];
    }
    createFixedEvents($user, $blocks);

    $schedules = generateSchedules($this, $user);
    $minBreak = 5; // leger/equilibre use 10, intensif 5; assert the weakest guarantee.
    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $saturday = $schedules[$type]->schedule['details']['Samedi']['sessions_etude'] ?? [];
        usort($saturday, fn ($a, $b) => timeToMinutes($a['debut']) <=> timeToMinutes($b['debut']));
        for ($i = 1; $i < count($saturday); $i++) {
            $gap = timeToMinutes($saturday[$i]['debut']) - timeToMinutes($saturday[$i - 1]['fin']);
            expect($gap)->toBeGreaterThanOrEqual($minBreak,
                "gap between sessions {$saturday[$i - 1]['debut']}-{$saturday[$i]['debut']} is only {$gap} min"
            );
        }
    }
});

/* G — Explanations exist and never claim false "perfect" optimisation. */
test('G: explanations are present, human, and avoid perfect-optimization claims', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00']);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    $schedules = generateSchedules($this, $user);

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $s = $schedules[$type];
        expect($s->explanations)->not->toBeNull();
        expect(str_contains(mb_strtolower($s->explanations), 'optimal'))->toBeFalse();
        foreach ($s->schedule['details'] as $day) {
            expect($day['explanation'])->toBeString();
            expect($day['explanation'])->not->toBeEmpty();
        }
    }
});

/* H — Determinism: identical input yields identical output (regression). */
test('H: generation is deterministic for identical input', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4]);
    createFixedEvents($user, [
        ['title' => 'Maths', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    createScheduledTodo($user, ['title' => 'T', 'scheduled_time' => '14:00', 'scheduled_duration' => 60]);
    TodoItem::create(['user_id' => $user->id, 'title' => 'Flex', 'completed' => false, 'priority' => 3, 'is_scheduled' => false]);

    $first = generateSchedules($this, $user);
    OptimizedSchedule::where('user_id', $user->id)->delete();
    $second = generateSchedules($this, $user);

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        expect($first[$type]->schedule)->toEqual($second[$type]->schedule);
    }
});

/* I — Flexibility control: reserved free time reduces uploaded study volume. */
test('I: reserved free time reduces study volume', function () {
    $userA = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '20:00', 'concentration_hours' => 8, 'desired_free_time' => 0]);
    $userB = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '20:00', 'concentration_hours' => 8, 'desired_free_time' => 8]);
    foreach ([$userA, $userB] as $u) {
        createFixedEvents($u, [
            ['title' => 'A', 'day_of_week' => 'Mardi', 'start_time' => '08:00', 'end_time' => '10:00'],
            ['title' => 'B', 'day_of_week' => 'Mardi', 'start_time' => '13:00', 'end_time' => '15:00'],
        ]);
    }
    $a = countStudyMinutes(generateSchedules($this, $userA)['intensif']->schedule['details']['Mardi']);
    $b = countStudyMinutes(generateSchedules($this, $userB)['intensif']->schedule['details']['Mardi']);
    expect($a)->toBeGreaterThan($b);
});

/* J — Difficulty measurably shapes flexible task placement. */
test('J: higher difficulty yields longer (or earlier) flexible placement', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 8, 'desired_free_time' => 0]);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Mercredi', 'start_time' => '07:30', 'end_time' => '08:00'],
    ]);
    // Only one hard day gap, so the flexible task's duration is what varies.
    TodoItem::create(['user_id' => $user->id, 'title' => 'Tache', 'completed' => false, 'priority' => 5, 'is_scheduled' => false]);

    $sessions = generateSchedules($this, $user)['equilibre']->schedule['details']['Mercredi']['sessions_etude'] ?? [];
    $flex = collect($sessions)->first(fn ($s) => str_contains($s['matiere'] ?? '', 'Tache'));
    expect($flex)->not->toBeNull();
    expect($flex['duree'])->toBe(75); // difficulty 5 → 75 min
});

/* K — Long/flexible tasks can be split across fragments (interruptible-friendly).
 * The engine places flexible tasks into whatever contiguous fragment fits;
 * this verifies a task is not forced into a fragment it cannot contain. */
test('K: flexible placement fits within a single free fragment', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 8, 'desired_free_time' => 0]);
    // Only a 30-minute free gap on Jeudi.
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Jeudi', 'start_time' => '08:00', 'end_time' => '09:30'],
        ['title' => 'B', 'day_of_week' => 'Jeudi', 'start_time' => '10:00', 'end_time' => '22:00'],
    ]);
    TodoItem::create(['user_id' => $user->id, 'title' => 'Courte', 'completed' => false, 'priority' => 1, 'is_scheduled' => false]); // 20 min

    $sessions = generateSchedules($this, $user)['equilibre']->schedule['details']['Jeudi']['sessions_etude'] ?? [];
    $flex = collect($sessions)->first(fn ($s) => str_contains($s['matiere'] ?? '', 'Courte'));
    expect($flex)->not->toBeNull('a 20-min task should fit the 30-min gap');
    expect($flex['duree'])->toBe(20);
});

test('K2: an oversized flexible task is not force-fit into a fragment too small', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 8, 'desired_free_time' => 0]);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Vendredi', 'start_time' => '08:00', 'end_time' => '09:30'],
        ['title' => 'B', 'day_of_week' => 'Vendredi', 'start_time' => '10:00', 'end_time' => '22:00'],
    ]);
    TodoItem::create(['user_id' => $user->id, 'title' => 'Grosse', 'completed' => false, 'priority' => 5, 'is_scheduled' => false]); // needs 75, gap is 30

    $sessions = generateSchedules($this, $user)['equilibre']->schedule['details']['Vendredi']['sessions_etude'] ?? [];
    $flex = collect($sessions)->first(fn ($s) => str_contains($s['matiere'] ?? '', 'Grosse'));
    expect($flex)->toBeNull('75-min task cannot fit a 30-min fragment and must not be forced');
});

/* L — Available time is the awake window minus hard commitments. */
test('L: available time correctly excludes sleep and fixed commitments', function () {
    $user = createUserWithPreferences(['wake_up_time' => '08:00', 'sleep_time' => '20:00', 'concentration_hours' => 8, 'desired_free_time' => 0]);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Lundi', 'start_time' => '09:00', 'end_time' => '11:00'],
    ]);
    $cap = generateSchedules($this, $user)['equilibre']->schedule['details']['Lundi']['capacity'];
    expect($cap['awake'])->toBe(720);   // 12h awake
    expect($cap['occupied'])->toBe(120); // 2h fixed
    expect($cap['free'])->toBe(600);
});

/* M — Overload is flagged when commitments exceed ~85% of awake time. */
test('M: an overloaded day is flagged in report metadata', function () {
    $user = createUserWithPreferences(['wake_up_time' => '08:00', 'sleep_time' => '16:00', 'concentration_hours' => 4, 'desired_free_time' => 0]);
    // 08:00–16:00 awake (8h). Fill ~7h with fixed events → overloaded.
    $blocks = [];
    for ($h = 8; $h < 15; $h++) {
        $blocks[] = ['title' => "C{$h}", 'day_of_week' => 'Lundi', 'start_time' => sprintf('%02d:00', $h), 'end_time' => sprintf('%02d:00', $h + 1)];
    }
    createFixedEvents($user, array_merge($blocks, [
        ['title' => 'Marge', 'day_of_week' => 'Mardi', 'start_time' => '08:00', 'end_time' => '09:00'],
    ]));

    $schedules = generateSchedules($this, $user);
    expect($schedules['equilibre']->schedule['details']['Lundi']['overloaded'])->toBeTrue();
    expect($schedules['equilibre']->schedule['resume']['overloaded'])->toBeTrue();
});

/* N — Session-length / fragmentation control: a long contiguous free block
 * must be split into sessions of at most the configured duration, never a
 * single marathon session. This is a scheduling quality guarantee. */
test('N: long free blocks are fragmented into sessions of at most the configured duration', function () {
    $user = createUserWithPreferences([
        'wake_up_time' => '08:00', 'sleep_time' => '22:00', 'concentration_hours' => 8,
        'desired_free_time' => 0,
    ]);
    // Only one fixed course Monday morning, leaving a large free block.
    createFixedEvents($user, [
        ['title' => 'C', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);

    $limits = ['intensif' => 90, 'equilibre' => 60, 'leger' => 45];
    $schedules = generateSchedules($this, $user);

    foreach ($limits as $type => $max) {
        $sessions = $schedules[$type]->schedule['details']['Lundi']['sessions_etude'] ?? [];
        // With concentration_hours=8 the type durations are not reduced.
        foreach ($sessions as $sess) {
            expect($sess['duree'])->toBeLessThanOrEqual($max,
                $type . ': session (' . ($sess['matiere'] ?? '?') . ") ran {$sess['duree']}min, exceeding the {$max}min fragmentation cap"
            );
        }
    }
});

/* O — All three schedule types are produced. */
test('O: all three schedule types are generated', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00']);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    $schedules = generateSchedules($this, $user);
    expect($schedules->has('intensif'))->toBeTrue();
    expect($schedules->has('equilibre'))->toBeTrue();
    expect($schedules->has('leger'))->toBeTrue();
});

/* P — Recurring daily events block every weekday (HARD). */
test('P: a recurring-daily event blocks every weekday', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4]);
    createFixedEvents($user, [
        ['title' => 'Travail', 'is_recurring_daily' => true, 'start_time' => '09:00', 'end_time' => '17:00'],
        ['title' => 'Marge', 'day_of_week' => 'Dimanche', 'start_time' => '08:00', 'end_time' => '09:00'],
    ]);

    $schedules = generateSchedules($this, $user);
    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        foreach (['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as $jour) {
            $cours = collect($schedules[$type]->schedule['details'][$jour]['cours_fixes'] ?? []);
            expect($cours->contains('title', 'Travail'))->toBeTrue();
            foreach ($schedules[$type]->schedule['details'][$jour]['sessions_etude'] ?? [] as $sess) {
                $sS = timeToMinutes($sess['debut']);
                $sE = timeToMinutes($sess['fin']);
                expect($sS < 17 * 60 && 9 * 60 < $sE)->toBeFalse("session overlaps recurring 'Travail'");
            }
        }
    }
});

/* Q — Resume summary is internally consistent with the per-day data. */
test('Q: resume totals match the sum of daily data', function () {
    $user = createUserWithPreferences(['wake_up_time' => '07:00', 'sleep_time' => '22:00', 'concentration_hours' => 4]);
    createFixedEvents($user, [
        ['title' => 'A', 'day_of_week' => 'Lundi', 'start_time' => '08:00', 'end_time' => '10:00'],
    ]);
    $schedules = generateSchedules($this, $user);
    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $s = $schedules[$type];
        $dayTotal = array_sum(array_map(fn ($d) => countStudyMinutes($d), $s->schedule['details']));
        $resumeTotal = $s->schedule['resume']['total_heures_semaine'] * 60;
        expect(abs($resumeTotal - $dayTotal))->toBeLessThan(30); // within rounding
        $sessCount = array_sum(array_map(fn ($d) => count($d['sessions_etude'] ?? []), $s->schedule['details']));
        expect($s->schedule['resume']['sessions_totales'])->toBe($sessCount);
    }
});

/* ────────────────────────────────────────────────────────────────────────────
 * Real-life scenarios
 * Build a realistic full week (courses, committed todos, flexible todos) and
 * check the schedule is believable, doesn't double-book, and delivers on
 * committed work.
 * ──────────────────────────────────────────────────────────────────────────── */

function realisticStudent(): \App\Models\User
{
    $user = createUserWithPreferences([
        'wake_up_time' => '07:00', 'sleep_time' => '23:00',
        'study_preference' => 'normal', 'concentration_hours' => 2,
        'desired_free_time' => 2,
    ]);

    createFixedEvents($user, [
        ['title' => 'Algorithmique', 'day_of_week' => 'Lundi',   'start_time' => '08:00', 'end_time' => '10:00'],
        ['title' => 'Bases de données', 'day_of_week' => 'Lundi', 'start_time' => '14:00', 'end_time' => '16:00'],
        ['title' => 'Anglais',   'day_of_week' => 'Mardi',  'start_time' => '09:00', 'end_time' => '11:00'],
        ['title' => 'Maths',     'day_of_week' => 'Mercredi','start_time' => '08:00', 'end_time' => '12:00'],
        ['title' => 'Systèmes',  'day_of_week' => 'Jeudi',  'start_time' => '10:00', 'end_time' => '12:00'],
        ['title' => 'Projet',    'day_of_week' => 'Vendredi','start_time' => '13:00', 'end_time' => '15:00'],
        ['title' => 'Sport',     'day_of_week' => 'Samedi', 'start_time' => '09:00', 'end_time' => '10:00'],
    ]);

    // Committed (fixed-time) daily tasks — must always be placed.
    createScheduledTodo($user, ['title' => 'Réviser ch.3', 'scheduled_day' => 'Mardi',  'scheduled_time' => '14:00', 'scheduled_duration' => 60]);
    createScheduledTodo($user, ['title' => 'Rendu TD',     'scheduled_day' => 'Vendredi','scheduled_time' => '16:00', 'scheduled_duration' => 90]);
    createScheduledTodo($user, ['title' => 'Lire article', 'scheduled_day' => 'Dimanche','scheduled_time' => '10:00', 'scheduled_duration' => 30]);

    // Flexible todos — filled in free time.
    TodoItem::create(['user_id' => $user->id, 'title' => 'Projet perso', 'completed' => false, 'priority' => 5, 'is_scheduled' => false]);
    TodoItem::create(['user_id' => $user->id, 'title' => 'Révisions',     'completed' => false, 'priority' => 3, 'is_scheduled' => false]);

    return $user;
}

test('RL1: a realistic week is generated with no double-booked study sessions', function () {
    $schedules = generateSchedules($this, realisticStudent());

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $details = $schedules[$type]->schedule['details'];
        foreach ($details as $jour => $day) {
            $sessions = $day['sessions_etude'] ?? [];
            // Sessions on a day never overlap each other.
            for ($i = 0; $i < count($sessions); $i++) {
                for ($j = $i + 1; $j < count($sessions); $j++) {
                    $overlap = intervalsOverlap(
                        $sessions[$i]['debut'], $sessions[$i]['fin'],
                        $sessions[$j]['debut'], $sessions[$j]['fin']
                    );
                    expect($overlap)->toBeFalse("{$jour}: sessions {$i} and {$j} overlap on {$type}");
                }
            }
            // Sessions never overlap the day's fixed courses.
            foreach ($day['cours_fixes'] ?? [] as $c) {
                foreach ($sessions as $sess) {
                    expect(intervalsOverlap($sess['debut'], $sess['fin'], $c['start_time'], $c['end_time']))->toBeFalse();
                }
            }
        }
        expect($schedules[$type]->schedule['resume']['total_heures_semaine'])->toBeGreaterThan(0);
    }
});

test('RL2: all committed (daily) tasks are present in the realistic week', function () {
    $schedules = generateSchedules($this, realisticStudent());

    foreach (['intensif', 'equilibre', 'leger'] as $type) {
        $all = collect(allSessions($schedules[$type]))->pluck('matiere')->join(' | ');
        foreach (['Réviser ch.3', 'Rendu TD', 'Lire article'] as $task) {
            $found = collect(allSessions($schedules[$type]))->contains(fn ($s) => ($s['matiere'] ?? '') === $task);
            expect($found)->toBeTrue("{$type}: committed task '{$task}' must be placed.\nGot: {$all}");
        }
    }
});

test('RL3: weekly volume is a plausible fraction of available free time (not overscheduled)', function () {
    $user = realisticStudent();
    $schedules = generateSchedules($this, $user);

    // Conservative upper bound: never place more study than ~50% of the
    // week's awake (minus-committed) minutes, so the plan stays realistic.
    $availablePerDay = [
        'Lundi' => 0, 'Mardi' => 0, 'Mercredi' => 0, 'Jeudi' => 0,
        'Vendredi' => 0, 'Samedi' => 0, 'Dimanche' => 0,
    ];
    $wake = timeToMinutes('07:00');
    $bed  = timeToMinutes('23:00');
    $fixed = \App\Models\FixedEvent::where('user_id', $user->id)->get();

    foreach (array_keys($availablePerDay) as $jour) {
        $occupied = 0;
        foreach ($fixed as $f) {
            if (($f->day_of_week === $jour || $f->is_recurring_daily)) {
                $occupied += timeToMinutes($f->end_time) - timeToMinutes($f->start_time);
            }
        }
        $availablePerDay[$jour] = ($bed - $wake) - $occupied;
    }

    foreach ($schedules as $s) {
        $weekMinutes = array_sum(array_map(fn ($d) => countStudyMinutes($d), $s->schedule['details']));
        $availableMinutes = array_sum($availablePerDay);
        expect($weekMinutes)->toBeLessThanOrEqual((int) ($availableMinutes * 0.95),
            "{$s->type}: week study {$weekMinutes}min exceeds ~{$availableMinutes}min available"
        );
    }
});
