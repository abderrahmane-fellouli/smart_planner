<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleGeneratorController;
use App\Http\Controllers\FixedEventController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\SleepScheduleController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public landing page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// Dashboard — the main hub after login
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth')
    ->name('dashboard');

// ── Authenticated routes ──
Route::middleware('auth')->group(function () {

    // Fixed courses (recurring weekly events)
    Route::resource('fixed-events', FixedEventController::class)
        ->only(['index', 'store', 'destroy']);

    // Study preferences (wake/sleep times, rhythm, etc.)
    Route::get('/preferences',  [PreferenceController::class, 'index'])->name('preferences.index');
    Route::post('/preferences', [PreferenceController::class, 'store'])->name('preferences.store');

    /* Lightweight theme-only save — no flash, no full form validation.
     * Used by the theme selector to persist theme instantly without
     * requiring the user to click "Save preferences". */
    Route::patch('/preferences/theme', [PreferenceController::class, 'updateTheme'])->name('preferences.theme');

    // Schedule management — generation uses controller-level rate limiting
    // (RateLimiter in ScheduleGeneratorController) for user-friendly wait messages.
    Route::prefix('schedules')->name('schedules.')->group(function () {
        Route::get('',                    [ScheduleGeneratorController::class, 'index'])->name('index');
        Route::get('/active',             [ScheduleGeneratorController::class, 'getActive'])->name('active');
        Route::post('/generate',          [ScheduleGeneratorController::class, 'generate'])->name('generate');
        Route::post('/activate/{id}',     [ScheduleGeneratorController::class, 'activate'])->name('activate');
        Route::post('/{id}/move-session', [ScheduleGeneratorController::class, 'moveSession'])->name('move-session');
        Route::delete('/{id}',            [ScheduleGeneratorController::class, 'destroy'])->name('destroy');
    });

    // Export — PDF
    Route::get('/export',     [ExportController::class, 'index'])->name('export.index');
    Route::get('/export/pdf', [ExportController::class, 'exportPdf'])->name('export.pdf');

    // Statistics dashboard
    Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics.index');

    // Global search — JSON endpoint for the search dropdown
    Route::get('/search', [SearchController::class, 'search'])->name('search');

    // Daily todo tasks
    Route::get('/todos', [TodoController::class, 'index'])->name('todos.index');
    Route::post('/todos', [TodoController::class, 'store'])->name('todos.store');
    Route::patch('/todos/{id}', [TodoController::class, 'update'])->name('todos.update');
    Route::delete('/todos/{id}', [TodoController::class, 'destroy'])->name('todos.destroy');
    Route::post('/todos/{id}/toggle', [TodoController::class, 'toggle'])->name('todos.toggle');
    Route::post('/todos/reorder', [TodoController::class, 'reorder'])->name('todos.reorder');
    Route::get('/todos/stats', [TodoController::class, 'stats'])->name('todos.stats');

    // Sleep/wake schedule (per-day times)
    Route::get('/sleep-schedule', [SleepScheduleController::class, 'index'])->name('sleep-schedule.index');
    Route::post('/sleep-schedule', [SleepScheduleController::class, 'store'])->name('sleep-schedule.store');

    // Profile management
    Route::get('/profile',              [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',            [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile',           [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/profile/photo',     [ProfileController::class, 'destroyPhoto'])->name('profile.photo.destroy');
});

require __DIR__.'/auth.php';
