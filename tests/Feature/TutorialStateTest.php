<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Preference;
use App\Http\Controllers\TutorialController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TutorialStateTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function fresh_user_has_tutorial_state_with_defaults(): void
    {
        $state = TutorialController::state();

        expect($state['started'])->toBeFalse()
            ->and($state['completed'])->toBeFalse()
            ->and($state['skipped'])->toBeFalse()
            ->and($state['step'])->toBe(0)
            ->and($state['version'])->toBe(TutorialController::TUTORIAL_VERSION);
    }

    /** @test */
    public function user_can_mark_tutorial_as_started(): void
    {
        $response = $this->actingAs($this->user)->postJson('/tutorial/state', [
            'started' => true,
        ]);

        $response->assertOk()
            ->assertJson([
                'started'   => true,
                'completed' => false,
                'skipped'   => false,
                'version'   => TutorialController::TUTORIAL_VERSION,
            ]);

        $pref = Preference::where('user_id', $this->user->id)->first();
        expect($pref)->not->toBeNull()
            ->and($pref->tutorial['started'])->toBeTrue();
    }

    /** @test */
    public function user_can_update_current_step(): void
    {
        $this->actingAs($this->user)->postJson('/tutorial/state', ['step' => 4]);

        $response = $this->actingAs($this->user)->postJson('/tutorial/state', ['step' => 7]);

        $response->assertOk()->assertJson(['step' => 7]);
        $pref = Preference::where('user_id', $this->user->id)->first();
        expect($pref->tutorial['step'])->toBe(7);
    }

    /** @test */
    public function marking_started_does_not_wipe_existing_flags(): void
    {
        $this->actingAs($this->user)->postJson('/tutorial/state', ['started' => true, 'step' => 3]);
        // Subsequent partial update must not reset started/step.
        $response = $this->actingAs($this->user)->postJson('/tutorial/state', ['step' => 9]);

        $response->assertOk()->assertJson([
            'step'    => 9,
            'started' => true,
        ]);
        $pref = Preference::where('user_id', $this->user->id)->first();
        expect($pref->tutorial['started'])->toBeTrue()
            ->and($pref->tutorial['step'])->toBe(9);
    }

    /** @test */
    public function user_can_complete_tutorial(): void
    {
        $this->actingAs($this->user)->postJson('/tutorial/state', ['started' => true]);

        $response = $this->actingAs($this->user)->postJson('/tutorial/state', ['completed' => true]);

        $response->assertOk()->assertJson(['completed' => true]);
        $pref = Preference::where('user_id', $this->user->id)->first();
        expect($pref->tutorial['completed'])->toBeTrue();
    }

    /** @test */
    public function user_can_skip_tutorial(): void
    {
        $response = $this->actingAs($this->user)->postJson('/tutorial/state', ['skipped' => true]);

        $response->assertOk()->assertJson(['skipped' => true]);
        $pref = Preference::where('user_id', $this->user->id)->first();
        expect($pref->tutorial['skipped'])->toBeTrue();
    }

    /** @test */
    public function reset_clears_tutorial_state_for_restart(): void
    {
        $this->actingAs($this->user)->postJson('/tutorial/state', [
            'started' => true, 'step' => 5,
        ]);

        $response = $this->actingAs($this->user)->postJson('/tutorial/reset');

        $response->assertOk()->assertJson([
            'started'   => false,
            'completed' => false,
            'skipped'   => false,
            'step'      => 0,
            'version'   => TutorialController::TUTORIAL_VERSION,
        ]);
        $pref = Preference::where('user_id', $this->user->id)->first();
        expect($pref->tutorial['started'])->toBeFalse()
            ->and($pref->tutorial['step'])->toBe(0);
    }

    /** @test */
    public function invalid_step_is_rejected(): void
    {
        $response = $this->actingAs($this->user)->postJson('/tutorial/state', [
            'step' => -5,
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function unauthenticated_user_cannot_update_tutorial_state(): void
    {
        $response = $this->postJson('/tutorial/state', ['started' => true]);

        $response->assertStatus(401);
    }

    /** @test */
    public function unauthenticated_user_cannot_reset_tutorial(): void
    {
        $response = $this->postJson('/tutorial/reset');

        $response->assertStatus(401);
    }

    /** @test */
    public function state_is_shared_for_authenticated_user(): void
    {
        $this->actingAs($this->user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->has('tutorial')
                ->where('tutorial.started', false)
            );
    }

    /** @test */
    public function tour_data_flags_are_shared_for_authenticated_user(): void
    {
        $this->actingAs($this->user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->has('tourData', fn ($td) => $td
                    ->where('has_courses', false)
                    ->where('has_todos', false)
                    ->where('has_schedule', false)
                    ->where('has_active_schedule', false)
                )
            );
    }

    /** @test */
    public function tour_data_reflects_existing_user_data(): void
    {
        \App\Models\FixedEvent::create([
            'user_id'       => $this->user->id,
            'title'         => 'Maths',
            'day_of_week'   => 'Lundi',
            'start_time'    => '09:00',
            'end_time'      => '11:00',
        ]);
        \App\Models\TodoItem::create([
            'user_id'    => $this->user->id,
            'title'      => 'Réviser',
            'priority'   => 3,
            'completed'  => false,
            'is_scheduled' => false,
        ]);

        $this->actingAs($this->user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('tourData', fn ($td) => $td
                    ->where('has_courses', true)
                    ->where('has_todos', true)
                    ->where('has_schedule', false)
                    ->where('has_active_schedule', false)
                )
            );
    }
}
