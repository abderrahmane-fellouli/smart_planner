<?php

use App\Services\SchedulePlanner;

test('toMinutes converts HH:MM and HH:MM:SS', function () {
    expect(SchedulePlanner::toMinutes('08:30'))->toBe(510);
    expect(SchedulePlanner::toMinutes('14:00:00'))->toBe(840);
    expect(SchedulePlanner::toMinutes(120))->toBe(120);
});

test('minutesToTime formats and wraps', function () {
    expect(SchedulePlanner::minutesToTime(510))->toBe('08:30');
    expect(SchedulePlanner::minutesToTime(1500))->toBe('01:00');
    expect(SchedulePlanner::minutesToTime(-10))->toBe('23:50');
});

test('dailyCapacity reports awake, occupied, free, load and overload', function () {
    // Wake 08:00 (480) → sleep 22:00 (1320) = 840 awake minutes.
    $cap = SchedulePlanner::dailyCapacity(480, 1320, [
        ['start' => 480, 'end' => 600],   // 2h fixed
        ['start' => 700, 'end' => 760],   // 1h committed
    ]);

    expect($cap['awake'])->toBe(840);
    expect($cap['occupied'])->toBe(180);
    expect($cap['free'])->toBe(660);
    expect($cap['load'])->toBeLessThan(85);
    expect($cap['overloaded'])->toBeFalse();
});

test('dailyCapacity flags overload above 85% load', function () {
    $cap = SchedulePlanner::dailyCapacity(480, 1320, [
        ['start' => 480, 'end' => 1220], // 740 min of 840 awake (~88%)
    ]);

    expect($cap['overloaded'])->toBeTrue();
    expect($cap['load'])->toBeGreaterThan(85);
});

test('dailyCapacity clips commitments to the awake window (sleep is HARD)', function () {
    // A fixed event running 06:00 (before wake 08:00) must not inflate occupancy.
    $cap = SchedulePlanner::dailyCapacity(480, 1320, [
        ['start' => 300, 'end' => 900],  // 06:00–15:00, clipped to 08:00–15:00
    ]);

    expect($cap['occupied'])->toBe(420); // 420 min of clipped time
});

test('adjustedSessionCap reserves desired free time', function () {
    $awake = 840; // 14h
    expect(SchedulePlanner::adjustedSessionCap($awake, 0))->toBe(840);
    expect(SchedulePlanner::adjustedSessionCap($awake, 2))->toBe(720);
    expect(SchedulePlanner::adjustedSessionCap($awake, 8))->toBe(360);
});

test('difficultyDuration maps 1..5 to increasing minutes', function () {
    $d1 = SchedulePlanner::difficultyDuration(1);
    $d5 = SchedulePlanner::difficultyDuration(5);
    expect($d1)->toBeLessThan($d5);
    expect(SchedulePlanner::difficultyDuration(3))->toBe(45);
    // Out-of-range values are clamped.
    expect(SchedulePlanner::difficultyDuration(0))->toBe(20);
    expect(SchedulePlanner::difficultyDuration(99))->toBe(75);
});

test('dayExplanation is human and honest', function () {
    $free = [
        'load' => 20, 'overloaded' => false, 'awake' => 840, 'occupied' => 168, 'free' => 672,
    ];
    $text = SchedulePlanner::dayExplanation($free, [
        'sessions_etude' => [['duree' => 60]],
        'cours_fixes'    => [['title' => 'Maths']],
    ]);

    expect($text)->toContain('créneau');
    expect($text)->toContain('session');
});

test('overlaps detects collision correctly', function () {
    $ranges = [['start' => 100, 'end' => 200], ['start' => 300, 'end' => 400]];
    expect(SchedulePlanner::overlaps(150, 250, $ranges))->toBeTrue();
    expect(SchedulePlanner::overlaps(200, 300, $ranges))->toBeFalse(); // touching, not overlapping
    expect(SchedulePlanner::overlaps(250, 300, $ranges))->toBeFalse();
});
