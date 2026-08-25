<?php

namespace Tests\Feature;

use App\Models\FixedEvent;
use App\Models\OptimizedSchedule;
use App\Models\TodoItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper: create a user and act as them.
     * Every test creates its own isolated user so there's no
     * risk of data leaking between tests.
     */
    protected function createUser(): User
    {
        $user = User::factory()->create([
            'name' => 'Test Student',
            'email' => uniqid('test_') . '@example.com',
        ]);
        $this->actingAs($user);
        return $user;
    }

    // ── Authentication ──

    public function test_unauthenticated_search_returns_401(): void
    {
        $response = $this->getJson('/search?q=math');
        $response->assertStatus(401);
    }

    public function test_search_requires_authentication(): void
    {
        $response = $this->getJson('/search?q=math');
        $response->assertStatus(401);
    }

    // ── Empty / basic queries ──

    public function test_empty_query_returns_empty_results(): void
    {
        $this->createUser();
        $response = $this->getJson('/search?q=');
        $response->assertOk()
            ->assertJson([
                'courses' => [],
                'sessions' => [],
                'nav' => [],
            ]);
    }

    public function test_whitespace_only_query_returns_empty(): void
    {
        $this->createUser();
        $response = $this->getJson('/search?q=%20%20%20');
        $response->assertOk()
            ->assertJson([
                'courses' => [],
                'sessions' => [],
                'nav' => [],
            ]);
    }

    public function test_no_param_returns_empty_results(): void
    {
        $this->createUser();
        $response = $this->getJson('/search');
        $response->assertOk()
            ->assertJson([
                'courses' => [],
                'sessions' => [],
                'nav' => [],
            ]);
    }

    // ── Course search ──

    public function test_search_finds_course_by_title(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Mathématiques',
            'teacher' => 'M. Dupont',
            'description' => 'Algèbre et géométrie',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        $response = $this->getJson('/search?q=Math');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['courses']);
        $this->assertEquals('Mathématiques', $data['courses'][0]['title']);
    }

    public function test_search_finds_course_by_teacher(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Physique',
            'teacher' => 'M. Einstein',
            'description' => 'Mécanique quantique',
            'day_of_week' => 'Mardi',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response = $this->getJson('/search?q=Einstein');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['courses']);
        $this->assertEquals('Physique', $data['courses'][0]['title']);
    }

    public function test_search_finds_course_by_description(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Info',
            'teacher' => 'M. Turing',
            'description' => 'Programmation Python avancée',
            'day_of_week' => 'Mercredi',
            'start_time' => '14:00',
            'end_time' => '16:00',
        ]);

        $response = $this->getJson('/search?q=Python');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['courses']);
    }

    public function test_search_is_case_insensitive(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Mathématiques',
            'teacher' => 'M. Dupont',
            'description' => '',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        $response = $this->getJson('/search?q=mathématiques');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['courses']);
    }

    public function test_search_returns_max_10_courses(): void
    {
        $user = $this->createUser();
        for ($i = 0; $i < 15; $i++) {
            FixedEvent::create([
                'user_id' => $user->id,
                'title' => "Test Course $i",
                'teacher' => "Teacher $i",
                'description' => 'Test description for course',
                'day_of_week' => 'Lundi',
                'start_time' => '08:00',
                'end_time' => '10:00',
            ]);
        }

        $response = $this->getJson('/search?q=Test');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(10, $data['courses']);
    }

    // ── User isolation (critical security) ──

    public function test_search_does_not_return_other_users_courses(): void
    {
        // User A's course
        $userA = User::factory()->create();
        FixedEvent::create([
            'user_id' => $userA->id,
            'title' => 'Secret Course A',
            'teacher' => 'Teacher A',
            'description' => 'Private data',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        // User B searches — should NOT see User A's course
        $userB = $this->createUser();
        $response = $this->getJson('/search?q=Secret');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(0, $data['courses']);
    }

    public function test_search_does_not_return_other_users_schedule_sessions(): void
    {
        // User A's schedule with a "Quantum Physics" session
        $userA = User::factory()->create();
        OptimizedSchedule::create([
            'user_id' => $userA->id,
            'type' => 'intensif',
            'schedule' => [
                'details' => [
                    'Lundi' => [
                        'sessions_etude' => [
                            ['matiere' => 'Quantum Physics', 'debut' => '09:00', 'fin' => '11:00', 'duree' => 120],
                        ],
                    ],
                ],
            ],
            'is_active' => true,
        ]);

        // User B searches — should NOT see User A's sessions
        $userB = $this->createUser();
        $response = $this->getJson('/search?q=Quantum');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(0, $data['sessions']);
    }

    // ── Schedule session search ──

    public function test_search_finds_schedule_sessions_by_subject(): void
    {
        $user = $this->createUser();
        OptimizedSchedule::create([
            'user_id' => $user->id,
            'type' => 'equilibre',
            'schedule' => [
                'details' => [
                    'Lundi' => [
                        'sessions_etude' => [
                            ['matiere' => 'Chimie Organique', 'debut' => '09:00', 'fin' => '10:00', 'duree' => 60],
                            ['matiere' => 'Biologie Cellulaire', 'debut' => '14:00', 'fin' => '15:00', 'duree' => 60],
                        ],
                    ],
                ],
            ],
            'is_active' => true,
        ]);

        $response = $this->getJson('/search?q=Chimie');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['sessions']);
        $this->assertEquals('Chimie Organique', $data['sessions'][0]['matiere']);
    }

    public function test_search_returns_max_8_sessions(): void
    {
        $user = $this->createUser();
        // Create a schedule with many matching sessions
        $sessions = [];
        for ($i = 0; $i < 12; $i++) {
            $sessions[] = ['matiere' => "Test Subject $i", 'debut' => '09:00', 'fin' => '10:00', 'duree' => 60];
        }
        OptimizedSchedule::create([
            'user_id' => $user->id,
            'type' => 'intensif',
            'schedule' => [
                'details' => [
                    'Lundi' => ['sessions_etude' => $sessions],
                ],
            ],
            'is_active' => true,
        ]);

        $response = $this->getJson('/search?q=Test');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(8, $data['sessions']);
    }

    // ── Navigation shortcuts ──

    public function test_search_returns_navigation_for_matching_keywords(): void
    {
        $this->createUser();
        $response = $this->getJson('/search?q=planning&lang=fr');
        $response->assertOk();
        $data = $response->json();
        $this->assertNotEmpty($data['nav']);
        $this->assertEquals('/schedules', $data['nav'][0]['href']);
    }

    public function test_search_nav_returns_max_3_results(): void
    {
        $this->createUser();
        // "t" matches many nav keywords (tableau, tâche, télécharger, etc.)
        $response = $this->getJson('/search?q=t&lang=fr');
        $response->assertOk();
        $data = $response->json();
        $this->assertLessThanOrEqual(3, count($data['nav']));
    }

    // ── Unicode / encoding ──

    public function test_search_handles_french_accents(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Mathématiques',
            'teacher' => 'M. Dupont',
            'description' => 'Cours de algèbre et géométrie',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        // Search with accented characters
        $response = $this->getJson('/search?q=é');
        $response->assertOk();
        $data = $response->json();
        $this->assertGreaterThanOrEqual(1, count($data['courses']));
    }

    public function test_search_handles_arabic_text(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'الرياضيات',
            'teacher' => 'الأستاذ أحمد',
            'description' => 'مقدمة في الجبر',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        $response = $this->getJson('/search?q=الرياضيات');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['courses']);
        $this->assertEquals('الرياضيات', $data['courses'][0]['title']);
    }

    public function test_search_handles_arabic_query_for_teacher(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'فيزياء',
            'teacher' => 'الأستاذ محمد',
            'description' => '',
            'day_of_week' => 'Mardi',
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        $response = $this->getJson('/search?q=محمد');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['courses']);
    }

    // ── No results ──

    public function test_search_returns_empty_when_no_match(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Mathématiques',
            'teacher' => 'M. Dupont',
            'description' => '',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        $response = $this->getJson('/search?q=ZZZZZNOTFOUND');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(0, $data['courses']);
        $this->assertCount(0, $data['sessions']);
    }

    // ── Query length limit ──

    public function test_very_long_query_is_truncated(): void
    {
        $this->createUser();
        $longQuery = str_repeat('a', 300);
        $response = $this->getJson("/search?q=$longQuery");
        $response->assertOk();
        // Should not crash — query is truncated to 200 chars internally
    }

    // ── Special characters ──

    public function test_special_characters_do_not_crash(): void
    {
        $this->createUser();
        $response = $this->getJson('/search?q=%25%5C%27%22');
        $response->assertOk();
    }

    public function test_sql_injection_attempt_does_not_crash(): void
    {
        $this->createUser();
        $response = $this->getJson('/search?q=' . urlencode("'; DROP TABLE users; --"));
        $response->assertOk();
    }

    // ── Partial matching ──

    public function test_partial_query_matches(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Mathématiques',
            'teacher' => 'M. Dupont',
            'description' => '',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        // Just 3 characters should match
        $response = $this->getJson('/search?q=Mat');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['courses']);
    }

    // ── Response structure ──

    public function test_response_has_expected_keys(): void
    {
        $this->createUser();
        $response = $this->getJson('/search?q=test');
        $response->assertOk()
            ->assertJsonStructure([
                'courses',
                'sessions',
                'nav',
            ]);
    }

    public function test_course_result_has_expected_fields(): void
    {
        $user = $this->createUser();
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Physique',
            'teacher' => 'M. Newton',
            'description' => 'Mécanique',
            'day_of_week' => 'Lundi',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'is_recurring_daily' => false,
        ]);

        $response = $this->getJson('/search?q=Physique');
        $response->assertOk();
        $data = $response->json();
        $this->assertArrayHasKey('id', $data['courses'][0]);
        $this->assertArrayHasKey('title', $data['courses'][0]);
        $this->assertArrayHasKey('teacher', $data['courses'][0]);
        $this->assertArrayHasKey('day_of_week', $data['courses'][0]);
        $this->assertArrayHasKey('start_time', $data['courses'][0]);
        $this->assertArrayHasKey('end_time', $data['courses'][0]);
    }

    // ── Mixed results ──

    public function test_search_returns_both_courses_and_sessions(): void
    {
        $user = $this->createUser();

        // Create a course
        FixedEvent::create([
            'user_id' => $user->id,
            'title' => 'Algorithmique',
            'teacher' => 'M. Knuth',
            'description' => '',
            'day_of_week' => 'Lundi',
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        // Create a schedule with a matching session
        OptimizedSchedule::create([
            'user_id' => $user->id,
            'type' => 'intensif',
            'schedule' => [
                'details' => [
                    'Mardi' => [
                        'sessions_etude' => [
                            ['matiere' => 'Algorithmique', 'debut' => '14:00', 'fin' => '16:00', 'duree' => 120],
                        ],
                    ],
                ],
            ],
            'is_active' => true,
        ]);

        $response = $this->getJson('/search?q=Algorithmique');
        $response->assertOk();
        $data = $response->json();
        $this->assertCount(1, $data['courses']);
        $this->assertCount(1, $data['sessions']);
    }

    // ── Nav language support ──

    public function test_nav_search_respects_english_language(): void
    {
        $this->createUser();
        $response = $this->getJson('/search?q=schedule&lang=en');
        $response->assertOk();
        $data = $response->json();
        $this->assertNotEmpty($data['nav']);
        $this->assertEquals('/schedules', $data['nav'][0]['href']);
        $this->assertEquals('My Schedule', $data['nav'][0]['label']);
    }

    public function test_nav_search_respects_arabic_language(): void
    {
        $this->createUser();
        $response = $this->getJson('/search?q=جدول&lang=ar');
        $response->assertOk();
        $data = $response->json();
        $this->assertNotEmpty($data['nav']);
        $this->assertEquals('/schedules', $data['nav'][0]['href']);
    }

    // ── Daily task (TodoItem) search ──

    public function test_search_finds_daily_task_by_title(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        TodoItem::create([
            'user_id' => $user->id,
            'title' => 'Réviser les maths',
            'priority' => 3,
        ]);

        $response = $this->getJson('/search?q=r%C3%A9viser');
        $response->assertOk();
        $response->assertJsonPath('todos.0.title', 'Réviser les maths');
    }

    public function test_search_finds_daily_task_by_description(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        TodoItem::create([
            'user_id' => $user->id,
            'title' => 'Task Alpha',
            'description' => 'Complete the algebra exercises chapter 5',
            'priority' => 4,
        ]);

        $response = $this->getJson('/search?q=algebra');
        $response->assertOk();
        $response->assertJsonPath('todos.0.title', 'Task Alpha');
    }

    public function test_search_does_not_return_other_users_daily_tasks(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($user);

        TodoItem::create([
            'user_id' => $other->id,
            'title' => 'Private task',
        ]);

        $response = $this->getJson('/search?q=private');
        $response->assertOk();
        $this->assertEmpty($response->json('todos'));
    }

    public function test_search_returns_max_5_daily_tasks(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        for ($i = 0; $i < 8; $i++) {
            TodoItem::create([
                'user_id' => $user->id,
                'title' => "Task Match $i",
                'priority' => 1,
            ]);
        }

        $response = $this->getJson('/search?q=match');
        $response->assertOk();
        $this->assertLessThanOrEqual(5, count($response->json('todos')));
    }

    // ── Issue #40: Search + daily tasks interaction ──

    public function test_search_finds_daily_task_then_todos_page_shows_it(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        TodoItem::create([
            'user_id' => $user->id,
            'title' => 'Révision examen',
            'description' => 'Chapitre 5 pages 120-135',
            'priority' => 4,
            'is_scheduled' => true,
            'scheduled_day' => 'Lundi',
            'scheduled_time' => '14:00',
        ]);

        // Search finds the task
        $searchResponse = $this->getJson('/search?q=r%C3%A9vision');
        $searchResponse->assertOk();
        $todos = $searchResponse->json('todos');
        $this->assertCount(1, $todos);
        $this->assertEquals('Révision examen', $todos[0]['title']);

        // Navigating to /todos page also shows the task
        $todosResponse = $this->get('/todos');
        $todosResponse->assertOk();
        $todosResponse->assertInertia(fn ($page) => $page
            ->component('Todos/Index')
            ->has('todos', 1)
            ->where('todos.0.title', 'Révision examen')
        );
    }

    public function test_search_does_not_return_deleted_todos(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $todo = TodoItem::create([
            'user_id' => $user->id,
            'title' => 'Deleted task',
            'priority' => 2,
        ]);

        // Verify it's findable before deletion
        $this->getJson('/search?q=Deleted')->assertOk()
            ->assertJsonPath('todos.0.title', 'Deleted task');

        // Hard delete (TodoItem does not use soft deletes)
        $todo->delete();

        // Should no longer appear in search results
        $response = $this->getJson('/search?q=Deleted');
        $response->assertOk();
        $this->assertEmpty($response->json('todos'));
    }

    public function test_search_works_with_empty_todo_list(): void
    {
        $this->createUser();

        $response = $this->getJson('/search?q=anything');
        $response->assertOk();
        $data = $response->json();

        $this->assertArrayHasKey('todos', $data);
        $this->assertEmpty($data['todos']);
    }
}
