<?php

namespace App\Http\Controllers;

use App\Models\FixedEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FixedEventController extends Controller
{
    public function index()
    {
        $fixedEvents = FixedEvent::where('user_id', auth()->id())->get();
        return Inertia::render('FixedEvents/Index', ['fixedEvents' => $fixedEvents]);
    }

    public function store(Request $request)
    {
        // is_recurring_daily: when true, day_of_week is optional (event applies every day Mon-Sun).
        // When false, day_of_week is required and must be a valid day name.
        $rules = [
            'title'              => 'required|string|max:255',
            'start_time'         => 'required|date_format:H:i',
            'end_time'           => [
                'required',
                'date_format:H:i',
                // Overnight events (e.g. 22:00 -> 02:00) are not supported by the
                // schedule generator (calculateFreeSlots requires start < end), so
                // reject them with a clear message instead of silently dropping them.
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->filled('start_time') && strcmp($value, $request->input('start_time')) <= 0) {
                        $fail(trans('messages.overnight_not_supported'));
                    }
                },
            ],
            'is_recurring_daily' => 'sometimes|boolean',
        ];

        // Only require day_of_week when NOT a daily recurring task
        if (!$request->boolean('is_recurring_daily')) {
            $rules['day_of_week'] = 'required|string';
        } else {
            $rules['day_of_week'] = 'nullable|string';
        }

        $request->validate($rules);

        // Convert translated day names back to French canonical form.
        // The scheduler uses French keys (Lundi, Mardi…) internally so
        // the UI language cannot change how fixed events are matched.
        $dayOfWeek = null;
        if (!$request->boolean('is_recurring_daily') && $request->day_of_week) {
            $dayOfWeek = $this->normalizeDayToFrench($request->day_of_week);
            // If normalization returned an unknown day, reject it.
            // This prevents storing events that would silently be ignored by the algorithm.
            // The schedule generator only iterates Lundi-Dimanche, so a misspelled day
            // would be stored but never matched — confusing for the user.
            $validDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
            if (!in_array($dayOfWeek, $validDays, true)) {
                return redirect()->back()->with('error', trans('messages.invalid_day'));
            }
        }

        FixedEvent::create([
            'user_id'            => auth()->id(),
            'title'              => $request->title,
            'teacher'            => $request->input('teacher'),
            'description'        => $request->input('description'),
            'is_recurring_daily' => $request->boolean('is_recurring_daily'),
            'day_of_week'        => $dayOfWeek,
            'start_time'         => $request->start_time,
            'end_time'           => $request->end_time,
        ]);

        return redirect()->back()->with('success', trans('messages.course_added'));
    }

    public function destroy($id)
    {
        $event = FixedEvent::where('user_id', auth()->id())->findOrFail($id);
        $event->delete();
        return redirect()->back()->with('success', trans('messages.course_deleted'));
    }

    /**
     * Convert any translated day name back to the French canonical form.
     * This ensures schedule generation always finds the courses regardless
     * of which language the user was using when they added them.
     */
    private function normalizeDayToFrench(string $day): string
    {
        $map = [
            // French (already canonical)
            'Lundi'    => 'Lundi',
            'Mardi'    => 'Mardi',
            'Mercredi' => 'Mercredi',
            'Jeudi'    => 'Jeudi',
            'Vendredi' => 'Vendredi',
            'Samedi'   => 'Samedi',
            'Dimanche' => 'Dimanche',
            // English
            'Monday'    => 'Lundi',
            'Tuesday'   => 'Mardi',
            'Wednesday' => 'Mercredi',
            'Thursday'  => 'Jeudi',
            'Friday'    => 'Vendredi',
            'Saturday'  => 'Samedi',
            'Sunday'    => 'Dimanche',
            // Arabic
            'الاثنين'     => 'Lundi',
            'الثلاثاء'    => 'Mardi',
            'الأربعاء'    => 'Mercredi',
            'الخميس'      => 'Jeudi',
            'الجمعة'      => 'Vendredi',
            'السبت'       => 'Samedi',
            'الأحد'       => 'Dimanche',
            // Lowercase variants for robustness
            'lundi'    => 'Lundi',
            'mardi'    => 'Mardi',
            'mercredi' => 'Mercredi',
            'jeudi'    => 'Jeudi',
            'vendredi' => 'Vendredi',
            'samedi'   => 'Samedi',
            'dimanche' => 'Dimanche',
        ];

        return $map[$day] ?? $day;
    }
}
