<?php

namespace Database\Factories;

use App\Models\FixedEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FixedEvent>
 */
class FixedEventFactory extends Factory
{
    protected $model = FixedEvent::class;

    public function definition(): array
    {
        return [
            'user_id'            => User::factory(),
            'title'              => fake()->words(2, true),
            'teacher'            => fake()->name(),
            'description'        => fake()->sentence(),
            'category'           => null,
            'is_recurring_daily' => false,
            'day_of_week'        => fake()->randomElement(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']),
            'start_time'         => fake()->time('H:i', '12:00'),
            'end_time'           => fake()->time('H:i', '18:00'),
        ];
    }
}
