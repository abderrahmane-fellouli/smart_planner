<?php

namespace App\Http\Controllers;

use App\Models\Preference;
use Illuminate\Http\Request;

class TutorialController extends Controller
{
    /**
     * Current tutorial schema version. Bump to 2 (and add a migration) if the
     * step definition changes in a way that should re-trigger the guide for
     * users who already completed/skipped an older revision.
     */
    public const TUTORIAL_VERSION = 1;

    /**
     * Resolve the stored tutorial state for the current user.
     * Returns a normalized array with safe defaults.
     */
    public static function state(): array
    {
        $pref = Preference::where('user_id', auth()->id())->first();
        $raw = $pref && is_array($pref->tutorial) ? $pref->tutorial : [];
        $raw['version'] = $raw['version'] ?? self::TUTORIAL_VERSION;

        return [
            'version'   => (int) ($raw['version'] ?? self::TUTORIAL_VERSION),
            'started'   => (bool) ($raw['started'] ?? false),
            'completed' => (bool) ($raw['completed'] ?? false),
            'skipped'   => (bool) ($raw['skipped'] ?? false),
            'step'      => (int) ($raw['step'] ?? 0),
        ];
    }

    /**
     * Persist incremental tutorial state.
     *
     * A partial update is enough — the payload carries the fields the client
     * wants to change (started/completed/skipped/step). We merge it into the
     * stored JSON so a client that is temporarily out of sync does not wipe
     * unrelated flags. Always normalize version from the server constant so
     * the client can never store a mismatched revision.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'started'   => 'sometimes|boolean',
            'completed' => 'sometimes|boolean',
            'skipped'   => 'sometimes|boolean',
            'step'      => 'sometimes|integer|min:0|max:999',
        ]);

        $pref = Preference::firstOrCreate(['user_id' => auth()->id()]);
        $current = is_array($pref->tutorial) ? $pref->tutorial : [];

        $current = array_merge($current, $validated);
        $current['version'] = self::TUTORIAL_VERSION;

        $pref->tutorial = $current;
        $pref->save();

        return response()->json(self::state());
    }

    /**
     * Explicitly reset the tutorial state so the guide can be run again from
     * the beginning (used by the "Start SmartPlanner Guide" action).
     */
    public function reset(Request $request)
    {
        $pref = Preference::firstOrCreate(['user_id' => auth()->id()]);
        $pref->tutorial = [
            'version' => self::TUTORIAL_VERSION,
            'started' => false,
            'completed' => false,
            'skipped' => false,
            'step' => 0,
        ];
        $pref->save();

        return response()->json(self::state());
    }
}
