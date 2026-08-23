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
GUEST → /login or /register (Breeze auth controllers, FR/EN/AR + RTL)
  ↓ (session-based)
AUTHENTICATED → /dashboard (middleware: auth, verified)
  → /fixed-events (add courses — day names normalized to French)
  → /preferences (set study preferences)
  → /schedules/generate (rate-limited 5/min, generates 3 schedules)
  → /schedules/activate/{id} (choose active schedule)
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
│   └── Modal.jsx, Dropdown.jsx, etc.      # Breeze components (mostly unused)
└── Pages/
    ├── AppLayout.jsx                      # Main layout: sidebar, language switcher, dark mode, FlashBanner
    │                                      # Exports LangContext/useLang, ThemeContext/useTheme, THEME tokens
    │                                      # ThemeContext provides {dark, colors} to all pages
    │                                      # CSS responsive rules for week grids, week mini, export grid
    ├── Dashboard.jsx                      # Dashboard with today/tomorrow/week views, translated day abbreviations
    ├── Welcome.jsx                        # Public landing page
    ├── Statistics.jsx                     # Charts and analytics (FR/EN/AR)
    ├── Auth/                              # Login, Register, ForgotPassword, ResetPassword, VerifyEmail,
    │                                      # ConfirmPassword — all FR/EN/AR + RTL + document.documentElement.dir
    ├── FixedEvents/Index.jsx              # Add/view/delete fixed courses (day names translated in UI)
    ├── Schedules/Index.jsx                # Generate, view, activate, move sessions, delete schedules
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
preferences (user_id, wake_up_time, sleep_time, study_preference, concentration_hours, desired_free_time, priorities?)
  ↓ 1:N
optimized_schedules (user_id, type [intensif/equilibre/leger], schedule [JSON], explanations?, generated_for [date], is_active [bool])
```

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
4. **Schedule Activation** — User activates one schedule as their active plan
5. **Session Moving** — Move study sessions with overlap validation against fixed events AND other study sessions
6. **Dashboard** — Today/tomorrow/week views, current/next session, week summary grid
7. **Statistics** — Bar charts, subject distribution, schedule comparison
8. **Export** — PDF (printable HTML with XSS escaping) + CSV (BOM, injection-protected), i18n labels (FR/EN/AR)
9. **Multilingual** — French, English, Arabic with RTL support (auth pages included)
10. **Dark Mode** — Full-page dark mode (sidebar, topbar, AND all page content) with ThemeContext + localStorage persistence. All sub-elements styled: badges, dots, progress bars, toggles, day colors, tab buttons, week grid cards, empty states, avatar fallback
11. **Auth** — Full Breeze auth: login, register, email verification, password reset
12. **Flash Messages** — Centralized in AppLayout via FlashBanner, auto-dismiss after 4s
13. **Rate Limiting** — Schedule generation limited to 5 requests/minute/user
14. **XSS Prevention** — All user content escaped with `htmlspecialchars()` in HTML exports
15. **CSV Injection Prevention** — Formula-triggering characters prefixed in CSV export
16. **Responsive Design** — overflowX:hidden on all pages, CSS grid breakpoints for week grid + statistics
17. **Accessibility** — `lang` attribute on `<html>` set dynamically, ARIA labels on all interactive elements (hamburger, dark mode toggle, nav links, language buttons, profile link, generate CTA, logout), `role="navigation"`, `aria-current="page"` on active nav, `aria-pressed` on language buttons, global `*:focus-visible` outlines (2px solid #6366F1)
18. **Preference Validation** — All 4 preference fields (wake_up_time, sleep_time, concentration_hours, desired_free_time) show per-field errors with red border + error message. Translatable attribute names via lang files (FR/EN/AR)
19. **Export i18n** — PDF and CSV exports accept `lang` query parameter; labels translated via `getExportLabels()` (FR/EN/AR)
20. **Preference i18n** — Success/error messages translated based on active language (FR/EN/AR)

---

## SECURITY_CONSIDERATIONS

### Strengths
- User ownership checks enforced on all controllers (`where('user_id', auth()->id())->findOrFail()`)
- CSRF protection via Laravel middleware
- Password hashing via Breeze (bcrypt)
- Session-based auth with hidden password/remember_token fields
- Server-side validation on all endpoints
- XSS prevention in ExportController (htmlspecialchars on all user content)
- CSV injection prevention in ExportController (sanitizeCsvCell)
- Rate limiting on schedule generation (5/min/user, controller-level with user-friendly wait messages)
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
| Other | 2 | 1 | ALL PASS |
| **TOTAL** | **109** | **433** | **ALL PASS** |

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

---

## KNOWN_ISSUES

### LOW — Acceptable for student project
- Auth pages read `localStorage` for language instead of using LangContext (works due to `key={lang}` remount pattern)
- `ziggy.js` hardcodes `localhost:8000` — should be regenerated for production deployment
- Welcome.jsx hardcoded French — landing page not translatable (low priority, not an auth page)

### INFO — Production deployment checklist
- Set `APP_DEBUG=false` in `.env`
- Set `APP_ENV=production` in `.env`
- Regenerate `APP_KEY` for production
- Update `APP_URL` in `.env` and rebuild Ziggy routes
- Set up proper mail driver (currently `log`)

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
| Rate Limiting | PASS | 5/min per user on schedule generation; Breeze throttles auth endpoints |
| Input Validation | PASS | All controllers validate with specific rules and types |
| Session Security | PASS | Account deletion invalidates session + regenerates CSRF token |
| CSV Injection | PASS | sanitizeCsvCell() prefixes formula-triggering chars (=, +, -, @, \t) |

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
