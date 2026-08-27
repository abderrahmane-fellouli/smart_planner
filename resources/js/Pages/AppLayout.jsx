import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import GlobalSearch from "@/Components/GlobalSearch";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { THEMES } from "@/Themes";
import { useTheme, useLang } from "@/ThemeProvider";

export { useTheme, useLang };
export { LogoutModal };

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

const AccountControls = ({ tk, dark, onToggleDark, onLogout, tr, user, href, onNavClick, label, showEmail = true }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 12px', borderTop:`1px solid ${tk.sidebarBorder}`, background:tk.sidebarBg }}>
        <Link href={href} onClick={onNavClick} aria-label={tr.profile_title} style={{ display:'flex', alignItems:'center', gap:'10px', flex:1, minWidth:0, textDecoration:'none', color:tk.text, padding:'6px 4px', borderRadius:'8px', textAlign:'start' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'50%', overflow:'hidden', background: tk.accentLight, color:tk.accent, fontSize:'var(--sp-text-base)', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt={user?.name || "User"} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                    <span style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                )}
            </div>
            <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
                <span style={{ fontSize:'var(--sp-text-base)', fontWeight:600, color:tk.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label || user?.name || tr.fallback_name}</span>
                {showEmail && <span style={{ fontSize:'var(--sp-text-xs)', color:tk.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email || ""}</span>}
            </div>
        </Link>
        <DarkToggle tk={tk} dark={dark} onToggle={onToggleDark} tr={tr} size={38} />
        <LogoutBtn tk={tk} onLogout={onLogout} tr={tr} size={38} />
    </div>
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

const LogoutModal = ({ tk, tr, isRTL, onConfirm, onCancel }) => {
    const cancelRef = React.useRef(null);

    React.useEffect(() => {
        const timer = setTimeout(() => cancelRef.current?.focus(), 50);
        const handleKey = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            clearTimeout(timer);
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onCancel]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-desc"
            style={{
                position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center',
                padding:'16px',
            }}
            onClick={onCancel}
        >
            <div style={{ position:'absolute', inset:0, background: tk.overlay || 'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)' }} />
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position:'relative', width:'100%', maxWidth:'400px', borderRadius:'16px', padding:'24px',
                    background: tk.cardBg, border:`1px solid ${tk.sidebarBorder}`,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    animation: 'logoutModalIn 0.2s ease',
                }}
            >
                <div style={{ textAlign:'center', marginBottom:'20px' }}>
                    <div style={{ width:'48px', height:'48px', borderRadius:'12px', background: tk.dangerBg, display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
                        <svg width="24" height="24" fill="none" stroke={tk.danger} strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                    </div>
                    <h2 id="logout-modal-title" style={{ margin:'0 0 8px', fontSize:'var(--sp-text-lg)', fontWeight:700, color:tk.text, textAlign:'center' }}>
                        {tr.logout_title || 'Se déconnecter'}
                    </h2>
                    <p id="logout-modal-desc" style={{ margin:0, fontSize:'var(--sp-text-base)', color:tk.textSecondary, textAlign:'center' }}>
                        {tr.logout_confirm || 'Êtes-vous sûr de vouloir vous déconnecter ?'}
                    </p>
                </div>
                <div style={{ display:'flex', flexDirection: isRTL ? 'row-reverse' : 'row', gap:'10px', marginTop:'20px' }}>
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        style={{
                            flex:1, padding:'10px 16px', borderRadius:'10px', border:`1px solid ${tk.sidebarBorder}`,
                            background: tk.subtleBg, color: tk.text, fontSize:'var(--sp-text-base)', fontWeight:600,
                            cursor:'pointer', transition:'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = tk.hoverBg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = tk.subtleBg; }}
                    >
                        {tr.cancel || 'Annuler'}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex:1, padding:'10px 16px', borderRadius:'10px', border:'none',
                            background: tk.danger, color:'#fff', fontSize:'var(--sp-text-base)', fontWeight:600,
                            cursor:'pointer', transition:'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                        {tr.logout_title || 'Se déconnecter'}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const { dark, tk, themeName, setThemeName, toggleDark } = useTheme();
    const { lang, tr, setLang } = useLang();
    const font = (THEMES[themeName] || THEMES.default).font || "'DM Sans', sans-serif";
    const isRTL = tr.dir === "rtl";

    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
            document.addEventListener('keydown', handleEsc);
            return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
        }
    }, [drawerOpen]);
    const handleLogout = () => {
        setLogoutModalOpen(true);
    };

    const NAV = buildNav(tr);

    const closeDrawer = () => setDrawerOpen(false);

    return (
        <>
            <style>{`
                @keyframes flashIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
                @keyframes logoutModalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
            `}</style>
            <div style={{ display:"flex", minHeight:"100vh", fontFamily: font, background:tk.body }}>

                {/* DESKTOP sidebar — full, sticky, visible only >768px */}
                <aside className="sp-desktop-sidebar" style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", overflowY:"auto", zIndex:30, background:tk.sidebarBg, borderInlineEnd: `1px solid ${tk.sidebarBorder}` }}>
                    {/* Logo */}
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"16px 14px", borderBottom:`1px solid ${tk.sidebarBorder}` }}>
                        <Link href="/dashboard" style={{ display:"flex", alignItems:"center", gap:"8px", flex:1, minWidth:0, textDecoration:"none" }}>
                            <ApplicationLogo size={32} />
                            <span style={{ fontSize:"var(--sp-text-lg)", fontWeight:800, color:tk.text, letterSpacing:"-0.02em" }}>SmartPlanner</span>
                        </Link>
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
                    {/* User bar: Profile + Dark Mode + Logout grouped (desktop) */}
                    <AccountControls tk={tk} dark={dark} onToggleDark={toggleDark} onLogout={handleLogout} tr={tr} user={user} href="/profile" />
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
                    <NavLinks tk={tk} tr={tr} NAV={NAV} url={url} onNavClick={closeDrawer} />
                    {/* Account controls: Profile + Dark Mode + Logout grouped together */}
                    <AccountControls tk={tk} dark={dark} onToggleDark={toggleDark} onLogout={handleLogout} tr={tr} user={user} href="/profile" onNavClick={closeDrawer} label={tr.profile_title} />
                    <LangSwitcher lang={lang} tk={tk} onLangChange={(l) => { setLang(l); setTimeout(() => router.reload(), 100); }} tr={tr} />
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
                                <span style={{ fontSize:"var(--sp-text-sm)", fontWeight:800, color:tk.text }}>Smart</span>
                                <span style={{ fontSize:"var(--sp-text-sm)", fontWeight:800, color:tk.text }}>Planner</span>
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

                {logoutModalOpen && (
                    <LogoutModal
                        tk={tk}
                        tr={tr}
                        isRTL={isRTL}
                        onConfirm={() => { setLogoutModalOpen(false); router.post('/logout'); }}
                        onCancel={() => setLogoutModalOpen(false)}
                    />
                )}
            </div>
        </>
    );
}