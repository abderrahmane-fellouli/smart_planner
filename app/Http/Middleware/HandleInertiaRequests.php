<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            // Interactive onboarding tutorial state for the logged-in user.
            'tutorial' => fn () => $request->user()
                ? \App\Http\Controllers\TutorialController::state()
                : null,
            // Lightweight data-existence flags so the onboarding guide can adapt
            // its steps to what the user has already set up (it never forces
            // duplicate courses/tasks/schedules).
            'tourData' => fn () => $request->user()
                ? [
                    'has_courses'        => \App\Models\FixedEvent::where('user_id', $request->user()->id)->exists(),
                    'has_todos'          => \App\Models\TodoItem::where('user_id', $request->user()->id)->exists(),
                    'has_schedule'       => \App\Models\OptimizedSchedule::where('user_id', $request->user()->id)->exists(),
                    'has_active_schedule'=> \App\Models\OptimizedSchedule::where('user_id', $request->user()->id)->where('is_active', true)->exists(),
                ]
                : null,
            // Flash messages from redirect()->back()->with('success', ...) etc.
            // Without this, controllers' flash messages are silently lost on the frontend.
            // The fn() closures (lazy evaluation) avoid reading session data until the
            // Inertia serializer actually needs them, preventing unnecessary session loads.
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'throttled' => fn () => $request->session()->get('throttled'),
            ],
        ];
    }
}
