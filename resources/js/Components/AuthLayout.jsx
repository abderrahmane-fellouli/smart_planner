/**
 * AuthLayout.jsx — Shared layout for all authentication pages.
 *
 * Provides two layout modes:
 *   1. "two-panel" — split screen with branding left + form right (Login, Register)
 *   2. "card"       — centered card on full viewport (Forgot, Reset, Confirm, Verify)
 *
 * Also handles: theme initialization from localStorage, RTL dir attribute,
 * global font-family, shared Spinner, and shared CSS variable styles.
 */
import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { THEMES } from '@/Themes';
import ApplicationLogo from '@/Components/ApplicationLogo';

/* ── Shared translations (only what layout needs) ── */
const L = {
    fr: { dir: 'ltr', brandName: 'SmartPlanner' },
    en: { dir: 'ltr', brandName: 'SmartPlanner' },
    ar: { dir: 'rtl', brandName: 'SmartPlanner' },
};

/* ── Init theme + RTL on mount ── */
export function useAuthTheme() {
    let lang = 'fr';
    if (typeof window !== 'undefined') {
        lang = localStorage.getItem('smartplanner_lang') || 'fr';
    }
    const isRTL = (L[lang] || L.fr).dir === 'rtl';

    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        try {
            const savedTheme = localStorage.getItem('smartplanner_theme') || 'default';
            // Force light mode on auth pages — they should always appear light
            const tokens = (THEMES[savedTheme] || THEMES.default)['light'];
            document.body.style.background = tokens.body;
            document.body.style.fontFamily = (THEMES[savedTheme] || THEMES.default).font;
            Object.entries(tokens).forEach(([k, v]) => {
                document.documentElement.style.setProperty(`--sp-${k}`, v);
            });
        } catch { /* noop */ }
    }, [isRTL]);

    return { lang, isRTL };
}

/* ── Shared Spinner ── */
export function Spinner() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: 'sp-auth-spin 0.8s linear infinite' }}>
            <style>{`@keyframes sp-auth-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    );
}

/* ── Brand logo (used in both layouts) ── */
function BrandMark({ size = 32 }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <ApplicationLogo size={size} />
            <span style={{ fontSize: size > 30 ? 'var(--sp-text-xl)' : 'var(--sp-text-lg)', fontWeight: 800, color: 'var(--sp-text)' }}>
                SmartPlanner
            </span>
        </div>
    );
}

/* ──────────────────────────────────────────────────────
   Layout 1: Two-panel (Login, Register)
   Desktop: [Left branding 45%] [Right form 55%]
   Mobile:  [Logo + brand at top] [Form card]

   Props:
     left  — React nodes rendered in the left branding panel
     children — React nodes rendered in the right form panel
   ────────────────────────────────────────────────────── */
export function TwoPanelAuth({ left, children, dir }) {
    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .sp-auth-root { flex-direction: column !important; }
                    .sp-auth-left { width: 100% !important; min-height: auto !important; padding: 28px 20px !important; }
                    .sp-auth-left .sp-left-features, .sp-auth-left .sp-left-title, .sp-auth-left .sp-left-sub { display: none !important; }
                    .sp-auth-right { padding: 24px 16px !important; }
                }
            `}</style>
            <div style={{ display: 'flex', minHeight: '100vh' }} className="sp-auth-root">

                {/* Left panel — branding */}
                <div style={{
                    width: '45%', background: 'linear-gradient(135deg, var(--sp-accent), var(--sp-accentHover))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
                }} className="sp-auth-left">
                    <div style={{ padding: '48px', position: 'relative', zIndex: 2, maxWidth: '400px' }}>
                        <div style={{ marginBottom: '48px' }}>
                            <BrandMark size={42} />
                        </div>
                        {left}
                    </div>
                    {/* Decorative blobs */}
                    <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -80, insetInlineEnd: -80 }} />
                    <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -60, insetInlineStart: -40 }} />
                </div>

                {/* Right panel — form */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sp-body)', padding: '32px' }} className="sp-auth-right">
                    <div style={{ width: '100%', maxWidth: '440px' }}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ──────────────────────────────────────────────────────
   Layout 2: Centered card (Forgot, Reset, Confirm, Verify)
   Full viewport, centered card with logo on top.
   ────────────────────────────────────────────────────── */
export function CardAuth({ children, dir }) {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--sp-body)', padding: '16px',
        }}>
            <div style={{
                width: '100%', maxWidth: '420px', background: 'var(--sp-card)',
                borderRadius: '16px', border: '1px solid var(--sp-cardBorder)', padding: '32px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <BrandMark size={32} />
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ── Shared style tokens (used by individual auth pages) ── */
export const AUTH = {
    heading: { fontSize: 'var(--sp-text-xl)', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 8px', textAlign: 'center' },
    desc: { fontSize: 'var(--sp-text-base)', color: 'var(--sp-textSecondary)', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.5 },
    formTitle: { fontSize: 'var(--sp-text-3xl)', fontWeight: 800, color: 'var(--sp-text)', margin: '0 0 8px', letterSpacing: '-0.02em' },
    formSub: { fontSize: 'var(--sp-text-lg)', color: 'var(--sp-textSecondary)', margin: 0 },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: 'var(--sp-text-base)', fontWeight: 600, color: 'var(--sp-text)' },
    input: {
        padding: '11px 14px', borderRadius: '10px',
        border: '1.5px solid var(--sp-inputBorder)', fontSize: 'var(--sp-text-lg)',
        background: 'var(--sp-inputBg)', color: 'var(--sp-text)',
        outline: 'none', transition: 'border-color 0.15s',
        fontFamily: "'DM Sans', sans-serif", width: '100%', boxSizing: 'border-box',
    },
    inputErr: { borderColor: 'var(--sp-danger)' },
    error: { fontSize: 'var(--sp-text-sm)', color: 'var(--sp-danger)', fontWeight: 500 },
    submitBtn: {
        padding: '13px', background: 'var(--sp-accent)', color: 'var(--sp-accentText)',
        border: 'none', borderRadius: '12px', fontSize: 'var(--sp-text-lg)',
        fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        width: '100%',
    },
    btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    link: { display: 'block', textAlign: 'center', fontSize: 'var(--sp-text-base)', color: 'var(--sp-accent)', textDecoration: 'none', marginTop: '16px', fontWeight: 500 },
    success: { background: 'var(--sp-successBg)', border: '1px solid var(--sp-successBorder)', color: 'var(--sp-success)', borderRadius: '10px', padding: '10px 14px', fontSize: 'var(--sp-text-base)', marginBottom: '16px' },
    errorBanner: {
        background: 'var(--sp-dangerBg)', border: '1px solid var(--sp-dangerBorder)', color: 'var(--sp-danger)',
        borderRadius: '10px', padding: '12px 16px', fontSize: 'var(--sp-text-base)', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '10px', lineHeight: 1.5,
    },
    errorBannerText: { flex: 1, fontWeight: 500 },
    passwordWrap: { position: 'relative' },
    eyeBtn: {
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
};
