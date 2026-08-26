<?php

namespace Tests\Feature;

use App\Models\FixedEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FixedEventCategoryTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function a_fixed_event_can_be_created_with_category(): void
    {
        $response = $this->actingAs($this->user)->post('/fixed-events', [
            'title'       => 'Math Course',
            'day_of_week' => 'Lundi',
            'start_time'  => '09:00',
            'end_time'    => '11:00',
            'category'    => 'course',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('fixed_events', [
            'user_id'  => $this->user->id,
            'title'    => 'Math Course',
            'category' => 'course',
        ]);
    }

    /** @test */
    public function a_fixed_event_can_be_created_without_category(): void
    {
        $response = $this->actingAs($this->user)->post('/fixed-events', [
            'title'       => 'Math Course',
            'day_of_week' => 'Lundi',
            'start_time'  => '09:00',
            'end_time'    => '11:00',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('fixed_events', [
            'user_id'  => $this->user->id,
            'category' => null,
        ]);
    }

    /** @test */
    public function category_max_length_is_50(): void
    {
        $response = $this->actingAs($this->user)->post('/fixed-events', [
            'title'       => 'Math Course',
            'day_of_week' => 'Lundi',
            'start_time'  => '09:00',
            'end_time'    => '11:00',
            'category'    => str_repeat('a', 51),
        ]);

        $response->assertSessionHasErrors('category');
    }

    /** @test */
    public function category_of_exactly_50_characters_is_accepted(): void
    {
        $response = $this->actingAs($this->user)->post('/fixed-events', [
            'title'       => 'Math Course',
            'day_of_week' => 'Lundi',
            'start_time'  => '09:00',
            'end_time'    => '11:00',
            'category'    => str_repeat('a', 50),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('fixed_events', [
            'user_id' => $this->user->id,
            'title'   => 'Math Course',
        ]);
    }

    /** @test */
    public function user_can_only_see_own_fixed_events_categories(): void
    {
        $otherUser = User::factory()->create();
        FixedEvent::factory()->create(['user_id' => $otherUser->id, 'category' => 'exam']);
        FixedEvent::factory()->create(['user_id' => $this->user->id, 'category' => 'course']);

        $response = $this->actingAs($this->user)->get('/fixed-events');
        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('FixedEvents/Index')
            ->has('fixedEvents', 1)
            ->where('fixedEvents.0.category', 'course')
        );
    }

    /** @test */
    public function category_is_stored_when_creating_recurring_daily_event(): void
    {
        $response = $this->actingAs($this->user)->post('/fixed-events', [
            'title'              => 'Morning Workout',
            'is_recurring_daily' => true,
            'start_time'         => '07:00',
            'end_time'           => '08:00',
            'category'           => 'personal',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('fixed_events', [
            'user_id'            => $this->user->id,
            'title'              => 'Morning Workout',
            'category'           => 'personal',
            'is_recurring_daily' => true,
        ]);
    }

    /** @test */
    public function category_can_be_any_string_up_to_50_chars(): void
    {
        $categories = ['course', 'exam', 'lab', 'workshop', 'personal', 'sports', 'meeting'];

        foreach ($categories as $category) {
            FixedEvent::factory()->create([
                'user_id'  => $this->user->id,
                'category' => $category,
            ]);

            $this->assertDatabaseHas('fixed_events', [
                'user_id'  => $this->user->id,
                'category' => $category,
            ]);
        }
    }
}
