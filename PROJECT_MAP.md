# SmartPlanner — Technical Project Map

## TECH_STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Laravel | 12.x |
| PHP | PHP | 8.5 |
| Frontend | React (JSX, not TSX) | 18.x |
| SPA Bridge | Inertia.js | 2.x |
| Build Tool | Vite | 6.x |
| CSS (configured) | Tailwind CSS | 3.x |
| CSS (imported) | Bootstrap 5 | 5.3.x |
| Database (dev) | MySQL 8.0 (via pdo_mysql) | — |
| Routing (JS) | Ziggy | 2.x |
| Auth Starter | Laravel Breeze (Unstyled React JSX kit) | — |
| Testing | Pest | 3.x |
| Node.js | — | 22.x |

**Note:** Tailwind is configured but unused — all UI is built with React inline styles.
Bootstrap CSS is imported in `app.jsx` but barely utilized.

---

## SYSTEM_FLOW

```
USER
  ↓ (browser)
FRONTEND (React JSX + Inline Styles)
  ↓ (Inertia.js request)
LARAVEL (Routes → Controllers)
  ↓
VALIDATION (server-side, via $request->validate())
  ↓
BUSINESS LOGIC (ScheduleGeneratorController)
  ↓ (queries)
DATABASE (MySQL — optimized_schedules, fixed_events, preferences, users)
  ↓
RESPONSE (Inertia render with page props)
  ↓
FRONTEND (React component receives props and renders)
```

### Auth Flow
```
GUEST → /login or /register (Breeze auth controllers, FR/EN/AR + RTL; registration IP-throttled 10/min)
  ↓ (session-based)
AUTHENTICATED → protected application routes require `auth + verified`
  ─ unverified user is redirected to /verify-email (verification notice)
  ─ verified user reaches /dashboard
  → /fixed-events (add courses — day names normalized to French)
  → /preferences (set study preferences)
  → /schedules/generate (rate-limited 5/min, generates 3 schedules)
  → /schedules/activate/{id} (choose active schedule)
  → /calendar (visualize the active program: Day / Week / Month)
  → /export (PDF with XSS escaping, CSV with injection protection)
  → /statistics (user-specific data)
```

---

## ARCHITECTURE

### Backend Structure
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/                          # Breeze auth (login, register, password reset, etc.)
│   │   ├── ScheduleGeneratorController    # Core: generates/modifies/activates schedules
│   │   │                                  # Preference-aware: uses concentration_hours, study_preference
│   │   │                                  # Daily recurring events, session breaks, overlap checks
│   │   │                                  # DB transaction, deterministic subject rotation
│   │   │                                  # moveSession validates wake/sleep time bounds
│   │   │                                  # All flash messages use trans('messages.*') for i18n
│   │   │                                  # Rate-limited (5/min/user), validates moveSession
│   │   ├── FixedEventController           # CRUD for fixed courses (day_of_week validated after normalization)
│   │   │                                  # Supports is_recurring_daily flag (day_of_week optional/nullable)
│   │   │                                  # normalizeDayToFrench() maps EN/AR/FR → French canonical
│   │   │                                  # Per-field validation errors, form resets after add
│   │   │                                  # All flash messages use trans('messages.*') for i18n
│   │   ├── PreferenceController           # User study preferences (validated, upserted, i18n messages via lang param)
│   │   ├── ExportController               # PDF (HTML with e() escaping) + CSV (BOM + injection-safe)
│   │   │                                  # sanitizeCsvCell() collapses \r\n/\r/\n to spaces BEFORE formula check
│   │   │                                  # i18n labels (FR/EN/AR) via getExportLabels()
│   │   │                                  # Accepts lang query parameter for translated exports
│   │   │                                  # All error messages use trans('messages.*') for i18n
│   │   ├── StatisticsController           # Stats page data (user-scoped)
│   │   └── ProfileController              # User profile management
│   ├── Middleware/
│   │   └── HandleInertiaRequests          # Shares auth.user + flash messages (lazy-evaluated)
│   └── Requests/
│       ├── Auth/                          # Breeze form requests
│       └── ProfileUpdateRequest
├── Models/
│   ├── User                               # Standard Breeze user ($hidden: password, remember_token)
│   ├── FixedEvent                         # Recurring course (user_id, title, day_of_week, start_time, end_time, is_recurring_daily)
│   ├── Preference                         # Study preferences (wake_up_time, sleep_time, study_preference, etc.)
│   └── OptimizedSchedule                  # Generated schedule (JSON blob + metadata)
├── Providers/                             # Standard Laravel service providers
└── lang/
    ├── {en,fr,ar}/auth.php                # Localized auth error messages
    ├── {en,fr,ar}/passwords.php           # Flat-structure password reset translations
    ├── {en,fr,ar}/preferences.php         # Translatable validation attribute names
    └── {en,fr,ar}/messages.php            # Flash messages for all controllers (schedule, course, session errors)
```

### Frontend Structure
```
resources/js/
├── app.jsx                                # Inertia app bootstrap, imports Bootstrap + ToastProvider
├── bootstrap.js                           # Axios setup
├── ziggy.js                               # Ziggy route definitions
├── Components/
│   ├── Toast.jsx                          # Toast notification system (context-based, globally wired)
│   ├── GuidedTour.jsx                     # Interactive first-time onboarding guide (spotlight/tooltip,
│   │                                      # FR/EN/AR+RTL, theme/dark aware, auto-advance on real user
│   │                                      # action, resume chip, server-side persisted state)
│   └── Modal.jsx, Dropdown.jsx, etc.      # Breeze components (mostly unused)
└── Pages/
    ├── AppLayout.jsx                      # Main layout: sidebar, language switcher, dark mode, FlashBanner
    │                                      # Exports LangContext/useLang, ThemeContext/useTheme, THEME tokens
    │                                      # ThemeContext provides {dark, colors} to all pages
    │                                      # CSS responsive rules for week grids, week mini, export grid
    ├── Dashboard.jsx                      # Dashboard with today/tomorrow/week views, translated day abbreviations
    ├── Welcome.jsx                        # Public landing page (SEO: og:/twitter:/JSON-LD + meta description)
    ├── Legal/
    │   ├── Privacy.jsx                    # Privacy Policy page (FR/EN/AR + RTL, public /privacy)
    │   └── Terms.jsx                      # Terms of Service page (FR/EN/AR + RTL, public /terms)
    ├── Statistics.jsx                     # Charts and analytics (FR/EN/AR)
    ├── Auth/                              # Login, Register, ForgotPassword, ResetPassword, VerifyEmail,
    │                                      # ConfirmPassword — all FR/EN/AR + RTL + document.documentElement.dir
    ├── FixedEvents/Index.jsx              # Add/view/delete fixed courses (day names translated in UI)
    ├── Schedules/Index.jsx                # Generate, view, activate, move sessions, delete schedules
    ├── Calendar/Index.jsx                 # Program page: Day/Week/Month views of the canonical active schedule
    ├── Preferences/Index.jsx              # Set wake/sleep times, study preference, durations (per-field validation errors, passes lang on submit)
    ├── Export/Index.jsx                   # Select schedule → export as PDF or CSV
    └── Profile/                           # Breeze profile management
```

### Database Schema
```
users (standard Breeze)
  ↓ 1:N
fixed_events (user_id, title, day_of_week [nullable French string], start_time, end_time, location?, is_recurring_daily [bool])
  ↓ 1:1
preferences (user_id, wake_up_time, sleep_time, study_preference, concentration_hours, desired_free_time, priorities?, tutorial [JSON, nullable])
  ↓ 1:N
optimized_schedules (user_id, type [intensif/equilibre/leger], schedule [JSON], explanations?, generated_for [date], is_active [bool])
```

> `optimized_schedules.schedule` JSON shape (v2, set by `ScheduleGeneratorController`): keys `details[FRENCH_DAY]` → `{cours_fixes, sessions_etude, total_heures_etude, capacity {awake, occupied, free, load, overloaded}, overloaded, explanation}` and `resume` → `{total_heures_semaine, moyenne_par_jour, sessions_totales, overloaded, overloaded_days}`. Session shape: `{debut, fin, duree, matiere, flexible?}`. `explanations` column carries the human scheduling rationale. This canonical record is the single source of truth for Dashboard, Calendar, Statistics and Export.
```

> `preferences.tutorial` (added `2026_08_28_000001`): nullable JSON storing `{version, started, completed, skipped, step}` for the Guided Tour. `version` is always set from the server-side `TutorialController::TUTORIAL_VERSION` (1) so the guide can be re-versioned later. State is per-account (server-side), survives navigation, and RESTART resets it.

### Day Name System (Critical)
The backend stores `day_of_week` as French strings: `Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi`.
Schedule generation exclusively uses these French keys.
The `normalizeDayToFrench()` function in FixedEventController maps EN/AR/FR day names to French canonical form before storage.
Users can add courses in any language — the backend always stores French internally.

---

## IMPORTANT_FEATURES

1. **Course Management** — Add/view/delete fixed courses with day, time, title + "Every day" recurring option
2. **Preference Configuration** — Wake/sleep times, study rhythm preference, concentration hours, desired free time
3. **Schedule Generation** — Algorithm creates 3 variants (intensive/balanced/light) with preference-aware scheduling:
   - Uses concentration_hours to cap session duration
   - Respects study_preference (morning/normal/night) for slot sorting
   - Inserts breaks (5-10 min) between consecutive sessions
   - Checks study-vs-study overlap in moveSession
   - Deterministic subject rotation (no random shuffle)
   - Daily recurring fixed events placed on every day
   - DB transaction wraps entire generation for data safety
   - Real available-time model: capacity = awake − (fixed + committed daily tasks), NOT wake−sleep
   - Overload/impossible detection with localized human explanation when load > 85% of awake time
   - Sleep & fixed events are HARD boundaries; committed scheduled todos are always placed
   - Pending unscheduled todos are placed flexibly in free time using a difficulty-based duration (priority 1–5 → 20–75 min)
   - desired_free_time (SOFT) reduces auto-study volume via an effective per-day session cap
   - Long free blocks are fragmented into sessions of at most the configured type duration
   - Explanations are honest and never claim "optimal"
4. **Schedule Activation** — User activates one schedule as their active plan
5. **Session Moving** — Move study sessions with overlap validation against fixed events AND other study sessions
6. **Dashboard** — Today/tomorrow/week views, current/next session, week summary grid
7. **Calendar / Program** — `GET /calendar` renders the canonical active schedule (active first, else most recent) as Day / Week / Month views; never generates its own data
8. **Statistics** — Bar charts, subject distribution, schedule comparison
9. **Export** — PDF (printable HTML with XSS escaping) + CSV (BOM, injection-protected), i18n labels (FR/EN/AR); consumes the same canonical OptimizedSchedule records. `GET /export/csv` route exposed and surfaced as a button on the Export page (select schedule → PDF or CSV). Both default to the *active* schedule or honor `schedule_id` (verified by ExportCanonicalTest)
10. **Multilingual** — French, English, Arabic with RTL support (auth pages included)
11. **Dark Mode** — Full-page dark mode (sidebar, topbar, AND all page content) with ThemeContext + localStorage persistence. All sub-elements styled: badges, dots, progress bars, toggles, day colors, tab buttons, week grid cards, empty states, avatar fallback
12. **Auth** — Full Breeze auth: login, register, email verification, password reset
12. **Flash Messages** — Centralized in AppLayout via FlashBanner, auto-dismiss after 4s
13. **Rate Limiting** — Schedule generation limited to 5 requests/minute/user
14. **XSS Prevention** — All user content escaped with `htmlspecialchars()` in HTML exports
15. **CSV Injection Prevention** — Formula-triggering characters prefixed in CSV export
16. **Responsive Design** — overflowX:hidden on all pages, CSS grid breakpoints for week grid + statistics
17. **Accessibility** — `lang` attribute on `<html>` set dynamically, ARIA labels on all interactive elements (hamburger, dark mode toggle, nav links, language buttons, profile link, generate CTA, logout), `role="navigation"`, `aria-current="page"` on active nav, `aria-pressed` on language buttons, global `*:focus-visible` outlines (2px solid #6366F1)
18. **Preference Validation** — All 4 preference fields (wake_up_time, sleep_time, concentration_hours, desired_free_time) show per-field errors with red border + error message. Translatable attribute names via lang files (FR/EN/AR)
19. **Export i18n** — PDF and CSV exports accept `lang` query parameter; labels translated via `getExportLabels()` (FR/EN/AR)
20. **Preference i18n** — Success/error messages translated based on active language (FR/EN/AR)
21. **Email System** — Branded, localized (FR/EN/AR + RTL) transactional email/notification system via Gmail SMTP (see **EMAIL_SYSTEM** section below)
22. **Interactive Guided Tour (onboarding, NOT a chatbot/AI)** — First-time users are walked through the real workflow by *doing it*:
    - Launches automatically after a new verified user's first dashboard visit (never interrupts registration/verification; never shows repeatedly)
    - `GuidedTour.jsx` renders a spotlight overlay + tooltip/bottom-sheet (mobile), reusing the app's design tokens, live theme/dark-mode aware, fully RTL (Arabic); honours OS `prefers-reduced-motion` (drops the spotlight transition)
    - 14-step real workflow (welcome → overview → shortcuts → add course → add todos → sleep → preferences → generate → activate → statistics → export → profile → done)
    - **No fake data**: steps are context-aware — steps are skipped when the user already has that data (`tourData` shared props: `has_courses`, `has_todos`, `has_schedule`, `has_active_schedule`)
    - Interactive steps auto-advance upon a real user action (`advanceOn` selectors detect the added row/card)
    - Never blocks the app: temporary close ≠ permanent skip; Skip shows a confirmation ("you can restart it anytime from Preferences → Help"); while incomplete a resume chip appears; hidden for completed/skipped users
    - `data-tutorial-target` hooks on Dashboard/FixedEvents/Todos/Sleep/Preferences/Schedules/Statistics/Export/Profile (facts-the-user-can-touch; RESTART via Preferences → Help → "Start SmartPlanner Guide")
    - Versioned server-side persistence: `preferences.tutorial` JSON via `POST /tutorial/state` (store) and `POST /tutorial/reset` (restart), `TUTORIAL_VERSION = 1`
23. **Legal Pages (public)** — `/privacy` + `/terms` render `Legal/Privacy.jsx` + `Legal/Terms.jsx` in FR/EN/AR (RTL for Arabic) via `useLang()`. Content is structural with clear `[TODO(legal-review)]` placeholders pending real legal review (no fabricated legal claims). Footer links added on Welcome.
24. **Registration Rate Limiting** — `POST /register` is IP-throttled `throttle:10,1` (10 attempts/min). The throttle exception returns a **localized** notice (429 status + redirect to `/register` with `throttled` flash) instead of a bare 429 screen; the `throttled` flash is shared via `HandleInertiaRequests` and rendered as a localized banner in `Register.jsx` (no CAPTCHA). Route named `register.store`.
25. **CSV Line-Break Injection Fix** — `sanitizeCsvCell()` collapses embedded `\r\n`/`\r`/`\n` to spaces BEFORE the formula-trigger check, so user-controlled subjects cannot break out into unintended extra CSV rows (formula chars still quote-prefixed).
26. **SEO / Meta / Sitemap** — env-driven `GET /sitemap.xml` (only public URLs: home, login, register, forgot-password, privacy, terms; uses `url('/')`, never hardcoded). `app.blade.php` head: meta description, canonical (`url()->current()`), og:/twitter:/theme-color (#4F46E5). `lang/{fr,en,ar}/meta.php` descriptions. Welcome.jsx adds og:/twitter:/JSON-LD (WebSite schema).
27. **Page Titles + Rebrand** — `APP_NAME=SmartPlanner` (`.env` + `.env.example`). `<Head title>` added to auth-free application pages (Todos, SleepSchedule, Legal, Welcome) so the browser title stays `<localized> - SmartPlanner` with no "Laravel".

---

## SECURITY_CONSIDERATIONS

### Strengths
- User ownership checks enforced on all controllers (`where('user_id', auth()->id())->findOrFail()`)
- CSRF protection via Laravel middleware
- Password hashing via Breeze (bcrypt)
- Session-based auth with hidden password/remember_token fields
- Server-side validation on all endpoints
- XSS prevention in ExportController (htmlspecialchars on all user content)
- CSV injection prevention in ExportController (sanitizeCsvCell) — also collapses embedded CR/LF so values can't break out into extra rows
- Rate limiting on schedule generation (5/min/user, controller-level with user-friendly wait messages)
- Registration IP-throttled (throttle:10,1) with a localized 429 → friendly throttled notice (no email spam / mass-account abuse)
- Security test suite: 77 tests covering authorization, validation, XSS, cross-user isolation
- Flash messages properly shared via Inertia middleware (lazy-evaluated)
- No dangerouslySetInnerHTML, eval(), raw SQL, dd(), console.log, or debug statements
- .env excluded from git, .env.example contains no real secrets
- Schedule generation wrapped in DB transaction (data safety on failure)
- Security test suite: 77 tests covering authorization, validation, XSS, cross-user isolation
- moveSession validates wake/sleep time bounds (prevents moving sessions to 3 AM)
- FixedEventController validates day_of_week against known canonical names after normalization
- day_of_week column made nullable for recurring daily events (migration)

---

## TEST_RESULTS

| Suite | Tests | Assertions | Status |
|-------|-------|------------|--------|
| SecurityTest | 33 | 109 | ALL PASS |
| E2ETest | 51 | 296 | ALL PASS |
| Breeze Auth Tests | 18 | 25 | ALL PASS |
| ProfileTest | 5 | 2 | ALL PASS |
| TutorialStateTest | 13 | 83 | ALL PASS |
| SchedulePlannerTest | 9 | 26 | ALL PASS |
| ScheduleIntelligenceTest | 9 | 137 | ALL PASS |
| SchedulerInvariantTest | 21 | 670 | ALL PASS |
| CalendarPageTest | 6 | 71 | ALL PASS |
| ExportCanonicalTest | 2 | 9 | ALL PASS |
| EmailVerificationEnforcementTest | 10 | 61 | ALL PASS |
| LegalPagesTest | 6 | 42 | ALL PASS |
| RegistrationThrottleTest | 4 | 9 | ALL PASS |
| CsvInjectionTest | 4 | 21 | ALL PASS |
| SeoMetaTest | 2 | 5 | ALL PASS |
| Other | 2 | 1 | ALL PASS |
| **TOTAL** | **248** | **1756** | **ALL PASS** |

### E2E Flows Verified
- Register → Login → Dashboard → Add Course → Set Preferences → Generate Schedule → View Schedule → Activate Schedule → Export PDF → Export CSV → Statistics → Profile → Logout
- Flash messages appear after adding course, generating schedules, and errors (i18n via trans('messages.*'))
- Schedule generation finds courses added in any language (EN/AR/FR normalization)
- CSV export has BOM prefix for Excel compatibility
- PDF export escapes all user content (XSS prevention verified)
- Authorization: User A cannot access/modify User B's schedules, courses, or preferences
- moveSession rejects moves outside wake/sleep window (regression test added)
- Flash message translation keys resolve correctly (regression test added)
- Daily recurring events (is_recurring_daily=true) save and appear on all weekdays
- Daily recurring events included in subject suggestions for study sessions
- moveSession moves sessions successfully and rejects overlaps with fixed/study sessions
- Activate schedule sets is_active=true and deactivates all others
- Delete schedule removes from database
- Export PDF: French, English, Arabic label verification
- Export CSV: BOM prefix, user data, formula injection sanitization
- Auth: wrong password, nonexistent email, mismatched passwords, empty name, short password
- Profile: name update, password change with correct/wrong current password
- Schedule generation works without preferences (uses defaults)

### Algorithm Edge Cases Verified
- Heavy load: 8h/day of fixed courses leaves minimal study time — sessions stay within free slots
- Back-to-back fixed events fill entire day — no study sessions scheduled (correct behavior)
- Night owl preference: sessions after 17:00 prioritized, no sessions during morning class
- Morning preference: sessions before 12:00 on free days
- Wake/sleep boundary enforcement: no sessions outside 06:30-21:00 custom window
- Intensif >= equilibre >= leger average session durations confirmed
- Total weekly hours equals sum of daily hours (math consistency)
- No study sessions overlap with each other (pairwise check across all days)
- Study sessions never overlap with fixed events (pairwise check)

### Scheduler Invariant Scenarios (A–Q) — `tests/Feature/SchedulerInvariantTest.php`
- **A** Sleep is a HARD boundary, including per-day sleep schedules (late wake on weekends respected)
- **B** Study sessions never overlap a fixed event on the same day
- **C** Every session stays within [wake, sleep]
- **D** Committed daily tasks always appear (never silently dropped)
- **E** Flexible todos stay inside free time, never stealing from sleep/fixed
- **F** Consecutive sessions are separated by at least the configured min break
- **G** Explanations present, human, and never claim "optimal"
- **H** Generation is deterministic for identical input
- **I** Reserved free time (desired_free_time) reduces study volume
- **J** Difficulty (priority) measurably shapes flexible placement duration
- **K** Flexible tasks fit within a single free fragment; oversized tasks are not force-fit
- **L** Available time = awake − hard commitments (not wake−sleep)
- **M** Overloaded days flagged in resume + per-day metadata when load > ~85%
- **N** Long free blocks fragmented into sessions ≤ configured type duration
- **O** All three schedule types generated
- **P** Recurring-daily events block every weekday (HARD)
- **Q** Resume totals match the sum of daily data
- **RL1–RL3** Realistic full-week scenarios: no double-booking, committed tasks placed, weekly volume plausible

### Calendar / Program page — `tests/Feature/CalendarPageTest.php`
- Requires auth; renders `Calendar/Index`
- Uses the ACTIVE schedule as the canonical source of truth (not the most recent)
- Falls back to most recent schedule when none is active
- Empty state when the user has no schedule
- Exposes `todayName` and `hasCourses` to the page

---

## KNOWN_ISSUES

### LOW — Acceptable for student project
- Auth pages read `localStorage` for language instead of using LangContext (works due to `key={lang}` remount pattern)
- `ziggy.js` hardcodes `localhost:8000` — should be regenerated for production deployment
- Welcome.jsx reads the stored language directly (it renders outside AppLayout) — fully localized FR/EN/AR with RTL (verified in browser E2E)

### INFO — Production deployment checklist (P2 "production posture")
- `.env.production` guidance (document only — do NOT ship secrets): `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://<your-domain>`
- **Session hardening**: `SESSION_SECURE_COOKIE=true` (HTTPS-only), `SESSION_HTTP_ONLY=true`, `SESSION_SAME_SITE=lax`, `SESSION_DOMAIN` for the prod host
- **HTTPS + HSTS**: terminate TLS at the reverse proxy; send `Strict-Transport-Security`
- **Cache/config**: `php artisan config:cache`, `route:cache`, `view:cache`; set `CACHE_STORE`, `SESSION_DRIVER` (e.g. `database`/`redis`) appropriately
- **Regenerate `APP_KEY`** for production; keep the Gmail App Password out of VCS (only in git-ignored `.env`)
- **Rebuild frontend + Ziggy**: `npm run build` and regenerate `resources/js/ziggy.js` for the prod `APP_URL` (currently hardcodes `localhost:8000`, LOCAL-only); `public/build/` must be deployed
- **Mail**: verify Gmail SMTP (`MAIL_MAILER=smtp`) + real App Password in the prod env
- Local env intentionally left in dev posture — only documented, not modified

---

## SECURITY_AUDIT (2026-08-22)

| Category | Status | Notes |
|----------|--------|-------|
| IDOR Prevention | PASS | All controllers scope queries by auth()->id() with findOrFail() |
| XSS Prevention | PASS | ExportController uses e() on all user content; no dangerouslySetInnerHTML in JSX |
| SQL Injection | PASS | All queries use Eloquent ORM with parameter binding |
| CSRF Protection | PASS | All routes under auth middleware; public route is GET-only landing page |
| Mass Assignment | PASS | $fillable arrays limited to necessary fields only |
| Auth Middleware | PASS | All sensitive routes wrapped in Route::middleware('auth') |
| Rate Limiting | PASS | 5/min per user on schedule generation; Breeze throttles auth endpoints; registration IP-throttled 10/min (public) |
| Input Validation | PASS | All controllers validate with specific rules and types |
| Session Security | PASS | Account deletion invalidates session + regenerates CSRF token |
| CSV Injection | PASS | sanitizeCsvCell() prefixes formula-triggering chars (=, +, -, @, \t) and collapses embedded CR/LF to spaces |

### Error Handling Audit
- All controllers return appropriate HTTP status codes (302 redirect, 422 validation)
- Route model binding with findOrFail() auto-returns 404 for missing resources
- ExportController handles missing schedule gracefully (redirect with error)
- ScheduleGeneratorController handles empty events and insufficient free time
- All validation errors handled by Laravel's exception handler (422 JSON response)

### Responsive Design Notes
- All page containers use overflowX: 'hidden' to prevent horizontal scroll
- CSS grid with responsive breakpoints on Dashboard and Statistics
- Mobile-first inline styles throughout
- No fixed pixel widths that would cause overflow on small screens
- Tables use horizontal scroll containers where needed

---

## VERIFICATION_LOG

**Date:** 2026-08-22
**Verified by:** Automated Pest tests + build verification + code audit

- [x] Laravel server running on http://127.0.0.1:8000
- [x] Database: MySQL 8.0 (smart_planner)
- [x] Fresh migration succeeds (all 9 tables including is_recurring_daily + nullable day_of_week)
- [x] All 109 tests passing (433 assertions)
- [x] Frontend build succeeds (1016 modules, ~15s)
- [x] Export PDF generates valid HTML with escaped content (i18n FR/EN/AR)
- [x] Export CSV generates valid CSV with BOM and injection protection (i18n FR/EN/AR)
- [x] Day name normalization: EN/AR → French works correctly
- [x] Schedule algorithm uses concentration_hours, study_preference, breaks, overlap checks
- [x] Daily recurring events (is_recurring_daily) placed on every day in schedule
- [x] DB transaction wraps schedule generation
- [x] Dark mode applied to all pages (Dashboard, FixedEvents, Preferences, Schedules, Statistics, Export, Profile)
- [x] Dark mode sub-elements: all badges, dots, progress bars, toggles, day colors, tab buttons, week cards, avatar circles, export buttons styled for dark
- [x] Responsive: overflowX:hidden on all page containers, CSS grid breakpoints
- [x] Accessibility: lang attribute, ARIA labels, focus-visible outlines, role="navigation", aria-current="page", aria-pressed
- [x] FixedEvents: validation errors per-field, form resets after submission
- [x] Preferences: validation errors for all 4 fields (wake_up_time, sleep_time, concentration_hours, desired_free_time) with red borders
- [x] PreferenceController: translatable attribute names + i18n success/error messages
- [x] Export: lang parameter passed from frontend for translated PDF/CSV labels
- [x] Cross-user isolation verified (schedules, events, preferences)
- [x] No hardcoded secrets, no debug statements, no XSS vectors
- [x] .env excluded from git, .env.example is clean
- [x] All controllers use trans('messages.*') for flash messages (i18n FR/EN/AR)
- [x] Profile partials: i18n + dark mode for UpdateProfileInformationForm, UpdatePasswordForm, DeleteUserForm
- [x] Auth pages: show/hide password aria-labels translated (FR/EN/AR) on Login, Register, ResetPassword, ConfirmPassword
- [x] FixedEvents: everyday toggle uses role="checkbox" + aria-checked + keyboard accessible
- [x] Dashboard: week mini cards use role="button" + tabIndex + keyboard accessible
- [x] moveSession: validates wake/sleep time bounds (regression test added)
- [x] FixedEventController: validates day_of_week against known canonical names after normalization
- [x] Toast: RTL-aware positioning (bottom-left for Arabic, bottom-right for LTR)
- [x] Dual rate limiting removed — controller-level only with user-friendly wait messages
- [x] Dead code removed (Export sep variable)
- [x] No personal names found in codebase (Mohamed, Mohammed, Ouarib — verified)
- [x] suggestSubject() updated to include daily recurring events in subject suggestions
- [x] moveSession: verified session moves + overlap rejection with fixed events and other study sessions
- [x] Activate/deactivate: verified mutual exclusion (only one schedule active at a time)
- [x] Export: FR/EN/AR label verification all pass
- [x] Auth flows: wrong password, nonexistent email, mismatched passwords, empty name, short password all rejected
- [x] Profile: name update works, password change requires correct current password via PUT /password
- [x] Schedule generation without preferences works (uses 08:00/22:00 defaults)
- [x] Algorithm edge cases: heavy load, back-to-back, night/morning preference, wake/sleep bounds, session ordering, math consistency, no overlaps
- [x] Security audit: IDOR, XSS, SQL injection, CSRF, mass assignment, rate limiting, session security all PASS
- [x] Accessibility: Schedules move button aria-label, Export schedule selector keyboard accessible (tabIndex+role+onKeyDown), Dashboard tabs aria-selected
- [x] Deep JSX audit: all 18 JSX files reviewed for i18n, accessibility, responsive, error handling
- [x] **Guide (2026-08-28):** `preferences.tutorial` JSON column + `TutorialController` (`TUTORIAL_VERSION=1`, `state/store/reset`) + `POST /tutorial/state` + `POST /tutorial/reset` routes (auth-guarded); shared `tutorial` + `tourData` Inertia props
- [x] **Guide (browser E2E, 32/32):** fresh-user auto-start; next/back + step counter; interactive "Try it" note; **auto-advance on real user action** (added a course → advanced to /todos); skip modal (cancel keeps, confirm persists); no re-trigger after skip; resume chip after partial progress; completion via Finish; Preferences restart button; Arabic RTL (`dir=rtl`); mobile bottom-sheet; step list correctly shrinks when data already exists (no fake data, no duplicated setup)

### P1/P2 Pre-Production Remediation (2026-08-30)
- [x] **Legal pages:** `GET /privacy` + `GET /terms` (public, named) → `Legal/Privacy.jsx` + `Legal/Terms.jsx`, FR/EN/AR + RTL, `[TODO(legal-review)]` placeholders; Welcome footer links both
- [x] **Registration throttle:** `POST /register` → `throttle:10,1` + named `register.store`; exception render returns 429 + redirect to `/register` with `throttled` flash (fixed REAL bug: `routeIs('register')` never matched the previously-unnamed POST route → bare 429); `HandleInertiaRequests` now shares `flash.throttled`; `Register.jsx` shows localized banner (no CAPTCHA)
- [x] **CSV line-break fix:** `sanitizeCsvCell()` collapses CRLF/CR/LF to spaces before formula-prefix — verified no extra rows via regression tests
- [x] **SEO/meta/sitemap:** env-driven `/sitemap.xml` (public URLs only), `app.blade.php` canonical/description/og:/twitter:/theme-color, localized `meta.description`, Welcome JSON-LD
- [x] **Titles + rebrand:** `APP_NAME=SmartPlanner`; `<Head title>` on Todos/SleepSchedule/Legal so browser titles are `<localized> - SmartPlanner` (no "Laravel")
- [x] **Tests:** `LegalPagesTest` (6), `RegistrationThrottleTest` (4 incl. flash assertion), `CsvInjectionTest` (4), `SeoMetaTest` (2) — ALL PASS; full suite **248 passed / 1756 assertions**
- [x] **Browser verification:** legal pages FR + footer links; legal EN/AR + `dir=rtl` (AR); landing og/JSON-LD; page titles FR/EN/AR everywhere `- SmartPlanner` (6/6, incl. fixing a harness first-nav `/todos`→`/dashboard` race — not an app bug); registration throttle visibly renders localized notice "Trop de tentatives…" after reload; 11/11 prior P1/P2 legal/SEO harness checks PASS
- [x] **Production posture:** documented in KNOWN_ISSUES (`.env.production`: `APP_DEBUG=false`, `APP_URL`, `SESSION_SECURE_COOKIE/HTTP_ONLY/SAME_SITE=lax`, HTTPS+HSTS, cached config/routes/views, regenerate `APP_KEY`, rebuild Ziggy + `npm run build`); local env left in dev posture

---

## EMAIL_SYSTEM

Branded, localized transactional email/notification system for SmartPlanner, delivered through Gmail SMTP with **no queue worker** (all sends are synchronous and wrapped in try/catch so a delivery failure never crashes a business operation).

### 1. Pipeline & Components
- **Transport**: Gmail SMTP (`smtp.gmail.com:587`, STARTTLS). Set in `.env` (`MAIL_MAILER=smtp`, `MAIL_PASSWORD=<App Password>`). `.env.example` documents this with an **empty** password placeholder — a real App Password is never committed.
- **Base mailable**: `app/Mail/SmartPlannerMail.php` — shared From/Reply-To, subject, and RTL-aware branded HTML layout rendered by `resources/views/emails/layout.blade.php`.
- **7 mailables** (`app/Mail/`): `VerifyEmail`, `ResetPassword`, `Welcome`, `PasswordChanged`, `EmailChanged`, `ScheduleReady`, `ScheduleActivated`.
- **2 notifications** (`app/Notifications/Auth/`): `VerifyEmail`, `ResetPassword` — each `toMail()` returns the corresponding mailable and **explicitly sets the recipient** (`->to($notifiable->email)`) so the notification mail channel never sends an address-less message.
- **1 listener** (`app/Listeners/SendWelcomeEmail.php`): fires on the `Verified` event, sends the Welcome mail synchronously.
- **i18n**: `lang/{fr,en,ar}/email.php` — subjects, greetings, CTAs, footers; Arabic renders `dir="rtl"`. Recipient's stored `locale` chooses the language.

### 2. Email Triggers
| Event | Delivery | Mailable/Notification |
|-------|----------|------------------------|
| Register | verify email (synchronous, try/catch) | `VerifyEmail` notification |
| Verify email | Welcome | `WelcomeMail` |
| Forgot password | reset link | `ResetPassword` notification |
| Password changed (account) | notification | `PasswordChangedMail` |
| Profile email changed | notification | `EmailChangedMail` |
| Schedule generated | notification | `ScheduleReadyMail` |
| Schedule activated | notification | `ScheduleActivatedMail` |

### 3. Key Implementation Details
- **No queue worker**: all mail is sent synchronously. Sends are wrapped in try/catch + `Log::error`, and registration explicitly flashes `verification_sent` / `verification_send_error` so the UI stays friendly even if SMTP is down.
- **`Registered` event double-send eliminated**: registration no longer fires `event(new Registered(...))` (which auto-triggered Laravel's default `SendEmailVerificationNotification` **and** the controller's own send). The controller now sends the verification **once**, through its own try/catch path.
- **No "no recipient" emails**: the framework's `MailChannel` sends a `Mailable` via `$message->send($this->mailer)` without a recipient; both `VerifyEmail` and `ResetPassword` notifications explicitly attach `->to($notifiable->email)`.
- **Registration locale fix**: `RegisteredUserController` previously read `lang` without a default in the result branch (`null` locale → NOT NULL violation); the ternary now defaults to `'fr'`.
- **Graceful invalid/expired links**: `bootstrap/app.php` `withExceptions()` renders a friendly `verification_error` payload instead of a 500 when a verification link is tampered with or its signature has expired.
- **`/verify-email` for verified users**: `EmailVerificationPromptController` redirects deterministically to the dashboard (plain `redirect()`, not `redirect()->intended()` which could loop back when a stale `intended` URL points at `/verify-email`).
- **Email verification is ENFORCED (server-side)**: all protected application routes (`/dashboard` plus the `Route::middleware(['auth','verified'])` group: fixed-events, preferences, locale, tutorial, schedules, calendar, export, statistics, search, todos, sleep-schedule, profile) redirect an authenticated-but-unverified user to `/verify-email`. The verification routes themselves (`/verify-email`, `/verify-email/{id}/{hash}`, `/email/verification-notification`) remain `auth`-only so unverified users can reach the notice, resend, and click the link to become verified. No redirect loop: verified users pass straight through; `/verify-email` bounces verified users to the dashboard. Covered by `tests/Feature/EmailVerificationEnforcementTest.php` (10 tests, 61 assertions) and browser-verified (11/11).

### 4. Verification Status (2026-08-28)
| Check | Result |
|-------|--------|
| Template rendering (7 mailables × 3 locales = 21 renders, subject + `dir` + escaping) | PASS (see `EmailSystemTest`) |
| Unit/integration tests (`tests/Feature/EmailSystemTest.php`, 17 Pest tests) | PASS |
| Full test suite (162 passed, 629 assertions) | PASS |
| Real SMTP **connection + AUTH** (raw socket: banner, STARTTLS, AUTH LOGIN 235 Accepted) | VERIFIED |
| Real SMTP **submission** (Laravel mailer to an RFC-2606 reserved test address, no exception) | VERIFIED |
| Real **mailbox delivery** (no readable inbox provided) | NOT VERIFIED |
| Browser E2E: register → verify page (shows email + resend), verified-user login → dashboard, per-page 200s, AR RTL, EN/FR/AR login content, mobile viewport | PASS (24/24) |
| Scheduler no-overlap live E2E (real UI generate → server-side check: no overlap with fixed events, no between-session overlap, within awake window) | PASS |
| Frontend build (Vite) | PASS |

> **Security note**: the Gmail App Password lives only in the git-ignored `.env`. It never appears in source, tests, docs, or this map.

---

## GUIDED_TOUR

Interactive first-time onboarding that teaches the real workflow **by doing** — it is **NOT** a chatbot/AI assistant; there is no LLM or conversational backend.

**Persistence (server-side, follows the account):**
- `preferences.tutorial` JSON column `{version, started, completed, skipped, step}` (migration `2026_08_28_000001`)
- `TutorialController` (`app/Http/Controllers/TutorialController.php`): `TUTORIAL_VERSION = 1`, static `state()`, `store(Request)` (validates booleans + `step` 0–999, always stamps `version` from server), `reset(Request)`
- Routes (auth-guarded): `POST /tutorial/state` → `tutorial.state`, `POST /tutorial/reset` → `tutorial.reset`
- `HandleInertiaRequests` shares `tutorial` (per-user state) + `tourData` (`has_courses`, `has_todos`, `has_schedule`, `has_active_schedule` — real existence checks, **no fake data**)

**Front-end:** `resources/js/Components/GuidedTour.jsx` (mounted once in `Pages/AppLayout.jsx`, so it survives navigation). `ALL_STEPS` is the canonical 14-step workflow; steps are **skipped** (never faked) when `tourData` already shows that data. `data-tutorial-target` hooks live on Dashboard, FixedEvents, Todos, SleepSchedule, Preferences, Schedules, Statistics, Export, Profile. Runtime state (`open`/`pos`) lives in module scope so it survives AppLayout remounts during SPA navigation.

**Behavior:** auto-starts for a brand-new verified user after the first dashboard visit (after 700ms, never interrupting registration/verify); interactive steps show a "Try it" note and auto-advance on the user's real action (`advanceOn` selectors); Skip requires confirmation ("you can restart it later from Preferences → Help"); while incomplete a dismissible-per-session **resume chip** appears; completed/skipped users never see it again; RESTART = Preferences → Help → "Start SmartPlanner Guide".

**Design rules honored:** reuses the app's design tokens + live theme/dark mode, fully RTL (Arabic), responsive bottom-sheet on mobile, accessible (`role="dialog"`, focus management), never blocks the app, no fake data, no forced duplicates.
