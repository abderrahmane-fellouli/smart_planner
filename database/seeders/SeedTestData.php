<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\FixedEvent;
use App\Models\Preference;
use Illuminate\Database\Seeder;

class SeedTestData extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        foreach ($days as $day) {
            FixedEvent::create([
                'user_id' => $user->id,
                'title' => "Cours {$day}",
                'day_of_week' => $day,
                'start_time' => '08:00:00',
                'end_time' => '10:00:00',
            ]);
        }

        Preference::create([
            'user_id' => $user->id,
            'wake_up_time' => '07:00',
            'sleep_time' => '22:00',
            'study_preference' => 'morning',
            'concentration_hours' => 4,
            'desired_free_time' => 2,
        ]);

        // Create second user for authorization tests
        User::create([
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => bcrypt('password'),
        ]);
    }
}
