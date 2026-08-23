<?php

namespace App\Http\Controllers;

use App\Models\OptimizedSchedule;
use App\Models\FixedEvent;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $schedules = OptimizedSchedule::where('user_id', $user->id)
            ->orderBy('is_active', 'desc')
            ->get();

        // The Statistics page only displays the number of fixed courses,
        // so count them in SQL instead of hydrating every row.
        $fixedEventsCount = FixedEvent::where('user_id', $user->id)->count();

        return Inertia::render('Statistics', [
            'schedules'        => $schedules,
            'fixedEventsCount' => $fixedEventsCount,
        ]);
    }
}
