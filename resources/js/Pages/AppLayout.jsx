import React, { useState, useEffect, useMemo, createContext, useContext } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import GlobalSearch from "@/Components/GlobalSearch";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { THEMES } from "@/Themes";

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
            fontSize: 'var(--sp-text-base)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'flashIn 0.3s ease',
        }}>
            <span style={{ fontWeight: 700 }}>{isErr ? '✕' : '✓'}</span> {visible.msg}
        </div>
    );
}

const TRANSLATIONS = {
    fr: { nav_section:"Navigation", dashboard:"Tableau de bord", planning:"Mon planning", fixed_events:"Tâches fixes", preferences:"Préférences", statistics:"Statistiques", export:"Exporter", todos:"Tâches du jour", sleep_schedule:"Sommeil", generate_btn:"Générer le planning", profile_title:"Profil", logout:"Déconnexion", logout_confirm:"Êtes-vous sûr de vouloir vous déconnecter ?", yes:"Oui", cancel:"Non", fallback_name:"Utilisateur", dark_toggle_on:"Passer en mode clair", dark_toggle_off:"Passer en mode sombre", close_menu:"Fermer le menu", open_menu:"Ouvrir le menu", search_label:"Rechercher", close_search:"Fermer la recherche", dir:"ltr" },
    en: { nav_section:"Navigation", dashboard:"Dashboard", planning:"My Schedule", fixed_events:"Fixed Tasks", preferences:"Preferences", statistics:"Statistics", export:"Export", todos:"Daily Tasks", sleep_schedule:"Sleep", generate_btn:"Generate Schedule", profile_title:"Profile", logout:"Logout", logout_confirm:"Are you sure you want to log out?", yes:"Yes", cancel:"Cancel", fallback_name:"User", dark_toggle_on:"Switch to light mode", dark_toggle_off:"Switch to dark mode", close_menu:"Close menu", open_menu:"Open menu", search_label:"Search", close_search:"Close search", dir:"ltr" },
    ar: { nav_section:"التنقل", dashboard:"لوحة التحكم", planning:"جدولي", fixed_events:"المهام الثابتة", preferences:"التفضيلات", statistics:"الإحصائيات", export:"تصدير", todos:"مهام اليوم", sleep_schedule:"النوم", generate_btn:"إنشاء الجدول", profile_title:"الملف الشخصي", logout:"تسجيل الخروج", logout_confirm:"هل أنت متأكد من تسجيل الخروج؟", yes:"نعم", cancel:"إلغاء", fallback_name:"مستخدم", dark_toggle_on:"التبديل إلى الوضع الفاتح", dark_toggle_off:"التبديل إلى الوضع الداكن", close_menu:"إغلاق القائمة", open_menu:"فتح القائمة", search_label:"بحث", close_search:"إغلاق البحث", dir:"rtl" },
};

export const LangContext = createContext({ lang: "fr", tr: TRANSLATIONS.fr, setLang: () => {} });
export const useLang = () => useContext(LangContext);

const ThemeContext = createContext({ dark: false, tk: THEMES.default.light, themeName: 'default', setThemeName: () => {} });
export const useTheme = () => useContext(ThemeContext);

/* These must be defined OUTSIDE AppLayout to prevent remounting on every render.
 * Each receives the props it needs from AppLayout. */
const DarkToggle = ({ tk, dark, onToggle, tr, size = 28 }) => (
    <button onClick={onToggle} aria-pressed={dark}
        aria-label={dark ? tr.dark_toggle_on : tr.dark_toggle_off}
        style={{ width:`${size}px`, height:`${size}px`, borderRadius:"7px", background:tk.subtleBg, border:"none", cursor:"pointer", fontSize:"var(--sp-text-lg)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {dark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
    </button>
);

const LogoutBtn = ({ tk, onLogout, tr, size = 28 }) => (
    <button onClick={onLogout} aria-label={tr.logout} title={tr.logout}
        style={{ width:`${size}px`, height:`${size}px`, borderRadius:"7px", background:tk.dangerBg, border:`1px solid ${tk.dangerBorder}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
        <svg width="15" height="15" fill="none" stroke={tk.danger} strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
    </button>
);

const LangSwitcher = ({ lang, tk, onLangChange, tr }) => (
    <div style={{ padding:"10px 12px", borderBottom:`1px solid ${tk.sidebarBorder}` }}>
        <p style={{ fontSize:"var(--sp-text-xs)", fontWeight:700, color:tk.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 6px", textAlign: "start" }}>
            {lang==='ar' ? 'اللغة' : lang==='en' ? 'Language' : 'Langue'}
        </p>
        <div role="group" aria-label="Language selection" style={{ display:"flex", gap:"4px" }}>
            {['fr','en','ar'].map(l => (
                <button key={l} aria-label={l === 'fr' ? 'Français' : l === 'en' ? 'English' : 'العربية'} aria-pressed={lang===l} onClick={() => onLangChange(l)}
                    style={{ flex:1, padding:"5px 0", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"var(--sp-text-xl)", transition:"all 0.15s", background: lang===l ? tk.accent : tk.hoverBg, boxShadow: lang===l ? 'none' : 'inset 0 0 0 1px ' + tk.sidebarBorder }}>
                    {l==='fr' ? '\uD83C\uDDEB\uD83C\uDDF7' : l==='en' ? '\uD83C\uDDEC\uD83C\uDDE7' : '\uD83C\uDDF2\uD83C\uDDE6'}
                </button>
            ))}
        </div>
    </div>
);

const NavLinks = ({ tk, tr, NAV, url, onNavClick }) => {
    function isActive(href) { return url === href || url.startsWith(href + '/'); }
    return (
        <nav role="navigation" aria-label={tr.nav_section} style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:"2px" }}>
            <p style={{ fontSize:"var(--sp-text-xs)", fontWeight:700, color:tk.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", padding:"0 8px", margin:"0 0 8px" }}>{tr.nav_section}</p>
            {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                    <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={onNavClick}
                        style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 10px", borderRadius:"8px", fontSize:"var(--sp-text-base)", fontWeight:500, textDecoration:"none", transition:"all 0.12s", position:"relative", color: active ? tk.accentText : tk.textSecondary, background: active ? tk.accent : "transparent" }}>
                        <span style={{ color: active ? tk.accentText : tk.textSecondary, flexShrink:0 }}>{item.icon}</span>
                        {item.label}
                        {active && <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:tk.accentText, flexShrink:0, marginInlineStart:'auto' }} />}
                    </Link>
                );
            })}
        </nav>
    );
};

function buildNav(tr) {
    return [
        { href:"/dashboard",    label:tr.dashboard,    icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
        { href:"/schedules",    label:tr.planning,     icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
        { href:"/fixed-events", label:tr.fixed_events, icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg> },
        { href:"/todos",        label:tr.todos,         icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg> },
        { href:"/sleep-schedule", label:tr.sleep_schedule, icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg> },
        { href:"/preferences",  label:tr.preferences,  icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg> },
        { href:"/statistics",   label:tr.statistics,   icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
        { href:"/export",       label:tr.export,       icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> },
    ];
}

export default function AppLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const [dark, setDark] = useState(() => {
        try { return localStorage.getItem("smartplanner_dark") === "true"; }
        catch { return false; }
    });

    /* Theme: prefer backend preference, fallback to localStorage, then default */
    const backendTheme = props.preferences?.theme;
    const [themeName, setThemeNameState] = useState(() => {
        try {
            if (backendTheme) return backendTheme;
            return localStorage.getItem("smartplanner_theme") || "default";
        }
        catch { return "default"; }
    });

    const [lang, setLangState] = useState(() => {
        try { return localStorage.getItem("smartplanner_lang") || "fr"; }
        catch { return "fr"; }
    });

    const tr = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    const tk = useMemo(() => (THEMES[themeName] || THEMES.default)[dark ? 'dark' : 'light'], [themeName, dark]);
    const font = useMemo(() => (THEMES[themeName] || THEMES.default).font || "'DM Sans', sans-serif", [themeName]);
    const isRTL = tr.dir === "rtl";

    const setLang = (l) => {
        setLangState(l);
        try { localStorage.setItem("smartplanner_lang", l); } catch {}
    };

    const setThemeName = (name) => {
        setThemeNameState(name);
        try { localStorage.setItem("smartplanner_theme", name); } catch {}
    };

    useEffect(() => {
        try { localStorage.setItem("smartplanner_dark", dark); } catch {}
        try { localStorage.setItem("smartplanner_theme", themeName); } catch {}
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        document.documentElement.lang = lang;
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        document.documentElement.setAttribute("data-theme-name", themeName);
        Object.entries(tk).forEach(([k, v]) => {
            document.documentElement.style.setProperty(`--sp-${k}`, v);
        });
    }, [dark, themeName, isRTL, lang, tk]);

    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
            document.addEventListener('keydown', handleEsc);
            return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
        }
    }, [drawerOpen]);

    const toggleDark = () => setDark(d => !d);
    const handleLogout = () => {
        if (window.confirm(tr.logout_confirm || "Êtes-vous sûr de vouloir vous déconnecter ?")) {
            router.post('/logout');
        }
    };

    const NAV = buildNav(tr);

    const closeDrawer = () => setDrawerOpen(false);

    return (
        <LangContext.Provider value={{ lang, tr, setLang }}>
            <ThemeContext.Provider value={{ dark, tk, themeName, setThemeName }}>
            <style>{`
                @keyframes flashIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
            <div style={{ display:"flex", minHeight:"100vh", fontFamily: font, background:tk.body }}>

                {/* DESKTOP sidebar — full, sticky, visible only >768px */}
                <aside className="sp-desktop-sidebar" style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto", zIndex:30, background:tk.sidebarBg, borderInlineEnd: `1px solid ${tk.sidebarBorder}` }}>
                    {/* Logo + Dark toggle */}
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"16px 14px", borderBottom:`1px solid ${tk.sidebarBorder}` }}>
                        <Link href="/dashboard" style={{ display:"flex", alignItems:"center", gap:"8px", flex:1, minWidth:0, textDecoration:"none" }}>
                            <ApplicationLogo size={32} />
                            <span style={{ fontSize:"var(--sp-text-lg)", fontWeight:800, color:tk.text, letterSpacing:"-0.02em" }}>SmartPlanner</span>
                        </Link>
                        <DarkToggle tk={tk} dark={dark} onToggle={toggleDark} tr={tr} />
                    </div>
                    <LangSwitcher lang={lang} tk={tk} onLangChange={(l) => { setLang(l); setTimeout(() => router.reload(), 100); }} tr={tr} />
                    {/* Search — desktop sidebar */}
                    <div style={{ padding:"8px 12px", borderBottom:`1px solid ${tk.sidebarBorder}` }}>
                        <GlobalSearch />
                    </div>
                    <NavLinks tk={tk} tr={tr} NAV={NAV} url={url} />
                    {/* CTA */}
                    <div style={{ padding:"12px 16px", borderTop:`1px solid ${tk.sidebarBorder}` }}>
                        <Link href="/schedules" aria-label={tr.generate_btn} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", width:"100%", padding:"10px", background:tk.accent, color:tk.accentText, borderRadius:"10px", fontSize:"var(--sp-text-base)", fontWeight:600, textDecoration:"none", boxSizing:"border-box" }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                            {tr.generate_btn}
                        </Link>
                    </div>
                    {/* User bar + Profile + Logout */}
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"12px 14px", borderTop:`1px solid ${tk.sidebarBorder}`, background:tk.sidebarBg }}>
                        <div style={{ width:"32px", height:"32px", borderRadius:"50%", overflow:"hidden", background: tk.accentLight, color:tk.accent, fontSize:"var(--sp-text-base)", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {user?.profile_photo_url ? (
                                <img src={user.profile_photo_url} alt={user?.name || "User"} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                            ) : (
                                <span>{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                            )}
                        </div>
                        <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", textAlign: "start" }}>
                            <span style={{ fontSize:"var(--sp-text-base)", fontWeight:600, color:tk.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name || tr.fallback_name}</span>
                            <span style={{ fontSize:"var(--sp-text-xs)", color:tk.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email || ""}</span>
                        </div>
                        <Link href="/profile" aria-label={tr.profile_title} title={tr.profile_title} style={{ width:"28px", height:"28px", borderRadius:"7px", background:tk.subtleBg, border:`1px solid ${tk.sidebarBorder}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, textDecoration:"none" }}>
                            <svg width="15" height="15" fill="none" stroke={tk.textSecondary} strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </Link>
                        <LogoutBtn tk={tk} onLogout={handleLogout} tr={tr} />
                    </div>
                </aside>

                {/* MOBILE drawer — nav-only, slides in from left */}
                {drawerOpen && <div style={{ position:"fixed", inset:0, background:tk.overlay, zIndex:35 }} onClick={closeDrawer} />}
                <aside className="sp-mobile-sidebar" style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", top:0, height:"100vh", overflowY:"auto", zIndex:40, transition:"transform 0.25s ease", position:"fixed", insetInlineStart: 0, background:tk.sidebarBg, borderInlineEnd: `1px solid ${tk.sidebarBorder}`, transform: drawerOpen ? "translateX(0)" : isRTL ? "translateX(100%)" : "translateX(-100%)" }}>
                    {/* Drawer header: close button only */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 14px", borderBottom:`1px solid ${tk.sidebarBorder}` }}>
                        <span style={{ fontSize:"var(--sp-text-base)", fontWeight:700, color:tk.textMuted, textTransform:"uppercase", letterSpacing:"0.05em" }}>{tr.nav_section}</span>
                        <button onClick={closeDrawer} aria-label={tr.close_menu} style={{ width:"36px", height:"36px", borderRadius:"7px", background:tk.subtleBg, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <svg width="16" height="16" fill="none" stroke={tk.textSecondary} strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    {/* Nav only — no logo, no dark toggle, no user bar, no logout */}
                    <NavLinks tk={tk} tr={tr} NAV={NAV} url={url} onNavClick={closeDrawer} />
                    {/* Profile + Language at bottom of drawer */}
                    <div style={{ borderTop:`1px solid ${tk.sidebarBorder}` }}>
                        <Link href="/profile" onClick={closeDrawer} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px", textDecoration:"none", color:tk.textSecondary, fontSize:"var(--sp-text-sm)", fontWeight:500 }}>
                            {user?.profile_photo_url ? (
                                <img src={user.profile_photo_url} alt="" style={{ width:"32px", height:"32px", borderRadius:"50%", objectFit:"cover" }} />
                            ) : (
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z"/></svg>
                            )}
                            {tr.profile_title}
                        </Link>
                        <LangSwitcher lang={lang} tk={tk} onLangChange={(l) => { setLang(l); setTimeout(() => router.reload(), 100); }} tr={tr} />
                    </div>
                </aside>

                {/* Main content */}
                <main style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", background:tk.body }}>
                    {/* Mobile topbar — hidden on desktop via .sp-mobile-topbar */}
                    <div className="sp-mobile-topbar" style={{ alignItems:"center", gap:"8px", padding:"10px 12px", position:"sticky", top:0, zIndex:10, background:tk.topbarBg, borderBottom:`1px solid ${tk.sidebarBorder}` }}>
                        <button onClick={() => setDrawerOpen(true)} aria-label={tr.open_menu} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", minWidth:"40px", minHeight:"40px", display:"flex", flexShrink:0 }}>
                            <svg width="20" height="20" fill="none" stroke={tk.textSecondary} strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>
                        <Link href="/dashboard" style={{ display:"flex", alignItems:"center", gap:"4px", textDecoration:"none" }}>
                            <ApplicationLogo size={22} />
                            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.1, marginInlineStart:'2px', minWidth:0 }}>
                                <span style={{ fontSize:"11px", fontWeight:800, color:tk.text }}>Smart</span>
                                <span style={{ fontSize:"11px", fontWeight:800, color:tk.text }}>Planner</span>
                            </div>
                        </Link>
                        <div style={{ marginInlineStart:'auto', display:'flex', gap:'6px', alignItems:'center' }}>
                            <button onClick={() => setSearchOpen(true)} aria-label={tr.search_label} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", minWidth:36, minHeight:36, display:"flex", flexShrink:0 }}>
                                <svg width="18" height="18" fill="none" stroke={tk.textSecondary} strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                                </svg>
                            </button>
                            <Link href="/profile" aria-label={tr.profile_title} style={{ width:"36px", height:"36px", borderRadius:"50%", overflow:"hidden", border:`1.5px solid ${tk.sidebarBorder}`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:tk.subtleBg }}>
                                {user?.profile_photo_url ? (
                                    <img src={user.profile_photo_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                ) : (
                                    <svg width="13" height="13" fill="none" stroke={tk.textSecondary} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z"/></svg>
                                )}
                            </Link>
                            <DarkToggle tk={tk} dark={dark} onToggle={toggleDark} tr={tr} size={36} />
                            <LogoutBtn tk={tk} onLogout={handleLogout} tr={tr} size={36} />
                        </div>
                    </div>
                    <FlashBanner />
                    <div key={lang} style={{ flex:1 }}>{children}</div>
                </main>

                {/* Mobile search overlay — slides down from top, covers content */}
                {searchOpen && (
                    <div style={{ position:"fixed", inset:0, zIndex:50, background:tk.body, display:"flex", flexDirection:"column" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"12px 16px", borderBottom:`1px solid ${tk.sidebarBorder}`, background:tk.topbarBg }}>
                            <button onClick={() => setSearchOpen(false)} aria-label={tr.close_search} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", display:"flex", flexShrink:0 }}>
                                <svg width="20" height="20" fill="none" stroke={tk.textSecondary} strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>
                            <div style={{ flex:1 }}>
                                <GlobalSearch isMobile onClose={() => setSearchOpen(false)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </ThemeContext.Provider>
        </LangContext.Provider>
    );
}