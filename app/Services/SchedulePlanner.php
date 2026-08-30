<?php

namespace App\Services;

/**
 * SchedulePlanner — pure, testable helper logic for the scheduling engine.
 *
 * These helpers implement the hard/soft/flexible constraint model and the
 * capacity/overload detection described in the scheduler. They are pure
 * (no side effects, no DB) so they can be unit-tested in isolation and
 * reused by both the generator and the calendar/export pipeline.
 *
 * Constraint model:
 *  - HARD  : sleep windows and fixed events can never be scheduled over.
 *  - HARD  : "committed" daily tasks (is_scheduled true) claim their slot.
 *  - SOFT  : preferences (study_preference, concentration_hours,
 *            desired_free_time) guide where/how long sessions run.
 *  - FLEXIBLE: pending daily todos can be placed in remaining free time.
 */
class SchedulePlanner
{
    /** French internal day keys — the canonical order used throughout. */
    public const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    /** Convert "HH:MM" / "HH:MM:SS" to minutes since midnight. */
    public static function toMinutes($time): int
    {
        if (is_string($time)) {
            $parts = explode(':', $time);
            return (int) $parts[0] * 60 + (int) $parts[1];
        }
        return (int) $time;
    }

    /** Minutes since midnight → "HH:MM" (wraps past midnight defensively). */
    public static function minutesToTime($minutes): string
    {
        $minutes = ((int) $minutes) % 1440;
        if ($minutes < 0) {
            $minutes += 1440;
        }
        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    /** Semantic sleep protection threshold (0.0–1.0) of the awake window. */
    public const MAX_LOAD_RATIO = 0.85;

    /**
     * Daily capacity check: how much committed (HARD) time is already claimed
     * within the awake window, and whether it leaves enough break/free buffer.
     *
     * @param int   $wakeMin        awake start (minutes)
     * @param int   $sleepMin       awake end (minutes)
     * @param array $hardRanges     [['start'=>min,'end'=>min]] fixed/committed
     *
     * @return array{awake:int, occupied:int, free:int, load:float, overloaded:bool}
     */
    public static function dailyCapacity(int $wakeMin, int $sleepMin, array $hardRanges): array
    {
        $awake = max(0, $sleepMin - $wakeMin);
        $occupied = 0;

        foreach ($hardRanges as $r) {
            $s = max((int) $r['start'], $wakeMin);
            $e = min((int) $r['end'], $sleepMin);
            if ($e > $s) {
                $occupied += $e - $s;
            }
        }

        $occupied = min($occupied, $awake);
        $free = max(0, $awake - $occupied);
        $load = $awake > 0 ? $occupied / $awake : 0;

        return [
            'awake'      => $awake,
            'occupied'   => $occupied,
            'free'       => $free,
            'load'       => round($load * 100, 1),
            'overloaded' => $load > self::MAX_LOAD_RATIO,
        ];
    }

    /**
     * Apply the user's desired free time: reduce how full a day should be.
     *
     * @param int $desiredFreeHours  preference desired_free_time (hours)
     */
    public static function adjustedSessionCap(int $awake, int $desiredFreeHours): int
    {
        $freeNeeded = max(0, $desiredFreeHours) * 60;
        return max(0, $awake - $freeNeeded);
    }

    /**
     * Estimate a default placement duration (minutes) for a flexible daily
     * todo based on its difficulty (`priority` 1..5, default 3).
     */
    public static function difficultyDuration(int $priority): int
    {
        $map = [1 => 20, 2 => 30, 3 => 45, 4 => 60, 5 => 75];
        $p = max(1, min(5, $priority));

        return $map[$p];
    }

    /**
     * Short human explanation (French keys) of why a day looks the way it does.
     * Kept in plain language — no false "perfect optimisation" claims.
     *
     * @param array $capacity  result of dailyCapacity()
     * @param array $dayData   generated day (sessions_etude, cours_fixes)
     */
    public static function dayExplanation(array $capacity, array $dayData): string
    {
        $sessions = count($dayData['sessions_etude'] ?? []);
        $fixed    = count($dayData['cours_fixes']    ?? []);

        $parts = [];

        if ($capacity['overloaded']) {
            $parts[] = "Jour très chargé (environ {$capacity['load']}% du temps éveillé est déjà occupé par vos cours et engagements fixes) — il reste peu de marge de manœuvre.";
        } elseif ($capacity['load'] >= 50) {
            $parts[] = "Jour plutôt chargé (environ {$capacity['load']}% du temps éveillé est occupé), avec quelques créneaux libres restants.";
        } else {
            $parts[] = "Jour assez libre (environ {$capacity['load']}% du temps éveillé occupé), beaucoup de marge pour étudier.";
        }

        if ($fixed > 0) {
            $parts[] = "{$fixed} créneau(x) fixe(s) ont été respectés sans chevauchement.";
        } else {
            $parts[] = "Aucun cours fixe ce jour-là.";
        }

        if ($sessions > 0) {
            $parts[] = "{$sessions} session(s) d'étude ont été placées dans les créneaux libres, avec de vraies pauses entre elles.";
        } else {
            $parts[] = "Aucune session d'étude n'a pu être ajoutée (soit jour de repos, soit créneaux trop courts).";
        }

        return implode(' ', $parts);
    }

    /**
     * Overlap test between [start,end) and a list of [start,end) ranges.
     */
    public static function overlaps(int $start, int $end, array $ranges): bool
    {
        foreach ($ranges as $r) {
            if ($start < (int) $r['end'] && $end > (int) $r['start']) {
                return true;
            }
        }

        return false;
    }
}
