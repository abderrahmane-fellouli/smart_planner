<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);

        /*
         * Share user preferences (including theme) across all Inertia pages.
         * This ensures the theme is available on every page, not just /preferences.
         * Without this, theme persistence from localStorage would be the only
         * source on non-preference pages, breaking backend persistence.
         */
        Inertia::share('preferences', function () {
            if (!Auth::check()) return null;
            $pref = \App\Models\Preference::where('user_id', Auth::id())->first();
            return $pref ? ['theme' => $pref->theme] : null;
        });
    }
}
