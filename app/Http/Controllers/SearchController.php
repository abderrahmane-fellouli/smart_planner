<?php

namespace App\Http\Controllers;

use App\Models\FixedEvent;
use App\Models\OptimizedSchedule;
use App\Models\TodoItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class SearchController extends Controller
{
    /**
     * Global search across fixed events and schedule sessions.
     *
     * The query is always scoped to the authenticated user so that one
     * student can never see another student's private courses or schedules.
     * Even though the frontend only sends results for the current user,
     * we enforce ownership here because the client cannot be trusted.
     *
     * Rate limiting: 30 requests per minute per user.
     * This is generous enough for normal typing with debouncing,
     * but prevents abuse from automated scripts.
     */
    public function search(Request $request): JsonResponse
    {
        // Rate limit: 30 searches per minute per user
        $key = 'search:' . $request->user()->id;
        if (RateLimiter::tooManyAttempts($key, 30)) {
            return response()->json([
                'error' => 'rate_limited',
                'message' => 'Too many search requests. Please wait a moment.',
            ], 429);
        }
        RateLimiter::hit($key, 60);

        // Validate the query — trim whitespace and enforce a max length.
        // We accept empty strings (the frontend clears results on empty input)
        // but cap length to prevent oversized LIKE patterns.
        $query = trim($request->input('q', ''));
        if (mb_strlen($query) > 200) {
            $query = mb_substr($query, 0, 200);
        }

        $userId = $request->user()->id;

        // If the query is empty, return empty results immediately.
        // This avoids hitting the database for a blank search.
        if ($query === '') {
            return response()->json([
                'courses' => [],
                'sessions' => [],
                'todos' => [],
                'nav' => [],
            ]);
        }

        // We use LIKE with wildcards on both sides for partial matching.
        // MySQL LIKE is case-insensitive for utf8mb4_general_ci collation,
        // which is the default for our tables. This means "math" matches
        // "Mathématiques" and "MATH" without extra work.
        $like = '%' . $query . '%';

        // ── 1. Search fixed events (courses) ──
        // We search title (subject), teacher, and description fields.
        // Only return courses belonging to the authenticated user.
        // Limit to 10 results to keep the dropdown compact.
        $courses = FixedEvent::where('user_id', $userId)
            ->where(function ($q) use ($like) {
                $q->where('title', 'LIKE', $like)
                  ->orWhere('teacher', 'LIKE', $like)
                  ->orWhere('description', 'LIKE', $like);
            })
            ->limit(10)
            ->get(['id', 'title', 'teacher', 'description', 'day_of_week', 'start_time', 'end_time', 'is_recurring_daily'])
            ->map(function ($event) {
                // Determine which field matched for display purposes.
                // We return the original fields so the frontend can render
                // a useful result card without extra requests.
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'teacher' => $event->teacher,
                    'description' => $event->description,
                    'day_of_week' => $event->day_of_week,
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'is_recurring_daily' => $event->is_recurring_daily,
                ];
            });

        // ── 2. Search schedule sessions ──
        // Schedule data is stored as JSON in optimized_schedules.schedule.
        // The structure is: { "details": { "Lundi": { "sessions_etude": [...], "cours_fixes": [...] } } }
        // MySQL JSON support lets us extract and search within JSON columns,
        // but for simplicity and performance on small datasets, we pull
        // the user's schedules and search in PHP. This is fine because:
        //   a) A student typically has 1-3 schedules
        //   b) Each schedule has at most 42 session slots (7 days × 6)
        //   c) We limit results to 8 schedule matches
        $schedules = OptimizedSchedule::where('user_id', $userId)
            ->get(['id', 'type', 'schedule', 'is_active']);

        $sessionResults = [];
        foreach ($schedules as $schedule) {
            $details = $schedule->schedule['details'] ?? [];
            foreach ($details as $day => $dayData) {
                // Search study sessions (sessions_etude)
                $studySessions = $dayData['sessions_etude'] ?? [];
                foreach ($studySessions as $idx => $session) {
                    $matiere = $session['matiere'] ?? '';
                    // Match the subject name against the query
                    if (mb_stripos($matiere, $query) !== false) {
                        $sessionResults[] = [
                            'schedule_id' => $schedule->id,
                            'schedule_type' => $schedule->type,
                            'is_active' => $schedule->is_active,
                            'day' => $day,
                            'matiere' => $matiere,
                            'debut' => $session['debut'] ?? '',
                            'fin' => $session['fin'] ?? '',
                            'duree' => $session['duree'] ?? 0,
                            'session_index' => $idx,
                        ];
                    }
                }
                // Also search fixed courses that appear in the schedule
                $fixedCourses = $dayData['cours_fixes'] ?? [];
                foreach ($fixedCourses as $course) {
                    $titre = $course['titre'] ?? '';
                    if (mb_stripos($titre, $query) !== false) {
                        $sessionResults[] = [
                            'schedule_id' => $schedule->id,
                            'schedule_type' => $schedule->type,
                            'is_active' => $schedule->is_active,
                            'day' => $day,
                            'matiere' => $titre,
                            'debut' => $course['debut'] ?? '',
                            'fin' => $course['fin'] ?? '',
                            'duree' => $course['duree'] ?? 0,
                            'session_index' => -1, // fixed course marker
                        ];
                    }
                }
            }
            // Stop collecting once we have enough results
            if (count($sessionResults) >= 8) {
                break;
            }
        }

        // ── 3. Search daily tasks ──
        $todoResults = TodoItem::where('user_id', $userId)
            ->where(function ($q) use ($like) {
                $q->where('title', 'LIKE', $like)
                  ->orWhere('description', 'LIKE', $like);
            })
            ->limit(5)
            ->get(['id', 'title', 'description', 'priority', 'is_scheduled'])
            ->map(function ($todo) {
                return [
                    'id' => $todo->id,
                    'title' => $todo->title,
                    'description' => $todo->description,
                    'priority' => $todo->priority,
                    'is_scheduled' => $todo->is_scheduled,
                ];
            });

        // ── 4. Navigation shortcuts ──
        // Allow users to type page names to navigate directly.
        // This is especially useful on mobile where the sidebar is hidden.
        $navTranslations = [
            'fr' => [
                'dashboard' => ['keywords' => ['tableau', 'bord', 'accueil', 'home'], 'label' => 'Tableau de bord', 'href' => '/dashboard'],
                'schedules' => ['keywords' => ['planning', 'plannings', 'générer', 'generer', 'emploi'], 'label' => 'Mon planning', 'href' => '/schedules'],
                'fixed' => ['keywords' => ['cours', 'fixe', 'fixes', 'tâche', 'tache', 'matière', 'matiere'], 'label' => 'Cours fixes', 'href' => '/fixed-events'],
                'todos' => ['keywords' => ['tâches', 'tache', 'taches', 'daily', 'tasks', 'todo'], 'label' => 'Tâches quotidiennes', 'href' => '/todos'],
                'preferences' => ['keywords' => ['préférence', 'preference', 'habitude', 'réveil', 'coucher'], 'label' => 'Préférences', 'href' => '/preferences'],
                'statistics' => ['keywords' => ['stat', 'stats', 'analyse', 'donnée'], 'label' => 'Statistiques', 'href' => '/statistics'],
                'export' => ['keywords' => ['export', 'pdf', 'télécharger', 'telecharger', 'imprimer'], 'label' => 'Exporter', 'href' => '/export'],
                'profile' => ['keywords' => ['profil', 'compte', 'nom', 'email', 'photo', 'mot de passe'], 'label' => 'Profil', 'href' => '/profile'],
            ],
            'en' => [
                'dashboard' => ['keywords' => ['dashboard', 'home', 'main'], 'label' => 'Dashboard', 'href' => '/dashboard'],
                'schedules' => ['keywords' => ['schedule', 'schedules', 'generate', 'timetable'], 'label' => 'My Schedule', 'href' => '/schedules'],
                'fixed' => ['keywords' => ['course', 'courses', 'fixed', 'task', 'subject'], 'label' => 'Fixed Courses', 'href' => '/fixed-events'],
                'todos' => ['keywords' => ['tasks', 'daily', 'todo', 'todos'], 'label' => 'Daily Tasks', 'href' => '/todos'],
                'preferences' => ['keywords' => ['preference', 'preferences', 'habits', 'wake', 'sleep'], 'label' => 'Preferences', 'href' => '/preferences'],
                'statistics' => ['keywords' => ['stat', 'stats', 'statistics', 'analytics'], 'label' => 'Statistics', 'href' => '/statistics'],
                'export' => ['keywords' => ['export', 'pdf', 'download', 'print'], 'label' => 'Export', 'href' => '/export'],
                'profile' => ['keywords' => ['profile', 'account', 'name', 'email', 'photo', 'password'], 'label' => 'Profile', 'href' => '/profile'],
            ],
            'ar' => [
                'dashboard' => ['keywords' => ['لوحة', 'تحكم', 'رئيسية'], 'label' => 'لوحة التحكم', 'href' => '/dashboard'],
                'schedules' => ['keywords' => ['جدول', 'planning', 'توليد', 'أجند'], 'label' => 'جدولي', 'href' => '/schedules'],
                'fixed' => ['keywords' => ['درس', 'دروس', 'ثابت', 'مادة'], 'label' => 'الدروس الثابتة', 'href' => '/fixed-events'],
                'todos' => ['keywords' => ['مهام', 'مهام يومية', 'قائمة'], 'label' => 'المهام اليومية', 'href' => '/todos'],
                'preferences' => ['keywords' => ['تفضيل', 'عاد', 'صباح', 'مساء'], 'label' => 'التفضيلات', 'href' => '/preferences'],
                'statistics' => ['keywords' => ['إحصائي', 'تحليل'], 'label' => 'الإحصائيات', 'href' => '/statistics'],
                'export' => ['keywords' => ['تصدير', 'pdf', 'تحميل', 'طباعة'], 'label' => 'تصدير', 'href' => '/export'],
                'profile' => ['keywords' => ['ملف', 'حساب', 'اسم', 'بريد', 'كلمة'], 'label' => 'الملف الشخصي', 'href' => '/profile'],
            ],
        ];

        $lang = $request->input('lang', 'fr');
        $navSet = $navTranslations[$lang] ?? $navTranslations['fr'];

        $navResults = [];
        $queryLower = mb_strtolower($query);
        foreach ($navSet as $item) {
            foreach ($item['keywords'] as $kw) {
                if (mb_stripos($kw, $queryLower) !== false || mb_stripos($queryLower, $kw) !== false) {
                    $navResults[] = [
                        'label' => $item['label'],
                        'href' => $item['href'],
                    ];
                    break; // one match is enough per nav item
                }
            }
            if (count($navResults) >= 3) {
                break;
            }
        }

        return response()->json([
            'courses' => $courses->values(),
            'sessions' => array_slice($sessionResults, 0, 8),
            'todos' => $todoResults,
            'nav' => array_slice($navResults, 0, 3),
        ]);
    }
}
