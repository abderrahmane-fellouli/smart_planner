import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useTheme } from '@/Pages/AppLayout';
import { useLang } from '@/Pages/AppLayout';

/**
 * GlobalSearch — A debounced search dropdown that queries /search
 * and shows results grouped by type: courses, schedule sessions,
 * and navigation shortcuts.
 *
 * WHY debouncing? When a user types "math", we don't want to fire
 * 4 HTTP requests for "m", "ma", "mat", "math". Instead we wait
 * 300ms after the last keystroke before sending the request.
 *
 * WHY request cancellation? If the user types "mat" then quickly
 * "math", the response for "mat" could arrive AFTER "math" and
 * overwrite the correct results. We use an AbortController to
 * cancel the previous in-flight request.
 *
 * WHY local state for results (not Inertia)? This is a JSON API
 * endpoint, not a page navigation. We fetch results via fetch()
 * and render them in a dropdown. Inertia is only used for
 * actual page transitions (clicking a result).
 */
export default function GlobalSearch({ isMobile = false, onClose }) {
    const { tk } = useTheme();
    const { lang } = useLang();

    // The search query text
    const [query, setQuery] = useState('');

    // Results from the API: { courses: [], sessions: [], nav: [] }
    const [results, setResults] = useState(null);

    // true while a fetch request is in flight
    const [loading, setLoading] = useState(false);

    // Non-null if the fetch failed
    const [error, setError] = useState(null);

    // Which result item is highlighted by keyboard (arrow keys)
    const [activeIndex, setActiveIndex] = useState(-1);

    // Whether the dropdown is open (even when results are empty)
    const [isOpen, setIsOpen] = useState(false);

    // Refs for focus management and debounce
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    const debounceRef = useRef(null);

    // Translations for the search UI
    const T = {
        fr: {
            placeholder: 'Rechercher un cours, matière, page…',
            courses: 'Cours',
            sessions: 'Sessions',
            todos: 'Tâches du jour',
            navigation: 'Pages',
            noResults: 'Aucun résultat trouvé',
            error: 'Erreur de recherche. Réessayez.',
            rateLimited: 'Trop de recherches. Attendez un instant.',
            loading: 'Recherche…',
            clear: 'Effacer',
            ariaLabel: 'Recherche globale',
        },
        en: {
            placeholder: 'Search courses, subjects, pages…',
            courses: 'Courses',
            sessions: 'Sessions',
            todos: 'Daily Tasks',
            navigation: 'Pages',
            noResults: 'No results found',
            error: 'Search error. Please try again.',
            rateLimited: 'Too many searches. Please wait a moment.',
            loading: 'Searching…',
            clear: 'Clear',
            ariaLabel: 'Global search',
        },
        ar: {
            placeholder: 'ابحث عن مادة، درس، صفحة…',
            courses: 'الدروس',
            sessions: 'الجلسات',
            todos: 'مهام اليوم',
            navigation: 'الصفحات',
            noResults: 'لم يتم العثور على نتائج',
            error: 'خطأ في البحث. حاول مرة أخرى.',
            rateLimited: 'عدد كبير من عمليات البحث. انتظر قليلاً.',
            loading: 'جاري البحث…',
            clear: 'مسح',
            ariaLabel: 'بحث عام',
        },
    };
    const tr = T[lang] || T.fr;
    const isRTL = lang === 'ar';

    /**
     * Flatten all result items into a single list for keyboard navigation.
     * Each item gets a `type` label and the data needed for rendering + navigation.
     */
    const flatResults = useCallback(() => {
        if (!results) return [];
        const items = [];
        (results.nav || []).forEach((n) => items.push({ ...n, _type: 'nav', _href: n.href }));
        (results.courses || []).forEach((c) => items.push({ ...c, _type: 'course', _href: '/fixed-events' }));
        (results.sessions || []).forEach((s) => items.push({ ...s, _type: 'session', _href: '/schedules' }));
        (results.todos || []).forEach((t) => items.push({ ...t, _type: 'todo', _href: '/todos' }));
        return items;
    }, [results]);

    const flat = flatResults();

    /**
     * The actual search fetch. Called after debounce delay.
     * Uses AbortController so we can cancel the previous request
     * if a new one fires before the old one completes.
     */
    const doSearch = useCallback(async (q) => {
        // Cancel any in-flight request from a previous keystroke
        if (abortRef.current) {
            abortRef.current.abort();
        }

        // Empty query → clear results immediately, no network request
        if (!q.trim()) {
            setResults(null);
            setLoading(false);
            setError(null);
            setActiveIndex(-1);
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ q: q.trim(), lang });
            const res = await fetch(`/search?${params}`, {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
            });

            if (!res.ok) {
                if (res.status === 429) {
                    setError(tr.rateLimited);
                } else {
                    setError(tr.error);
                }
                setResults(null);
                return;
            }

            const data = await res.json();
            // Only update if this request wasn't aborted
            if (!controller.signal.aborted) {
                setResults(data);
                setActiveIndex(-1);
                setIsOpen(true);
            }
        } catch (err) {
            // AbortError means we intentionally cancelled — that's fine
            if (err.name !== 'AbortError') {
                setError(tr.error);
                setResults(null);
            }
        } finally {
            // Only stop loading if this is still the active request
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [lang, tr]);

    /**
     * Handle input changes with debouncing.
     * We wait 300ms after the user stops typing before firing the request.
     * This is a simple debounce implementation using setTimeout + useRef.
     */
    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        // Clear any pending debounce timer
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!val.trim()) {
            // Empty input → clear immediately (no debounce needed)
            setResults(null);
            setLoading(false);
            setActiveIndex(-1);
            return;
        }

        // Set a new timer: search after 300ms of inactivity
        setLoading(true); // optimistic loading indicator
        debounceRef.current = setTimeout(() => {
            doSearch(val);
        }, 300);
    };

    /**
     * Navigate to a result item. Uses Inertia router for SPA navigation
     * so the page transitions smoothly without a full reload.
     */
    const navigateTo = (href) => {
        setIsOpen(false);
        setQuery('');
        setResults(null);
        if (onClose) onClose();
        router.visit(href);
    };

    /**
     * Handle keyboard navigation inside the search.
     * - ArrowDown / ArrowUp: move highlight through results
     * - Enter: navigate to highlighted result (or submit first result)
     * - Escape: close dropdown and blur input
     */
    const handleKeyDown = (e) => {
        const total = flat.length;
        if (total === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % total);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + total) % total);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && flat[activeIndex]) {
                navigateTo(flat[activeIndex]._href);
            } else if (flat.length > 0) {
                navigateTo(flat[0]._href);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
            if (onClose) onClose();
        }
    };

    /**
     * Clear the search and close the dropdown.
     */
    const handleClear = () => {
        setQuery('');
        setResults(null);
        setLoading(false);
        setError(null);
        setActiveIndex(-1);
        setIsOpen(false);
        if (inputRef.current) inputRef.current.focus();
    };

    /**
     * Auto-focus the input when the component mounts.
     * For mobile overlay, this triggers the phone's virtual keyboard.
     */
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        // Cleanup: cancel any pending debounce or abort on unmount
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    // Determine if we should show the dropdown (has content to show)
    const showDropdown = isOpen && (results || error);

    const totalResults = flat.length;

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* ── Search input bar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: isMobile ? '10px 14px' : '8px 12px',
                background: 'var(--sp-inputBg)',
                border: '1px solid var(--sp-inputBorder)',
                borderRadius: '10px',
                transition: 'border-color 0.15s',
                ...(showDropdown ? { borderColor: 'var(--sp-accent)', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}),
            }}>
                {/* Search icon */}
                <svg width="16" height="16" fill="none" stroke="var(--sp-textMuted)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>

                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results || error) setIsOpen(true); }}
                    placeholder={tr.placeholder}
                    aria-label={tr.ariaLabel}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        fontSize: isMobile ? '15px' : '13px', color: 'var(--sp-text)',
                        fontFamily: "'DM Sans', sans-serif",
                        minWidth: 0,
                    }}
                />

                {/* Loading spinner */}
                {loading && (
                    <div style={{
                        width: '16px', height: '16px', border: '2px solid var(--sp-inputBorder)',
                        borderTopColor: 'var(--sp-accent)', borderRadius: '50%',
                        animation: 'spSearchSpin 0.6s linear infinite', flexShrink: 0,
                    }} />
                )}

                {/* Clear button — only visible when there's text */}
                {query && (
                    <button
                        onClick={handleClear}
                        aria-label={tr.clear}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '2px', display: 'flex', alignItems: 'center',
                            color: 'var(--sp-textMuted)', flexShrink: 0,
                        }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Results dropdown ── */}
            {showDropdown && (
                <div
                    style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                        background: 'var(--sp-card)',
                        border: '1px solid var(--sp-accent)',
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        maxHeight: isMobile ? '60vh' : '400px',
                        overflowY: 'auto',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                >
                    {/* Error state */}
                    {error && (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--sp-error)', fontSize: 'var(--sp-text-base)' }}>
                            {error}
                        </div>
                    )}

                    {/* No results */}
                    {!error && totalResults === 0 && query.trim() && (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--sp-text-3xl)', marginBottom: '6px' }}>🔍</div>
                            <p style={{ fontSize: 'var(--sp-text-base)', color: 'var(--sp-textMuted)', margin: 0 }}>{tr.noResults}</p>
                        </div>
                    )}

                    {/* Navigation shortcuts */}
                    {!error && results?.nav?.length > 0 && (
                        <div>
                            <div style={sectionHeaderStyle(tk)}>{tr.navigation}</div>
                            {results.nav.map((n, i) => (
                                <ResultItem
                                    key={`nav-${i}`}
                                    active={activeIndex === i}
                                    onClick={() => navigateTo(n.href)}
                                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                >
                                    <svg width="14" height="14" fill="none" stroke="var(--sp-accent)" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>{n.label}</span>
                                </ResultItem>
                            ))}
                        </div>
                    )}

                    {/* Course results */}
                    {!error && results?.courses?.length > 0 && (
                        <div>
                            <div style={sectionHeaderStyle(tk)}>{tr.courses}</div>
                            {results.courses.map((c, i) => {
                                const idx = (results.nav?.length || 0) + i;
                                return (
                                    <ResultItem
                                        key={`course-${c.id}`}
                                        active={activeIndex === idx}
                                        onClick={() => navigateTo('/fixed-events')}
                                        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                    >
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '7px',
                                            background: 'var(--sp-type-intensif)', color: 'var(--sp-type-intensif-fg)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--sp-text-sm)', fontWeight: 700, flexShrink: 0,
                                        }}>
                                            {c.title?.slice(0, 2).toUpperCase() || '?'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 'var(--sp-text-base)', fontWeight: 600, color: 'var(--sp-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {c.title}
                                            </div>
                                            <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--sp-textMuted)', display: 'flex', gap: '6px' }}>
                                                {c.teacher && <span>👤 {c.teacher}</span>}
                                                <span>{c.day_of_week} {c.start_time?.slice(0,5)}–{c.end_time?.slice(0,5)}</span>
                                            </div>
                                        </div>
                                    </ResultItem>
                                );
                            })}
                        </div>
                    )}

                    {/* Schedule session results */}
                    {!error && results?.sessions?.length > 0 && (
                        <div>
                            <div style={sectionHeaderStyle(tk)}>{tr.sessions}</div>
                            {results.sessions.map((s, i) => {
                                const idx = (results.nav?.length || 0) + (results.courses?.length || 0) + i;
                                const typeLabel = s.schedule_type === 'intensif' ? '🔥' : s.schedule_type === 'equilibre' ? '⚖️' : '🍃';
                                return (
                                    <ResultItem
                                        key={`session-${s.schedule_id}-${s.day}-${i}`}
                                        active={activeIndex === idx}
                                        onClick={() => navigateTo('/schedules')}
                                        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                    >
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '7px',
                                            background: 'var(--sp-type-leger)', color: 'var(--sp-type-leger-fg)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--sp-text-lg)', flexShrink: 0,
                                        }}>
                                            {typeLabel}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 'var(--sp-text-base)', fontWeight: 600, color: 'var(--sp-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {s.matiere}
                                            </div>
                                            <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--sp-textMuted)', display: 'flex', gap: '6px' }}>
                                                <span>{s.day}</span>
                                                <span>{s.debut?.slice(0,5)}–{s.fin?.slice(0,5)}</span>
                                                {s.is_active && <span style={{ color: 'var(--sp-success)' }}>✓</span>}
                                            </div>
                                        </div>
                                    </ResultItem>
                                );
                            })}
                        </div>
                    )}

                    {/* Daily task results */}
                    {!error && results?.todos?.length > 0 && (
                        <div>
                            <div style={sectionHeaderStyle(tk)}>{tr.todos}</div>
                            {results.todos.map((t, i) => {
                                const idx = (results.nav?.length || 0) + (results.courses?.length || 0) + (results.sessions?.length || 0) + i;
                                const diffColors = [tk.textMuted, tk.success, tk.accent, tk.warning, tk.danger];
                                const color = diffColors[Math.min(Math.max(t.priority || 3, 1), 5) - 1] || tk.textMuted;
                                return (
                                    <ResultItem
                                        key={`todo-${t.id}`}
                                        active={activeIndex === idx}
                                        onClick={() => navigateTo('/todos')}
                                        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                    >
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '7px',
                                            background: `${color}18`, color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--sp-text-sm)', fontWeight: 700, flexShrink: 0,
                                        }}>
                                            📋
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 'var(--sp-text-base)', fontWeight: 600, color: 'var(--sp-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {t.title}
                                            </div>
                                            <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--sp-textMuted)', display: 'flex', gap: '6px' }}>
                                                {t.description && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</span>}
                                                {t.is_scheduled && <span style={{ color: tk.accent }}>⏰</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 1, flexShrink: 0, color }}>
                                            {Array.from({ length: 5 }, (_, si) => (
                                                <svg key={si} width="10" height="10" viewBox="0 0 24 24"
                                                    fill={si < (t.priority || 3) ? 'currentColor' : 'none'}
                                                    stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </ResultItem>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Spinner animation — injected as a style tag */}
            <style>{`@keyframes spSearchSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/**
 * Section header for result groups (Courses, Sessions, Pages).
 * Uses a subtle muted text style consistent with SmartPlanner's design.
 */
function sectionHeaderStyle(tk) {
    return {
        fontSize: 'var(--sp-text-xs)', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.06em', color: tk.textMuted,
        padding: '8px 12px 4px', userSelect: 'none',
    };
}

/**
 * ResultItem — A single clickable result row.
 * Supports keyboard highlighting via the `active` prop.
 * Uses onMouseEnter to update the active index so mouse and keyboard
 * navigation don't fight each other.
 */
function ResultItem({ children, active, onClick, style }) {
    const { tk } = useTheme();
    return (
        <div
            role="option"
            aria-selected={active}
            onClick={onClick}
            onMouseEnter={(e) => {
                // We dispatch a custom event so the parent can update activeIndex.
                // This avoids prop drilling — the parent's keyboard handler
                // and this mouse handler both control the same activeIndex state.
                e.currentTarget.parentElement?.querySelectorAll('[role="option"]').forEach((el, i) => {
                    if (el === e.currentTarget) {
                        // Notify parent via a data attribute trick
                        el.closest('[data-search-dropdown]')?.dispatchEvent(
                            new CustomEvent('search-hover', { detail: i })
                        );
                    }
                });
            }}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', cursor: 'pointer',
                transition: 'background 0.1s',
                background: active ? 'var(--sp-hoverBg)' : 'transparent',
                ...style,
            }}
        >
            {children}
        </div>
    );
}
