<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Preference;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThemePreferenceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function user_can_set_theme(): void
    {
        $response = $this->actingAs($this->user)->patchJson('/preferences/theme', [
            'theme' => 'greenNatural',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('preferences', [
            'user_id' => $this->user->id,
            'theme'   => 'greenNatural',
        ]);
    }

    /** @test */
    public function user_can_set_default_theme(): void
    {
        $this->actingAs($this->user)->patchJson('/preferences/theme', [
            'theme' => 'roseRed',
        ]);

        $response = $this->actingAs($this->user)->patchJson('/preferences/theme', [
            'theme' => 'default',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('preferences', [
            'user_id' => $this->user->id,
            'theme'   => 'default',
        ]);
    }

    /** @test */
    public function all_6_themes_are_valid(): void
    {
        $themes = ['default', 'softBlush', 'coolBlue', 'lavenderTeal', 'greenNatural', 'roseRed'];

        foreach ($themes as $theme) {
            $response = $this->actingAs($this->user)->patchJson('/preferences/theme', [
                'theme' => $theme,
            ]);

            $response->assertOk();
            $this->assertDatabaseHas('preferences', [
                'user_id' => $this->user->id,
                'theme'   => $theme,
            ]);
        }
    }

    /** @test */
    public function invalid_theme_is_rejected(): void
    {
        $response = $this->actingAs($this->user)->patchJson('/preferences/theme', [
            'theme' => 'invalidTheme',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function theme_persists_across_requests(): void
    {
        $this->actingAs($this->user)->patchJson('/preferences/theme', [
            'theme' => 'greenNatural',
        ]);

        $response = $this->actingAs($this->user)->get('/preferences');
        $response->assertOk();

        $preferences = Preference::where('user_id', $this->user->id)->first();
        $this->assertEquals('greenNatural', $preferences->theme);
    }

    /** @test */
    public function theme_is_returned_in_json_response(): void
    {
        $response = $this->actingAs($this->user)->patchJson('/preferences/theme', [
            'theme' => 'coolBlue',
        ]);

        $response->assertOk()
            ->assertJson([
                'ok'    => true,
                'theme' => 'coolBlue',
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_set_theme(): void
    {
        $response = $this->patchJson('/preferences/theme', [
            'theme' => 'greenNatural',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function theme_is_created_if_no_preference_exists(): void
    {
        $this->assertDatabaseMissing('preferences', [
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->patchJson('/preferences/theme', [
            'theme' => 'lavenderTeal',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('preferences', [
            'user_id' => $this->user->id,
            'theme'   => 'lavenderTeal',
        ]);
    }

    /** @test */
    public function theme_is_updated_if_preference_already_exists(): void
    {
        Preference::create([
            'user_id'            => $this->user->id,
            'wake_up_time'       => '08:00',
            'sleep_time'         => '22:00',
            'study_preference'   => 'morning',
            'concentration_hours'=> 2,
            'desired_free_time'  => 2,
            'theme'              => 'default',
        ]);

        $response = $this->actingAs($this->user)->patchJson('/preferences/theme', [
            'theme' => 'roseRed',
        ]);

        $response->assertOk();

        $pref = Preference::where('user_id', $this->user->id)->first();
        $this->assertEquals('roseRed', $pref->theme);
        $this->assertEquals('08:00', $pref->wake_up_time);
    }

    /** @test */
    public function missing_theme_field_is_rejected(): void
    {
        $response = $this->actingAs($this->user)->patchJson('/preferences/theme', []);

        $response->assertStatus(422);
    }
}
