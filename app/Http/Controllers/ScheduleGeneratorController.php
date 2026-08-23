<?php

namespace App\Http\Controllers;

use App\Models\FixedEvent;
use App\Models\Preference;
use App\Models\OptimizedSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;

class ScheduleGeneratorController extends Controller
{
    /**
     * Display the user's generated schedules.
     * Each user can only see their own — filtered by auth()->id().
     * This is an IDOR (Insecure Direct Object Reference) prevention pattern:
     * we never trust the client to send a user_id, we always use the authenticated user.
     */
    public function index()
    {
        $schedules = OptimizedSchedule::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules,
        ]);
    }

    /**
     * Generate 3 schedule variants (intensive, balanced, light) from the user's
     * fixed events and preferences.
     *
     * Uses a DB transaction so if anything fails, we don't lose existing schedules.
     *
     * Rate Limiting: 5 requests per minute per user.
     */
    public function generate(Request $request)
    {
        $throttleKey = 'generate-schedule-' . auth()->id();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return redirect()->back()->with('error',
                trans('messages.rate_limited', ['seconds' => $seconds]));
        }

        $userId = auth()->id();

        $fixedEvents = FixedEvent::where('user_id', $userId)->get();
        $prefs = Preference::where('user_id', $userId)->first();

        if ($fixedEvents->isEmpty()) {
            return redirect()->back()->with('error', trans('messages.no_courses_first'));
        }

        // Check if there's enough free time to generate a meaningful schedule.
        // We need at least 30 min of free time per day on average.
        $totalFreeMinutes = 0;
        $jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
        foreach ($jours as $jour) {
            $dayEvents = $this->getEventsForDay($fixedEvents, $jour);
            $slots = $this->calculateFreeSlots($dayEvents, $prefs);
            foreach ($slots as $slot) {
                $totalFreeMinutes += $this->toMinutes($slot['end']) - $this->toMinutes($slot['start']);
            }
        }

        if ($totalFreeMinutes < 30) {
            return redirect()->back()->with('error', trans('messages.no_free_time'));
        }

        // All generation happens inside a transaction — if anything fails,
        // existing schedules are preserved. We delete old schedules BEFORE generating
        // new ones so the user always gets a fresh set. This is intentional:
        // keeping old schedules around would confuse the user about which is current.
        RateLimiter::hit($throttleKey, 60);

        DB::transaction(function () use ($userId, $fixedEvents, $prefs) {
            OptimizedSchedule::where('user_id', $userId)->delete();

            $intensif  = $this->generateByType($fixedEvents, $prefs, 'intensif');
            $equilibre = $this->generateByType($fixedEvents, $prefs, 'equilibre');
            $leger     = $this->generateByType($fixedEvents, $prefs, 'leger');

            $this->saveSchedule($userId, 'intensif',  $intensif);
            $this->saveSchedule($userId, 'equilibre', $equilibre);
            $this->saveSchedule($userId, 'leger',     $leger);
        });

        return redirect()->back()->with('success', trans('messages.schedule_generated'));
    }

    /**
     * Generate a single schedule variant based on study intensity type.
     *
     * Algorithm overview:
     * 1. For each weekday (Mon-Sun), get all fixed events (including recurring daily ones)
     * 2. Calculate free time slots between fixed events within awake hours
     * 3. Sort slots by preference (morning users get morning slots first, etc.)
     * 4. Split large slots into multiple study sessions of appropriate duration
     * 5. Add breaks between sessions (5-10 min depending on type)
     * 6. Respect concentration_hours and desired_free_time preferences
     * 7. Suggest subjects deterministically (rotate through available subjects)
     *
     * The three types differ in:
     * - intensif:  90 min sessions, max 3/day, 5 min breaks
     * - equilibre: 60 min sessions, max 3/day, 10 min breaks
     * - leger:     45 min sessions, max 2/day, 10 min breaks
     */
    private function generateByType($fixedEvents, $prefs, $type)
    {
        // Session config per type — durations are now more reasonable
        $config = [
            'intensif'  => ['duration' => 90,  'maxSessions' => 3, 'minBreak' => 5],
            'equilibre' => ['duration' => 60,  'maxSessions' => 3, 'minBreak' => 10],
            'leger'     => ['duration' => 45,  'maxSessions' => 2, 'minBreak' => 10],
        ];
        $cfg = $config[$type];
        // Use concentration_hours to cap session duration if user set a lower value.
        // concentration_hours=1 means the user can only focus for ~60 min at a time.
        if ($prefs && $prefs->concentration_hours) {
            $maxSessionMin = $prefs->concentration_hours * 60;
            if ($cfg['duration'] > $maxSessionMin) {
                $cfg['duration'] = $maxSessionMin;
            }
        }

        // Study preference shifts which slots get filled first:
        // morning → prefer slots starting before 12:00
        // night   → prefer slots starting after 17:00
        // normal  → chronological order (default)
        // any     → the algorithm chooses freely: chronological order,
        //           standard session duration/breaks from the type config above
        $studyPref = $prefs?->study_preference ?? 'normal';
        $wakeUpTime = $prefs?->wake_up_time ?? '08:00:00';
        $sleepTime  = $prefs?->sleep_time ?? '22:00:00';

        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        $schedule = [];
        $subjectIndex = 0; // Deterministic subject rotation instead of array_rand

        foreach ($jours as $jour) {
            // Get ALL fixed events for this day, including recurring daily ones.
            // Recurring events (is_recurring_daily=true) appear on every weekday.
            $jourFixed = $this->getEventsForDay($fixedEvents, $jour);
            $freeSlots = $this->calculateFreeSlots($jourFixed, $prefs);

            // Sort slots based on study preference
            $freeSlots = $this->sortSlotsByPreference($freeSlots, $studyPref);

            $studySessions = [];
            $sessionsCount = 0;
            $totalMinutes = 0;
            // Track occupied time within this day to check overlaps between study sessions
            $occupiedRanges = [];

            // Convert fixed events to occupied ranges for overlap checking
            foreach ($jourFixed as $event) {
                $s = $this->toMinutes($event->start_time);
                $e = $this->toMinutes($event->end_time);
                if ($s < $e) {
                    $occupiedRanges[] = ['start' => $s, 'end' => $e];
                }
            }

            // Placed study sessions only — used to enforce minimum breaks between them.
            // Kept separate from $occupiedRanges because a pause is required between
            // consecutive study sessions, not between a study session and a fixed event.
            $studyRanges = [];

            foreach ($freeSlots as $slot) {
                if ($sessionsCount >= $cfg['maxSessions']) break;

                $slotStart = $this->toMinutes($slot['start']);
                $slotEnd   = $this->toMinutes($slot['end']);
                $slotDuration = $slotEnd - $slotStart;

                if ($slotDuration < $cfg['duration']) {
                    // Slot too small for a full session — try a shorter session
                    // if it's at least 25 minutes
                    if ($slotDuration >= 25) {
                        $sessionDuration = $slotDuration;
                    } else {
                        continue;
                    }
                } else {
                    $sessionDuration = $cfg['duration'];
                }

                // Find a start time within the slot that satisfies both constraints:
                // 1. No overlap with fixed events or already-placed study sessions
                // 2. At least cfg['minBreak'] minutes of pause next to other sessions
                //    on the same day (no back-to-back sessions)
                $sessionStart = $slotStart;
                while ($sessionStart + $sessionDuration <= $slotEnd) {
                    $sessionEnd = $sessionStart + $sessionDuration;
                    if (!$this->rangesOverlap($sessionStart, $sessionEnd, $occupiedRanges)
                        && !$this->breakConflict($sessionStart, $sessionEnd, $studyRanges, $cfg['minBreak'])) {
                        break;
                    }
                    $sessionStart += 15; // Try shifting 15 min later
                }

                $sessionEnd = $sessionStart + $sessionDuration;
                if ($sessionEnd > $slotEnd) continue; // Can't fit even after shifting

                $debut = $this->minutesToTime($sessionStart);
                $fin   = $this->minutesToTime($sessionEnd);

                // Suggest a subject using deterministic rotation
                $subject = $this->suggestSubject($fixedEvents, $jour, $subjectIndex);
                $subjectIndex++;

                $studySessions[] = [
                    'debut'   => $debut,
                    'fin'     => $fin,
                    'duree'   => $sessionDuration,
                    'matiere' => $subject,
                ];
                $occupiedRanges[] = ['start' => $sessionStart, 'end' => $sessionEnd];
                $studyRanges[]    = ['start' => $sessionStart, 'end' => $sessionEnd];
                $sessionsCount++;
                $totalMinutes += $sessionDuration;
            }

            $schedule[$jour] = [
                'cours_fixes'        => $jourFixed->values(),
                'sessions_etude'     => $studySessions,
                'total_heures_etude' => round($totalMinutes / 60, 1),
            ];
        }

        return [
            'type'    => $type,
            'details' => $schedule,
            'resume'  => [
                'total_heures_semaine' => round(array_sum(array_column($schedule, 'total_heures_etude')), 1),
                'moyenne_par_jour'     => round(array_sum(array_column($schedule, 'total_heures_etude')) / 7, 1),
                'sessions_totales'     => array_sum(array_map(fn($j) => count($j['sessions_etude']), $schedule)),
            ],
        ];
    }

    /**
     * Get fixed events for a specific day, including recurring daily events.
     *
     * Recurring events (is_recurring_daily=true) appear on every weekday.
     * Regular events only appear on their assigned day_of_week.
     */
    private function getEventsForDay($allFixedEvents, string $jour)
    {
        $jourFixed = $allFixedEvents->filter(function ($event) use ($jour) {
            // Recurring daily events apply to every weekday
            if ($event->is_recurring_daily) {
                return true;
            }
            // Regular events only match their specific day
            return $event->day_of_week === $jour;
        });

        return $jourFixed;
    }

    /**
     * Calculate free time slots for a day, given fixed events and wake/sleep times.
     *
     * Algorithm:
     * 1. Define the full awake window [wakeUp, sleep]
     * 2. Map all fixed events into this window (clipped to bounds)
     * 3. Sort and merge overlapping events
     * 4. The gaps between merged events are the free slots
     */
    private function calculateFreeSlots($fixedEvents, $prefs)
    {
        $wakeUpTime = $prefs?->wake_up_time ?? '08:00:00';
        $sleepTime  = $prefs?->sleep_time ?? '22:00:00';

        $wake  = $this->toMinutes($wakeUpTime);
        $sleep = $this->toMinutes($sleepTime);

        // Fallback: if wake >= sleep (misconfigured), use 7:00-23:00
        if ($wake >= $sleep) {
            $wake  = 420;
            $sleep = 1380;
        }

        $occupied = [];
        foreach ($fixedEvents as $event) {
            $start = max($this->toMinutes($event->start_time), $wake);
            $end   = min($this->toMinutes($event->end_time), $sleep);
            if ($start < $end) {
                $occupied[] = ['start' => $start, 'end' => $end];
            }
        }

        usort($occupied, fn($a, $b) => $a['start'] - $b['start']);

        // Merge overlapping blocks
        $merged = [];
        foreach ($occupied as $block) {
            if (empty($merged) || $block['start'] > $merged[count($merged)-1]['end']) {
                $merged[] = $block;
            } else {
                $merged[count($merged)-1]['end'] = max($merged[count($merged)-1]['end'], $block['end']);
            }
        }

        // Compute gaps as free slots
        $freeSlots = [];
        $cursor = $wake;

        foreach ($merged as $block) {
            if ($block['start'] > $cursor) {
                $freeSlots[] = [
                    'start' => $this->minutesToTime($cursor),
                    'end'   => $this->minutesToTime($block['start']),
                ];
            }
            $cursor = max($cursor, $block['end']);
        }

        if ($cursor < $sleep) {
            $freeSlots[] = [
                'start' => $this->minutesToTime($cursor),
                'end'   => $this->minutesToTime($sleep),
            ];
        }

        return $freeSlots;
    }

    /**
     * Sort free slots based on the user's study preference.
     *
     * morning → slots starting before 12:00 first
     * night   → slots starting after 17:00 first
     * normal  → chronological (no change)
     * any     → algorithm chooses freely: chronological (same as normal)
     */
    private function sortSlotsByPreference($slots, string $studyPref): array
    {
        if ($studyPref === 'morning') {
            usort($slots, function ($a, $b) {
                $aMin = $this->toMinutes($a['start']);
                $bMin = $this->toMinutes($b['start']);
                // Morning slots (before 12:00 = 720 min) first
                $aMorning = $aMin < 720 ? 0 : 1;
                $bMorning = $bMin < 720 ? 0 : 1;
                if ($aMorning !== $bMorning) return $aMorning - $bMorning;
                return $aMin - $bMin;
            });
        } elseif ($studyPref === 'night') {
            usort($slots, function ($a, $b) {
                $aMin = $this->toMinutes($a['start']);
                $bMin = $this->toMinutes($b['start']);
                // Evening slots (after 17:00 = 1020 min) first
                $aEvening = $aMin >= 1020 ? 0 : 1;
                $bEvening = $bMin >= 1020 ? 0 : 1;
                if ($aEvening !== $bEvening) return $aEvening - $bEvening;
                return $aMin - $bMin;
            });
        }
        // 'normal' = chronological, no sort needed
        return $slots;
    }

    /**
     * Check if a time range [start, end) overlaps any range in $ranges.
     * All values are in minutes since midnight.
     */
    private function rangesOverlap(int $start, int $end, array $ranges): bool
    {
        foreach ($ranges as $r) {
            if ($start < $r['end'] && $end > $r['start']) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if placing a session at [start, end) violates the minimum break
     * requirement relative to other study sessions already placed on the same day.
     *
     * A conflict occurs when the new session either overlaps an existing study
     * session or leaves less than $minBreak minutes of pause next to one
     * (before or after). With $minBreak = 0 this reduces to a plain overlap check.
     * All values are in minutes since midnight.
     */
    private function breakConflict(int $start, int $end, array $studyRanges, int $minBreak): bool
    {
        foreach ($studyRanges as $r) {
            if ($start < $r['end'] + $minBreak && $end > $r['start'] - $minBreak) {
                return true;
            }
        }
        return false;
    }

    /**
     * Move a study session to a new time slot within the same day.
     *
     * Validates:
     * - New time falls within the user's wake/sleep window
     * - No overlap with fixed events (including recurring daily)
     * - No overlap with other study sessions on the same day
     */
    public function moveSession(Request $request, $id)
    {
        $request->validate([
            'jour'          => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi,Dimanche',
            'session_index' => 'required|integer|min:0',
            'new_start'     => 'required|date_format:H:i',
        ]);

        $schedule = OptimizedSchedule::where('user_id', auth()->id())->findOrFail($id);
        $data = $schedule->schedule;

        $jour     = $request->jour;
        $idx      = $request->session_index;
        $newStart = $request->new_start;

        $sessions = $data['details'][$jour]['sessions_etude'] ?? [];
        if ($idx >= count($sessions)) {
            return redirect()->back()->with('error', trans('messages.session_invalid'));
        }

        $session  = $sessions[$idx];
        $duration = $session['duree'];

        $newStartMinutes = $this->toMinutes($newStart);
        $newEndMinutes   = $newStartMinutes + $duration;

        // Validate the session stays within the user's wake/sleep window.
        // Without this check, a user could drag a session to 3:00 AM.
        // The wake/sleep fallback (07:00-23:00) handles the edge case where
        // the user configured wake_up >= sleep_time (misconfigured preferences).
        $prefs = Preference::where('user_id', auth()->id())->first();
        $wakeMinutes  = $this->toMinutes($prefs?->wake_up_time ?? '08:00:00');
        $sleepMinutes = $this->toMinutes($prefs?->sleep_time ?? '22:00:00');
        if ($wakeMinutes >= $sleepMinutes) {
            $wakeMinutes  = 420; // 07:00
            $sleepMinutes = 1380; // 23:00
        }
        if ($newStartMinutes < $wakeMinutes || $newEndMinutes > $sleepMinutes) {
            return redirect()->back()->with('error',
                trans('messages.session_outside_hours', [
                    'start' => $this->minutesToTime($wakeMinutes),
                    'end'   => $this->minutesToTime($sleepMinutes),
                ]));
        }

        // Check against fixed events (including recurring daily)
        $allFixedEvents = FixedEvent::where('user_id', auth()->id())->get();
        $fixedOnDay = $this->getEventsForDay($allFixedEvents, $jour);

        foreach ($fixedOnDay as $event) {
            $eventStart = $this->toMinutes($event->start_time);
            $eventEnd   = $this->toMinutes($event->end_time);
            if ($newStartMinutes < $eventEnd && $newEndMinutes > $eventStart) {
                return redirect()->back()->with('error', trans('messages.session_overlap_fixed'));
            }
        }

        // Check against OTHER study sessions on the same day
        foreach ($sessions as $i => $otherSession) {
            if ($i === $idx) continue; // Skip the session being moved
            $otherStart = $this->toMinutes($otherSession['debut']);
            $otherEnd   = $this->toMinutes($otherSession['fin']);
            if ($newStartMinutes < $otherEnd && $newEndMinutes > $otherStart) {
                return redirect()->back()->with('error', trans('messages.session_overlap_study'));
            }
        }

        // Update the session times
        $session['debut'] = $newStart;
        $session['fin']   = $this->addMinutesToTime($newStart, $duration);
        $data['details'][$jour]['sessions_etude'][$idx] = $session;

        // Recalculate totals
        $totalMinutes = 0;
        foreach ($data['details'][$jour]['sessions_etude'] as $s) {
            $totalMinutes += $s['duree'];
        }
        $data['details'][$jour]['total_heures_etude'] = round($totalMinutes / 60, 1);

        $totalHeuresSemaine = 0;
        $totalSessions = 0;
        foreach ($data['details'] as $day) {
            $totalHeuresSemaine += $day['total_heures_etude'];
            $totalSessions      += count($day['sessions_etude']);
        }
        $data['resume']['total_heures_semaine'] = round($totalHeuresSemaine, 1);
        $data['resume']['moyenne_par_jour']     = round($totalHeuresSemaine / 7, 1);
        $data['resume']['sessions_totales']     = $totalSessions;

        $schedule->schedule = $data;
        $schedule->save();

        return redirect()->back()->with('success', trans('messages.session_moved'));
    }

    /**
     * Activate a specific schedule variant (set is_active=true, others false).
     */
    public function activate($id)
    {
        OptimizedSchedule::where('user_id', auth()->id())->update(['is_active' => false]);
        $schedule = OptimizedSchedule::where('user_id', auth()->id())->findOrFail($id);
        $schedule->update(['is_active' => true]);

        return redirect()->back()->with('success', trans('messages.schedule_activated'));
    }

    /**
     * Delete a schedule. Ownership enforced by user_id filter.
     */
    public function destroy($id)
    {
        $schedule = OptimizedSchedule::where('user_id', auth()->id())->findOrFail($id);
        $schedule->delete();

        return redirect()->back()->with('success', trans('messages.schedule_deleted'));
    }

    /**
     * API endpoint: get the currently active schedule as JSON.
     */
    public function getActive()
    {
        $active = OptimizedSchedule::where('user_id', auth()->id())
            ->where('is_active', true)
            ->first();

        return response()->json($active);
    }

    /**
     * Persist a generated schedule to the database.
     */
    private function saveSchedule($userId, $type, $data)
    {
        $mondayOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->toDateString();

        OptimizedSchedule::create([
            'user_id'       => $userId,
            'type'          => $type,
            'schedule'      => $data,
            'generated_for' => $mondayOfWeek,
            'is_active'     => false,
        ]);
    }

    // ── Time utility functions ──

    /** Convert "HH:MM" or "HH:MM:SS" string to total minutes since midnight */
    private function toMinutes($time)
    {
        if (is_string($time)) {
            $parts = explode(':', $time);
            return (int)$parts[0] * 60 + (int)$parts[1];
        }
        return $time;
    }

    /**
     * Convert total minutes since midnight back to "HH:MM" format.
     * Values >= 1440 (24h) wrap around past midnight (1500 -> "01:00").
     */
    private function minutesToTime($minutes)
    {
        $minutes = ((int)$minutes) % 1440;
        if ($minutes < 0) {
            $minutes += 1440;
        }
        $hours = intdiv($minutes, 60);
        $mins  = $minutes % 60;
        return sprintf('%02d:%02d', $hours, $mins);
    }

    /** Add minutes to a time string and return new time as "HH:MM" */
    private function addMinutesToTime($time, $minutes)
    {
        $totalMinutes = $this->toMinutes($time) + $minutes;
        return $this->minutesToTime($totalMinutes);
    }

    /**
     * Suggest a study subject using deterministic rotation.
     *
     * Strategy:
     * 1. Prefer subjects that have fixed courses on that day
     * 2. If none, use any subject from the full list
     * 3. Rotate through subjects deterministically (no randomness)
     */
    private function suggestSubject($fixedEvents, $jour, int $index): string
    {
        // Subjects that have courses on this day (most relevant).
        // Include both day-specific events AND daily recurring events
        // (which have day_of_week=null but apply to every weekday).
        $daySubjects = $fixedEvents
            ->filter(fn($e) => $e->day_of_week === $jour || $e->is_recurring_daily)
            ->pluck('title')->unique()->values()->toArray();

        if (!empty($daySubjects)) {
            return $daySubjects[$index % count($daySubjects)];
        }

        // Fall back to all subjects across the week
        $allSubjects = $fixedEvents->pluck('title')->unique()->values()->toArray();
        if (!empty($allSubjects)) {
            return $allSubjects[$index % count($allSubjects)];
        }

        return 'Révision générale';
    }
}
