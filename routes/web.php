<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleGeneratorController;
use App\Http\Controllers\FixedEventController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\StatisticsController;
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

    // Export — PDF and CSV
    Route::get('/export',     [ExportController::class, 'index'])->name('export.index');
    Route::get('/export/pdf', [ExportController::class, 'exportPdf'])->name('export.pdf');
    Route::get('/export/csv', [ExportController::class, 'exportCsv'])->name('export.csv');

    // Statistics dashboard
    Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics.index');

    // Profile management
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
