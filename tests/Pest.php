<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/*
| Shared scheduler test helpers (used across scheduler/feature tests).
| Defined here so they are loadable regardless of which test file runs.
*/
use App\Models\OptimizedSchedule as OptimizedScheduleAlias;
use App\Models\Preference as PreferenceAlias;
use App\Models\TodoItem as TodoItemAlias;
use App\Models\User as UserAlias;

if (!function_exists('createUserWithPreferences')) {
    function createUserWithPreferences(array $overrides = []): UserAlias
    {
        $user = UserAlias::factory()->create();

        PreferenceAlias::create(array_merge([
            'user_id'            => $user->id,
            'wake_up_time'       => '07:00',
            'sleep_time'         => '22:00',
            'study_preference'   => 'morning',
            'concentration_hours' => 2,
            'desired_free_time'  => 2,
        ], $overrides));

        return $user;
    }
}

if (!function_exists('createFixedEvents')) {
    function createFixedEvents(UserAlias $user, array $events): void
    {
        foreach ($events as $event) {
            \App\Models\FixedEvent::create(array_merge([
                'user_id'            => $user->id,
                'teacher'            => null,
                'description'        => null,
                'is_recurring_daily' => false,
                'location'           => null,
            ], $event));
        }
    }
}

if (!function_exists('createScheduledTodo')) {
    function createScheduledTodo(UserAlias $user, array $overrides = []): TodoItemAlias
    {
        return TodoItemAlias::create(array_merge([
            'user_id'            => $user->id,
            'title'              => 'Test task',
            'completed'          => false,
            'priority'           => 3,
            'is_scheduled'       => true,
            'scheduled_day'      => 'Lundi',
            'scheduled_time'     => '14:00',
            'scheduled_duration' => 60,
        ], $overrides));
    }
}

if (!function_exists('timeToMinutes')) {
    function timeToMinutes(string $time): int
    {
        [$h, $m] = explode(':', $time);
        return (int) $h * 60 + (int) $m;
    }
}

if (!function_exists('intervalsOverlap')) {
    function intervalsOverlap(string $aStart, string $aEnd, string $bStart, string $bEnd): bool
    {
        return timeToMinutes($aStart) < timeToMinutes($bEnd)
            && timeToMinutes($bStart) < timeToMinutes($aEnd);
    }
}

if (!function_exists('generateSchedules')) {
    function generateSchedules($testCase, UserAlias $user): \Illuminate\Support\Collection
    {
        Mail::fake();
        $testCase->actingAs($user)->post('/schedules/generate')->assertRedirect();
        return OptimizedScheduleAlias::where('user_id', $user->id)->get()->keyBy('type');
    }
}

if (!function_exists('countStudyMinutes')) {
    function countStudyMinutes(array $dayData): int
    {
        $minutes = 0;
        foreach (($dayData['sessions_etude'] ?? []) as $session) {
            $minutes += $session['duree'] ?? 0;
        }
        return $minutes;
    }
}
