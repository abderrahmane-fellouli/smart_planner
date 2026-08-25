<?php

namespace App\Http\Controllers;

use App\Models\SleepSchedule;
use App\Models\SleepDayTime;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SleepScheduleController extends Controller
{
    private const FRENCH_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    public function index()
    {
        $userId = auth()->id();
        $schedule = SleepSchedule::where('user_id', $userId)->first();

        // Auto-migrate existing Preference wake/sleep times into SleepSchedule (one-time)
        if (!$schedule) {
            $pref = \App\Models\Preference::where('user_id', $userId)->first();
            if ($pref && ($pref->wake_up_time || $pref->sleep_time)) {
                $schedule = SleepSchedule::create([
                    'user_id'          => $userId,
                    'wake_mode'        => 'same',
                    'bedtime_mode'     => 'same',
                    'wake_same_time'   => $pref->wake_up_time ? substr($pref->wake_up_time, 0, 5) : '07:00',
                    'bedtime_same_time'=> $pref->sleep_time   ? substr($pref->sleep_time, 0, 5)   : '22:00',
                ]);
            }
        }

        $dayTimes = SleepDayTime::where('user_id', $userId)->get();

        return Inertia::render('SleepSchedule/Index', [
            'sleepSchedule' => $schedule,
            'dayTimes' => $dayTimes,
            'days' => self::FRENCH_DAYS,
        ]);
    }

    public function store(Request $request)
    {
        $userId = auth()->id();

        $validated = $request->validate([
            'wake_mode' => 'required|string|in:same,different,except',
            'bedtime_mode' => 'required|string|in:same,different,except',
            'wake_same_time' => 'required_if:wake_mode,same|date_format:H:i',
            'bedtime_same_time' => 'required_if:bedtime_mode,same|date_format:H:i',
            'wake_except_days' => 'nullable|array',
            'bedtime_except_days' => 'nullable|array',
            'wake_day_times' => 'nullable|array',
            'wake_day_times.*.day' => 'required|string|in:' . implode(',', self::FRENCH_DAYS),
            'wake_day_times.*.time' => 'required|date_format:H:i',
            'bedtime_day_times' => 'nullable|array',
            'bedtime_day_times.*.day' => 'required|string|in:' . implode(',', self::FRENCH_DAYS),
            'bedtime_day_times.*.time' => 'required|date_format:H:i',
        ]);

        SleepSchedule::updateOrCreate(
            ['user_id' => $userId],
            [
                'wake_mode' => $validated['wake_mode'],
                'bedtime_mode' => $validated['bedtime_mode'],
                'wake_same_time' => $validated['wake_same_time'] ?? '07:00',
                'bedtime_same_time' => $validated['bedtime_same_time'] ?? '22:00',
                'wake_except_days' => $validated['wake_except_days'] ?? null,
                'bedtime_except_days' => $validated['bedtime_except_days'] ?? null,
            ]
        );

        // Delete existing day times and re-create
        SleepDayTime::where('user_id', $userId)->delete();

        if (!empty($validated['wake_day_times'])) {
            foreach ($validated['wake_day_times'] as $dt) {
                SleepDayTime::create([
                    'user_id' => $userId,
                    'type' => 'wake',
                    'day_of_week' => $dt['day'],
                    'time' => $dt['time'],
                ]);
            }
        }

        if (!empty($validated['bedtime_day_times'])) {
            foreach ($validated['bedtime_day_times'] as $dt) {
                SleepDayTime::create([
                    'user_id' => $userId,
                    'type' => 'bedtime',
                    'day_of_week' => $dt['day'],
                    'time' => $dt['time'],
                ]);
            }
        }

        $locale = $request->input('lang', 'fr');
        $messages = [
            'fr' => 'Horaires de sommeil enregistrés.',
            'en' => 'Sleep schedule saved.',
            'ar' => 'تم حفظ جدول النوم.',
        ];
        return redirect()->back()->with('success', $messages[$locale] ?? $messages['fr']);
    }
}
