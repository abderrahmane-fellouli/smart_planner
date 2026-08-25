<?php

namespace App\Http\Controllers;

use App\Models\FixedEvent;
use App\Models\OptimizedSchedule;
use App\Models\TodoItem;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $activeSchedule = OptimizedSchedule::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        // Schedule data uses French day names as internal keys (Lundi, Mardi, etc.)
        $frDayMap = [
            1 => 'Lundi',
            2 => 'Mardi',
            3 => 'Mercredi',
            4 => 'Jeudi',
            5 => 'Vendredi',
            6 => 'Samedi',
            7 => 'Dimanche', // Sunday is scheduled like any other day
        ];

        $todayName    = $frDayMap[Carbon::now()->isoWeekday()] ?? null;
        $tomorrowName = $frDayMap[Carbon::now()->addDay()->isoWeekday()] ?? null;

        $todaySessions    = [];
        $tomorrowSessions = [];
        $weekSummary      = [
            'Lundi' => 0, 'Mardi' => 0, 'Mercredi' => 0,
            'Jeudi' => 0, 'Vendredi' => 0, 'Samedi' => 0,
            'Dimanche' => 0,
        ];

        if ($activeSchedule) {
            $details = $activeSchedule->schedule['details'] ?? [];

            foreach (array_keys($weekSummary) as $jour) {
                $weekSummary[$jour] = count($details[$jour]['sessions_etude'] ?? []);
            }

            if ($todayName && isset($details[$todayName])) {
                $todaySessions = $details[$todayName]['sessions_etude'] ?? [];
            }
            if ($tomorrowName && isset($details[$tomorrowName])) {
                $tomorrowSessions = $details[$tomorrowName]['sessions_etude'] ?? [];
            }
        }

        // Todo stats for dashboard widget
        $todoTotal = TodoItem::where('user_id', $user->id)->count();
        $todoCompleted = TodoItem::where('user_id', $user->id)->completed()->count();
        $pendingTodos = TodoItem::where('user_id', $user->id)
            ->pending()
            ->orderBy('sort_order')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'user'             => $user,
            'activeSchedule'   => $activeSchedule,
            'fixedEventsCount' => FixedEvent::where('user_id', $user->id)->count(),
            'todaySessions'    => $todaySessions,
            'tomorrowSessions' => $tomorrowSessions,
            'weekSummary'      => $weekSummary,
            'todayName'        => $todayName,
            'tomorrowName'     => $tomorrowName,
            'todoStats'        => [
                'total'     => $todoTotal,
                'completed' => $todoCompleted,
                'pending'   => $todoTotal - $todoCompleted,
            ],
            'pendingTodos'     => $pendingTodos,
        ]);
    }
}
