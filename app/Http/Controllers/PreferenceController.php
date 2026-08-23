<?php

namespace App\Http\Controllers;

use App\Models\Preference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PreferenceController extends Controller
{
    public function index()
    {
        $preferences = Preference::where('user_id', auth()->id())->first();
        return Inertia::render('Preferences/Index', ['preferences' => $preferences]);
    }

    /**
     * Save or update user study preferences.
     *
     * Uses updateOrCreate with user_id as the unique key — this means
     * each user can only have one preferences record. If it exists,
     * it's updated; otherwise, a new one is created.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'wake_up_time'          => 'required|date_format:H:i',
            'sleep_time'            => 'required|date_format:H:i',
            'study_preference'      => 'required|string|in:morning,normal,night,any',
            'concentration_hours'   => 'required|integer|min:1|max:12',
            'desired_free_time'     => 'required|integer|min:0|max:8',
        ], [], [
            'wake_up_time'        => trans('preferences.wake_up'),
            'sleep_time'          => trans('preferences.sleep_time'),
            'study_preference'    => trans('preferences.study_time_label'),
            'concentration_hours' => trans('preferences.hours_per_day'),
            'desired_free_time'   => trans('preferences.free_time'),
        ]);

        Preference::updateOrCreate(
            ['user_id' => auth()->id()],
            [
                'wake_up_time'        => $validated['wake_up_time'],
                'sleep_time'          => $validated['sleep_time'],
                'study_preference'    => $validated['study_preference'],
                'concentration_hours' => $validated['concentration_hours'],
                'desired_free_time'   => $validated['desired_free_time'],
            ]
        );

        // The success message needs to be in the user's active language.
        // The frontend passes 'lang' so we can select the right translation.
        $locale = $request->input('lang', 'fr');
        $messages = [
            'fr' => trans('messages.preferences_saved_fr'),
            'en' => trans('messages.preferences_saved_en'),
            'ar' => trans('messages.preferences_saved_ar'),
        ];
        return redirect()->back()->with('success', $messages[$locale] ?? $messages['fr']);
    }
}
