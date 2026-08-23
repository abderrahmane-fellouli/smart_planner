import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, usePage, router } from "@inertiajs/react";

function FlashBanner() {
    const { props } = usePage();
    const flash = props.flash || {};
    const [visible, setVisible] = useState(null);
    const { tk } = useTheme();

    useEffect(() => {
        const msg = flash.success || flash.error;
        const type = flash.success ? 'success' : flash.error ? 'error' : null;
        if (msg) {
            setVisible({ msg, type });
            const timer = setTimeout(() => setVisible(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [props.flash]);

    if (!visible) return null;
    const isErr = visible.type === 'error';
    return (
        <div style={{
            margin: '12px 20px 0', padding: '10px 14px', borderRadius: '10px',
            background: isErr ? tk.dangerBg : tk.successBg,
            border: `1px solid ${isErr ? tk.dangerBorder : tk.successBorder}`,
            color: isErr ? tk.danger : tk.success,
            fontSize: '13px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'flashIn 0.3s ease',
        }}>
            <span style={{ fontWeight: 700 }}>{isErr ? '✕' : '✓'}</span> {visible.msg}
        </div>
    );
}

const TRANSLATIONS = {
    fr: { nav_section:"Navigation", dashboard:"Tableau de bord", planning:"Mon planning", fixed_events:"Tâches fixes", preferences:"Préférences", statistics:"Statistiques", export:"Exporter", generate_btn:"Générer le planning", profile_title:"Profil", logout:"Déconnexion", dir:"ltr" },
    en: { nav_section:"Navigation", dashboard:"Dashboard", planning:"My Schedule", fixed_events:"Fixed Tasks", preferences:"Preferences", statistics:"Statistics", export:"Export", generate_btn:"Generate Schedule", profile_title:"Profile", logout:"Logout", dir:"ltr" },
    ar: { nav_section:"التنقل", dashboard:"لوحة التحكم", planning:"جدولي", fixed_events:"المهام الثابتة", preferences:"التفضيلات", statistics:"الإحصائيات", export:"تصدير", generate_btn:"إنشاء الجدول", profile_title:"الملف الشخصي", logout:"تسجيل الخروج", dir:"rtl" },
};

export const LangContext = createContext({ lang: "fr", tr: TRANSLATIONS.fr, setLang: () => {} });
export const useLang = () => useContext(LangContext);

// Theme context — provides dark mode state + theme token colors to all pages.
// `tk` = theme tokens (colors). `dark` = boolean.
const ThemeContext = createContext({ dark: false, tk: THEME.light });
export const useTheme = () => useContext(ThemeContext);

// Theme color tokens — single source of truth for all colors.
export const THEME = {
    light: {
        body: '#F9FAFB', card: '#FFFFFF', cardBorder: '#E5E7EB',
        sidebarBg: '#FFFFFF', sidebarBorder: '#F3F4F6', topbarBg: '#FFFFFF',
        text: '#111827', textSecondary: '#6B7280', textMuted: '#9CA3AF',
        inputBg: '#FFFFFF', inputBorder: '#D1D5DB',
        subtleBg: '#F3F4F6', hoverBg: '#F9FAFB',
        accent: '#4F46E5', accentLight: '#EEF2FF', accentText: '#FFFFFF', accentHover: '#4338CA',
        danger: '#EF4444', dangerBg: '#FEF2F2', dangerBorder: '#FECACA',
        success: '#065F46', successBg: '#ECFDF5', successBorder: '#A7F3D0',
        overlay: 'rgba(0,0,0,0.3)',
    },
    dark: {
        body: '#0B1120', card: '#1E293B', cardBorder: '#334155',
        sidebarBg: '#111827', sidebarBorder: '#1E293B', topbarBg: '#111827',
        text: '#F1F5F9', textSecondary: '#94A3B8', textMuted: '#64748B',
        inputBg: '#0B1120', inputBorder: '#334155',
        subtleBg: '#0B1120', hoverBg: '#1E293B',
        accent: '#6366F1', accentLight: '#1E1B4B', accentText: '#FFFFFF', accentHover: '#818CF8',
        danger: '#F87171', dangerBg: '#2D1215', dangerBorder: '#7F1D1D',
        success: '#6EE7B7', successBg: '#0D2818', successBorder: '#065F46',
        overlay: 'rgba(0,0,0,0.6)',
    },
};

export default function AppLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [dark, setDark] = useState(() => {
        try { return localStorage.getItem("smartplanner_dark") === "true"; }
        catch { return false; }
    });

    const [lang, setLangState] = useState(() => {
        try { return localStorage.getItem("smartplanner_lang") || "fr"; }
        catch { return "fr"; }
    });

    const tr = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    const tk = THEME[dark ? 'dark' : 'light'];
    const isRTL = tr.dir === "rtl";

    const setLang = (l) => {
        setLangState(l);
        try { localStorage.setItem("smartplanner_lang", l); } catch {}
    };

    useEffect(() => {
        try { localStorage.setItem("smartplanner_dark", dark); } catch {}
        document.body.style.background = tk.body;
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        document.documentElement.lang = lang;
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", dark);
        Object.entries(tk).forEach(([k, v]) => {
            try { document.documentElement.style.setProperty(`--sp-${k}`, v); } catch {}
        });
    }, [dark, isRTL, lang, tk]);

    const toggleDark = () => setDark(d => !d);
    const handleLogout = () => router.post('/logout');

    const NAV = [
        { href:"/dashboard",    label:tr.dashboard,    icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
        { href:"/schedules",    label:tr.planning,     icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
        { href:"/fixed-events", label:tr.fixed_events, icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> },
        { href:"/preferences",  label:tr.preferences,  icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg> },
        { href:"/statistics",   label:tr.statistics,   icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
        { href:"/export",       label:tr.export,       icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> },
    ];

    function isActive(href) { return url === href || url.startsWith(href + '/'); }

    const LogoutBtn = () => (
        <button
            onClick={handleLogout}
            aria-label={tr.logout}
            title={tr.logout}
            style={{
                width:"28px", height:"28px", borderRadius:"7px",
                background:tk.dangerBg, border:`1px solid ${tk.dangerBorder}`,
                cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", flexShrink:0, transition:"all 0.2s",
            }}
        >
            <svg width="15" height="15" fill="none" stroke={tk.danger} strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
        </button>
    );

    const SidebarContent = ({ mobile = false }) => (
        <>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"16px 14px", borderBottom:`1px solid ${tk.sidebarBorder}`, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", flex:1, minWidth:0 }}>
                    <div style={{ width:"32px", height:"32px", background:tk.accent, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="18" height="18" fill="none" stroke={tk.accentText} strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <span style={{ fontSize:"14px", fontWeight:800, color:tk.text, letterSpacing:"-0.02em" }}>SmartPlanner</span>
                </div>
                <button onClick={toggleDark} aria-label={dark ? (lang === 'ar' ? 'الوضع النهاري' : lang === 'en' ? 'Switch to light mode' : 'Passer en mode clair') : (lang === 'ar' ? 'الوضع الليلي' : lang === 'en' ? 'Switch to dark mode' : 'Passer en mode sombre')} style={{ width:"28px", height:"28px", borderRadius:"7px", background:tk.subtleBg, border:"none", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {dark ? "☀️" : "🌙"}
                </button>
            </div>

            {/* Language switcher */}
            <div style={{ padding:"10px 12px", borderBottom:`1px solid ${tk.sidebarBorder}` }}>
                <p style={{ fontSize:"10px", fontWeight:700, color:tk.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 6px", textAlign: isRTL ? 'right' : 'left' }}>
                    {lang==='ar' ? 'اللغة' : lang==='en' ? 'Language' : 'Langue'}
                </p>
                <div role="group" aria-label={lang === 'ar' ? 'اختيار اللغة' : lang === 'en' ? 'Language selection' : 'Sélection de la langue'} style={{ display:"flex", gap:"4px" }}>
                    {['fr','en','ar'].map(l => (
                        <button key={l} aria-label={l === 'fr' ? 'Français' : l === 'en' ? 'English' : 'العربية'} aria-pressed={lang===l} onClick={() => {
                            setLang(l);
                            setTimeout(() => router.reload(), 100);
                        }} style={{ flex:1, padding:"5px 0", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"16px", transition:"all 0.15s", background: lang===l ? tk.accent : tk.subtleBg }}>
                            {l==='fr' ? '🇫🇷' : l==='en' ? '🇬🇧' : '🇲🇦'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Nav */}
            <nav role="navigation" aria-label={tr.nav_section} style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:"2px", direction: isRTL ? 'rtl' : 'ltr' }}>
                <p style={{ fontSize:"10px", fontWeight:700, color:tk.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", padding:"0 8px", margin:"0 0 8px" }}>{tr.nav_section}</p>
                {NAV.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => mobile && setSidebarOpen(false)}
                            style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 10px", borderRadius:"8px", fontSize:"13px", fontWeight:500, textDecoration:"none", transition:"all 0.12s", position:"relative", color: active ? tk.accentText : tk.textSecondary, background: active ? tk.accent : "transparent", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <span style={{ color: active ? tk.accentText : tk.textSecondary, flexShrink:0 }}>{item.icon}</span>
                            {item.label}
                            {active && <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:tk.accentText, flexShrink:0, marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0 }} />}
                        </Link>
                    );
                })}
            </nav>

            {/* CTA */}
            <div style={{ padding:"12px 16px", borderTop:`1px solid ${tk.sidebarBorder}` }}>
                <Link href="/schedules" aria-label={tr.generate_btn} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", width:"100%", padding:"10px", background:tk.accent, color:tk.accentText, borderRadius:"10px", fontSize:"13px", fontWeight:600, textDecoration:"none", boxSizing:"border-box", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    {tr.generate_btn}
                </Link>
            </div>

            {/* User bar + LOGOUT */}
            <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"12px 14px", borderTop:`1px solid ${tk.sidebarBorder}`, background:tk.sidebarBg, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"50%", background: tk.accentLight, color:tk.accent, fontSize:"13px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", textAlign: isRTL ? 'right' : 'left' }}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:tk.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name || (lang === 'ar' ? 'مستخدم' : lang === 'en' ? 'User' : 'Utilisateur')}</span>
                    <span style={{ fontSize:"11px", color:tk.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email || ""}</span>
                </div>
                <Link href="/profile" aria-label={tr.profile_title} title={tr.profile_title} style={{ width:"28px", height:"28px", borderRadius:"7px", background:tk.subtleBg, border:`1px solid ${tk.sidebarBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, textDecoration:"none" }}>
                    <svg width="15" height="15" fill="none" stroke={tk.textSecondary} strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </Link>
                <LogoutBtn />
            </div>
        </>
    );

    return (
        <LangContext.Provider value={{ lang, tr, setLang }}>
            <ThemeContext.Provider value={{ dark, tk }}>
            <style>{`
                @keyframes flashIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
                *:focus-visible { outline: 2px solid var(--sp-accent, #6366F1); outline-offset: 2px; border-radius: 4px; }
                .sp-mobile-topbar { display: flex; }
                @media (min-width: 769px) { .sp-mobile-topbar { display: none !important; } }
                .sp-desktop-sidebar { display: flex !important; }
                @media (max-width: 768px) { .sp-desktop-sidebar { display: none !important; } }
                .sp-mobile-sidebar { display: flex !important; }
                @media (min-width: 769px) { .sp-mobile-sidebar { display: none !important; } }
                    .sp-grid-2col { grid-template-columns: 1fr !important; }
                    .sp-grid-stats { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important; }
                    .sp-kpi-row { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important; }
                    .sp-auth-root { flex-direction: column !important; }
                    .sp-auth-left { width: 100% !important; min-height: auto !important; padding: 32px 24px !important; }
                    .sp-auth-left .features, .sp-auth-left .steps { display: none !important; }
                    .sp-auth-left .brand { display: none !important; }
                    .sp-auth-left h1 { font-size: 22px !important; }
                    .sp-auth-left p { display: none !important; }
                    .sp-preferences-grid { grid-template-columns: 1fr !important; }
                    .sp-schedule-grid { grid-template-columns: 1fr !important; }
                    .sp-export-grid { grid-template-columns: 1fr !important; }
                    .sp-week-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .sp-week-mini { grid-template-columns: repeat(3, 1fr) !important; }
                }
                @media (max-width: 480px) {
                    .sp-kpi-row { grid-template-columns: repeat(2, 1fr) !important; }
                    .sp-week-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
            <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", background:tk.body, direction: isRTL ? 'rtl' : 'ltr' }}>

                {/* Mobile sidebar (slide-in) */}
                <aside className="sp-mobile-sidebar" style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", top:0, left: isRTL ? 'auto' : 0, right: isRTL ? 0 : 'auto', height:"100vh", overflowY:"auto", zIndex:40, transition:"transform 0.25s ease", position:"fixed", background:tk.sidebarBg, borderRight: isRTL ? 'none' : `1px solid ${tk.sidebarBorder}`, borderLeft: isRTL ? `1px solid ${tk.sidebarBorder}` : 'none', transform: sidebarOpen ? "translateX(0)" : isRTL ? "translateX(100%)" : "translateX(-100%)" }}>
                    <SidebarContent mobile />
                </aside>

                {/* Desktop sidebar (sticky) */}
                <aside className="sp-desktop-sidebar" style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto", zIndex:30, background:tk.sidebarBg, borderRight: isRTL ? 'none' : `1px solid ${tk.sidebarBorder}`, borderLeft: isRTL ? `1px solid ${tk.sidebarBorder}` : 'none', order: isRTL ? 2 : 0 }}>
                    <SidebarContent />
                </aside>

                {/* Overlay */}
                {sidebarOpen && <div style={{ position:"fixed", inset:0, background:tk.overlay, zIndex:35 }} onClick={() => setSidebarOpen(false)} />}

                {/* Main */}
                <main style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", background:tk.body }}>
                    {/* Mobile topbar — hidden on desktop via .sp-mobile-topbar + CSS media query */}
                    <div className="sp-mobile-topbar" style={{ alignItems:"center", gap:"12px", padding:"14px 16px", position:"sticky", top:0, zIndex:10, background:tk.topbarBg, borderBottom:`1px solid ${tk.sidebarBorder}`, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <button onClick={() => setSidebarOpen(true)} aria-label={lang === 'ar' ? 'فتح القائمة' : lang === 'en' ? 'Open menu' : 'Ouvrir le menu'} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", display:"flex" }}>
                            <svg width="20" height="20" fill="none" stroke={tk.textSecondary} strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>
                        <span style={{ fontSize:"15px", fontWeight:800, color:tk.text }}>SmartPlanner</span>
                        <div style={{ marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0, display:'flex', gap:'6px' }}>
                            <button onClick={toggleDark} aria-label={dark ? (lang === 'ar' ? 'الوضع النهاري' : lang === 'en' ? 'Switch to light mode' : 'Passer en mode clair') : (lang === 'ar' ? 'الوضع الليلي' : lang === 'en' ? 'Switch to dark mode' : 'Passer en mode sombre')} style={{ width:"28px", height:"28px", borderRadius:"7px", background:tk.subtleBg, border:"none", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                {dark ? "☀️" : "🌙"}
                            </button>
                            <LogoutBtn />
                        </div>
                    </div>
                    {/* Flash banner */}
                    <FlashBanner />
                    {/* key={lang} forces page re-mount when language changes */}
                    <div key={lang} style={{ flex:1 }}>{children}</div>
                </main>
            </div>
            </ThemeContext.Provider>
        </LangContext.Provider>
    );
}
