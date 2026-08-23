import { Head, Link } from "@inertiajs/react";
import AppLayout from "./AppLayout";
import { useTheme } from "./AppLayout";
import { useState } from "react";

const T = {
    fr: {
        title:"Tableau de bord",
        greeting_am:"Bonjour", greeting_pm:"Bon après-midi", greeting_eve:"Bonsoir",
        tasks_week:"Tâches cette semaine", fixed_tasks:"Tâches fixes",
        study_time:"Temps d'étude / semaine", today_slots:"Aujourd'hui", slots:"créneaux",
        today_schedule:"Programme", see_all:"Voir tout →",
        in_progress:"En cours maintenant", until:"jusqu'à", no_tasks:"Aucune session prévue",
        generate:"Générer le planning", next_slot:"Prochain créneau", quick_actions:"Actions rapides",
        add_task:"Ajouter une tâche fixe", regenerate:"Regénérer le planning",
        edit_prefs:"Modifier les préférences", export:"Exporter / imprimer",
        week:"Semaine", at:"à", dir:"ltr",
        tab_today:"Aujourd'hui", tab_tomorrow:"Demain", tab_week:"Cette semaine",
        sessions:"sessions", session:"session", no_sessions:"Aucune session",
        days_fr: {
            Lundi:"Lun", Mardi:"Mar", Mercredi:"Mer",
            Jeudi:"Jeu", Vendredi:"Ven", Samedi:"Sam"
        },
    },
    en: {
        title:"Dashboard",
        greeting_am:"Good morning", greeting_pm:"Good afternoon", greeting_eve:"Good evening",
        tasks_week:"Tasks this week", fixed_tasks:"Fixed tasks",
        study_time:"Study time / week", today_slots:"Today", slots:"slots",
        today_schedule:"Schedule", see_all:"See all →",
        in_progress:"In progress now", until:"until", no_tasks:"No sessions planned",
        generate:"Generate schedule", next_slot:"Next slot", quick_actions:"Quick actions",
        add_task:"Add fixed task", regenerate:"Regenerate schedule",
        edit_prefs:"Edit preferences", export:"Export / print",
        week:"Week", at:"at", dir:"ltr",
        tab_today:"Today", tab_tomorrow:"Tomorrow", tab_week:"This week",
        sessions:"sessions", session:"session", no_sessions:"No sessions",
        days_fr: {
            Lundi:"Mon", Mardi:"Tue", Mercredi:"Wed",
            Jeudi:"Thu", Vendredi:"Fri", Samedi:"Sat"
        },
    },
    ar: {
        title:"لوحة التحكم",
        greeting_am:"صباح الخير", greeting_pm:"مساء الخير", greeting_eve:"مساء الخير",
        tasks_week:"مهام هذا الأسبوع", fixed_tasks:"المهام الثابتة",
        study_time:"وقت الدراسة / أسبوع", today_slots:"اليوم", slots:"فترات",
        today_schedule:"البرنامج", see_all:"عرض الكل →",
        in_progress:"جارٍ الآن", until:"حتى", no_tasks:"لا توجد جلسات",
        generate:"إنشاء الجدول", next_slot:"الفترة القادمة", quick_actions:"إجراءات سريعة",
        add_task:"إضافة مهمة ثابتة", regenerate:"إعادة إنشاء الجدول",
        edit_prefs:"تعديل التفضيلات", export:"تصدير / طباعة",
        week:"الأسبوع", at:"في", dir:"rtl",
        tab_today:"اليوم", tab_tomorrow:"غداً", tab_week:"هذا الأسبوع",
        sessions:"جلسات", session:"جلسة", no_sessions:"لا توجد جلسات",
        days_fr: {
            Lundi:"اثن", Mardi:"ثلا", Mercredi:"أرب",
            Jeudi:"خمي", Vendredi:"جمع", Samedi:"سبت"
        },
    },
};

const TYPE_COLORS = {
    fixed: { bg:"#EEF2FF", text:"#4338CA", dot:"#6366F1" },
    study: { bg:"#F0FDF4", text:"#15803D", dot:"#22C55E" },
    break: { bg:"#FFFBEB", text:"#92400E", dot:"#F59E0B" },
    free:  { bg:"#F0F9FF", text:"#0369A1", dot:"#0EA5E9" },
    sleep: { bg:"#F5F3FF", text:"#5B21B6", dot:"#8B5CF6" },
};

function formatTime(t) { return t ? t.slice(0, 5) : ""; }

function StatCard({ label, value, accent }) {
    return (
        <div style={s.statCard}>
            <span style={s.statLabel}>{label}</span>
            <span style={{ ...s.statVal, color: accent || "var(--sp-text)" }}>{value}</span>
        </div>
    );
}

// Single session row used in today/tomorrow list
function SessionRow({ session, isRTL }) {
    return (
        <div style={{ ...s.sessionRow, flexDirection: isRTL ? "row-reverse" : "row" }}>
            <div style={s.sessionDot} />
            <div style={{ flex: 1, textAlign: isRTL ? "right" : "left" }}>
                <p style={s.sessionTitle}>📖 {session.matiere}</p>
                <p style={s.sessionTime}>{formatTime(session.debut)} – {formatTime(session.fin)} · {session.duree} min</p>
            </div>
        </div>
    );
}

export default function Dashboard({
    scheduleItems = [],
    fixedEvents = [],
    user,
    flash = {},
    // New props from backend
    todaySessions = [],
    tomorrowSessions = [],
    weekSummary = {},
    todayName = null,
    tomorrowName = null,
    fixedEventsCount = 0,
    activeSchedule = null,
}) {
    const { dark } = useTheme();
    const lang = (() => { try { return localStorage.getItem("smartplanner_lang") || "fr"; } catch { return "fr"; } })();
    const tr = T[lang] || T.fr;
    const isRTL = tr.dir === "rtl";

    // Tab state: 'today' | 'tomorrow' | 'week'
    const [activeTab, setActiveTab] = useState("today");

    // Dark mode is handled via CSS variables in the style object — no dk overrides needed

    const now     = new Date();
    const nowMin  = now.getHours() * 60 + now.getMinutes();
    const hour    = now.getHours();
    const greeting = hour < 12 ? tr.greeting_am : hour < 18 ? tr.greeting_pm : tr.greeting_eve;
    const locale   = lang === "ar" ? "ar-MA" : lang === "en" ? "en-US" : "fr-FR";

    // Total study minutes from todaySessions + tomorrowSessions for the week stat
    const totalStudyMinutes = Object.values(weekSummary).reduce((a, b) => a + b, 0);

    // Current/next from todaySessions
    const currentSession = todaySessions.find(s => {
        const start = s.debut.split(":").map(Number);
        const end   = s.fin.split(":").map(Number);
        const startMin = start[0] * 60 + start[1];
        const endMin   = end[0]   * 60 + end[1];
        return nowMin >= startMin && nowMin < endMin;
    });

    const nextSession = todaySessions.find(s => {
        const start = s.debut.split(":").map(Number);
        return start[0] * 60 + start[1] > nowMin;
    });

    // Sessions to display in the tab
    const tabSessions = activeTab === "today" ? todaySessions : tomorrowSessions;
    const tabLabel    = activeTab === "today"
        ? `${tr.tab_today}${todayName ? ` · ${todayName}` : ""}`
        : `${tr.tab_tomorrow}${tomorrowName ? ` · ${tomorrowName}` : ""}`;

    const totalWeekSessions = Object.values(weekSummary).reduce((a, b) => a + b, 0);

    return (
        <AppLayout>
            <Head title={tr.title} />
            <div style={{ ...s.page, direction: isRTL ? "rtl" : "ltr" }}>

                {/* Header */}
                <div style={{ ...s.header, flexDirection: isRTL ? "row-reverse" : "row" }}>
                    <div style={{ textAlign: isRTL ? "right" : "left" }}>
                        <h1 style={s.greeting}>{greeting}, {user?.name || "..."} 👋</h1>
                        <p style={s.date}>{now.toLocaleDateString(locale, { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
                    </div>
                    {!activeSchedule && (
                        <Link href="/schedules" style={s.genBtn}>{tr.generate}</Link>
                    )}
                </div>

                {/* Stats */}
                <div style={s.statsRow}>
                    <StatCard label={tr.tasks_week}  value={totalWeekSessions} />
                    <StatCard label={tr.fixed_tasks}  value={fixedEventsCount} />
                    <StatCard label={tr.study_time}   value={`${activeSchedule?.schedule?.resume?.total_heures_semaine ?? 0}h`} accent="var(--sp-success)" />
                    <StatCard label={tr.today_slots}  value={`${todaySessions.length} ${tr.slots}`} />
                </div>

                <div style={s.grid2} className="sp-grid-2col">
                    {/* ── Left: Schedule card ── */}
                    <div style={s.card}>
                        {/* Card header */}
                        <div style={{ ...s.cardHead, flexDirection: isRTL ? "row-reverse" : "row" }}>
                            <h2 style={s.cardTitle}>{tr.today_schedule}</h2>
                            <Link href="/schedules" style={s.cardLink}>{tr.see_all}</Link>
                        </div>

                        {/* In-progress banner */}
                        {currentSession && (
                            <div style={s.currentBanner}>
                                <div style={s.currentDot} />
                                <div style={{ textAlign: isRTL ? "right" : "left" }}>
                                    <p style={s.currentLabel}>{tr.in_progress}</p>
                                    <p style={s.currentTitle}>{currentSession.matiere}</p>
                                    <p style={s.currentTime}>{tr.until} {formatTime(currentSession.fin)}</p>
                                </div>
                            </div>
                        )}

                        {/* Tabs: Today / Tomorrow / Week */}
                        <div style={{ ...s.tabs, flexDirection: isRTL ? "row-reverse" : "row" }}>
                            {["today", "tomorrow", "week"].map(tab => (
                                <button
                                    key={tab}
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        ...s.tab,
                                        background: activeTab === tab ? "var(--sp-accent)" : "var(--sp-subtleBg)",
                                        color:      activeTab === tab ? "var(--sp-accentText)" : "var(--sp-textSecondary)",
                                    }}
                                >
                                    {tab === "today"    ? tr.tab_today :
                                     tab === "tomorrow" ? tr.tab_tomorrow : tr.tab_week}
                                </button>
                            ))}
                        </div>

                        {/* ── Tab: Today or Tomorrow ── */}
                        {activeTab !== "week" && (
                            <div>
                                <p style={s.tabSubLabel}>{tabLabel}</p>
                                {tabSessions.length === 0 ? (
                                    <div style={s.emptyDay}>
                                        <p style={s.emptyText}>{tr.no_tasks}</p>
                                        {!activeSchedule && (
                                            <Link href="/schedules" style={s.miniBtn}>{tr.generate}</Link>
                                        )}
                                    </div>
                                ) : (
                                    <div style={s.sessionList}>
                                        {tabSessions.map((session, i) => (
                                            <SessionRow key={i} session={session} isRTL={isRTL} dark={dark} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Tab: Full week ── */}
                        {activeTab === "week" && (
                            <div>
                                <p style={s.tabSubLabel}>
                                    {totalWeekSessions} {tr.sessions} {tr.tab_week.toLowerCase()}
                                </p>
                                <div style={s.weekGrid} className="sp-week-grid">
                                    {Object.entries(weekSummary).map(([jour, count]) => {
                                        const isToday    = jour === todayName;
                                        const isTomorrow = jour === tomorrowName;
                                        return (
                                            <div
                                                key={jour}
                                                style={{
                                                    ...s.weekDayCard,
                                                    background: isToday    ? "var(--sp-accent)" :
                                                                isTomorrow ? "var(--sp-accentLight)" : "var(--sp-hoverBg)",
                                                    border: isToday    ? "none" :
                                                            isTomorrow ? "1.5px solid var(--sp-accent)" : "1px solid var(--sp-cardBorder)",
                                                }}
                                            >
                                                <span style={{
                                                    ...s.weekDayShort,
                                                    color: isToday ? "var(--sp-accentText)" : isTomorrow ? "var(--sp-accent)" : "var(--sp-textMuted)"
                                                }}>
                                                    {tr.days_fr[jour] || jour.slice(0, 3)}
                                                </span>
                                                <span style={{
                                                    ...s.weekDayCount,
                                                    color: isToday ? "var(--sp-accentText)" : "var(--sp-text)"
                                                }}>
                                                    {count}
                                                </span>
                                                <span style={{
                                                    ...s.weekDayLabel,
                                                    color: isToday ? "var(--sp-accentText)" : "var(--sp-textMuted)"
                                                }}>
                                                    {count === 1 ? tr.session : tr.sessions}
                                                </span>

                                                {/* Sessions detail list per day */}
                                                {activeSchedule && count > 0 && (() => {
                                                    const daySessions =
                                                        activeSchedule.schedule?.details?.[jour]?.sessions_etude ?? [];
                                                    return (
                                                        <div style={s.weekDaySessionList}>
                                                            {daySessions.map((ds, idx) => (
                                                                <div key={idx} style={{
                                                                    ...s.weekDaySession,
                                                                    color: isToday ? "var(--sp-accentText)" : "var(--sp-textSecondary)",
                                                                }}>
                                                                    {formatTime(ds.debut)}–{formatTime(ds.fin)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right column ── */}
                    <div style={s.rightCol}>

                        {/* Next slot */}
                        {nextSession && (
                            <div style={s.card}>
                                <h2 style={{ ...s.cardTitle, textAlign: isRTL ? "right" : "left" }}>{tr.next_slot}</h2>
                                <div style={{ ...s.nextItem, flexDirection: isRTL ? "row-reverse" : "row" }}>
                                    <div style={{ ...s.nextDot, background: "#22C55E" }} />
                                    <div style={{ textAlign: isRTL ? "right" : "left" }}>
                                        <p style={s.nextTitle}>{nextSession.matiere}</p>
                                        <p style={s.nextTime}>{tr.at} {formatTime(nextSession.debut)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div style={s.card}>
                                <h2 style={{ ...s.cardTitle, textAlign: isRTL ? "right" : "left" }}>{tr.quick_actions}</h2>
                            <div style={s.actions}>
                                {[
                                    { href:"/fixed-events", icon:"➕", label:tr.add_task },
                                    { href:"/schedules",    icon:"⚡", label:tr.regenerate },
                                    { href:"/preferences",  icon:"⚙️", label:tr.edit_prefs },
                                    { href:"/export",       icon:"📤", label:tr.export },
                                ].map(a => (
                                    <Link key={a.href} href={a.href} style={{ ...s.actionBtn, flexDirection: isRTL ? "row-reverse" : "row" }}>
                                        <span style={s.actionIcon}>{a.icon}</span>
                                        <span style={s.actionLabel}>{a.label}</span>
                                        <svg width="14" height="14" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24"
                                            style={{ transform: isRTL ? "rotate(180deg)" : "none", marginLeft: isRTL ? 0 : "auto", marginRight: isRTL ? "auto" : 0 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Week mini summary (sidebar) */}
                        <div style={s.card}>
                            <h2 style={{ ...s.cardTitle, textAlign: isRTL ? "right" : "left", marginBottom:"10px" }}>{tr.week}</h2>
                            <div style={s.weekMini} className="sp-week-mini">
                                {Object.entries(weekSummary).map(([jour, count]) => {
                                    const isToday = jour === todayName;
                                    return (
                                        <div
                                            key={jour}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`${tr.days_fr[jour] || jour}: ${count} ${count === 1 ? tr.session : tr.sessions}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setActiveTab("week");
                                                }
                                            }}
                                            style={{
                                                ...s.weekDay,
                                                background: isToday ? "var(--sp-accent)" : "var(--sp-hoverBg)",
                                                border:     isToday ? "none" : "1px solid var(--sp-cardBorder)",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setActiveTab("week")}
                                        >
                                            <span style={{ ...s.weekShort, color: isToday ? "var(--sp-accentText)" : "var(--sp-textMuted)" }}>
                                                {tr.days_fr[jour] || jour.slice(0, 3)}
                                            </span>
                                            <span style={{ ...s.weekCount, color: isToday ? "var(--sp-accentText)" : "var(--sp-text)" }}>
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setActiveTab("week")}
                                style={s.weekDetailBtn}
                            >
                                {tr.tab_week} →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

const s = {
    page:{ maxWidth:"1100px", margin:"0 auto", padding:"2rem 1.25rem 4rem", fontFamily:"'DM Sans',sans-serif", overflowX:"hidden" },
    header:{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem", marginBottom:"1.75rem" },
    greeting:{ fontSize:"26px", fontWeight:800, color:"var(--sp-text)", margin:"0 0 4px", letterSpacing:"-0.02em" },
    date:{ fontSize:"14px", color:"var(--sp-textMuted)", margin:0, textTransform:"capitalize" },
    genBtn:{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"10px 18px", background:"var(--sp-accent)", color:"var(--sp-accentText)", borderRadius:"10px", fontSize:"13px", fontWeight:600, textDecoration:"none" },
    statsRow:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px", marginBottom:"1.75rem" },
    statCard:{ background:"var(--sp-card)", border:"1px solid var(--sp-cardBorder)", borderRadius:"12px", padding:"16px 18px", display:"flex", flexDirection:"column", gap:"4px" },
    statLabel:{ fontSize:"11px", fontWeight:600, color:"var(--sp-textMuted)", textTransform:"uppercase", letterSpacing:"0.05em" },
    statVal:{ fontSize:"24px", fontWeight:800, letterSpacing:"-0.02em", color:"var(--sp-text)" },
    grid2:{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"16px", alignItems:"start" },
    card:{ background:"var(--sp-card)", border:"1px solid var(--sp-cardBorder)", borderRadius:"14px", padding:"1.25rem 1.5rem", marginBottom:"12px" },
    cardHead:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" },
    cardTitle:{ fontSize:"15px", fontWeight:700, color:"var(--sp-text)", margin:0 },
    cardLink:{ fontSize:"12px", color:"var(--sp-accent)", fontWeight:600, textDecoration:"none" },

    tabs:{ display:"flex", gap:"6px", marginBottom:"14px" },
    tab:{ padding:"6px 14px", borderRadius:"20px", fontSize:"12px", fontWeight:600, border:"none", cursor:"pointer", transition:"all 0.15s" },
    tabSubLabel:{ fontSize:"12px", color:"var(--sp-textMuted)", fontWeight:500, marginBottom:"10px" },

    sessionList:{ display:"flex", flexDirection:"column", gap:"8px" },
    sessionRow:{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", background:"var(--sp-successBg)", border:"1px solid var(--sp-successBorder)", borderRadius:"10px" },
    sessionDot:{ width:"8px", height:"8px", borderRadius:"50%", background:"#22C55E", flexShrink:0 },
    sessionTitle:{ fontSize:"13px", fontWeight:600, color:"var(--sp-text)", margin:"0 0 2px" },
    sessionTime:{ fontSize:"11px", color:"var(--sp-textSecondary)", margin:0 },

    weekGrid:{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" },
    weekDayCard:{ borderRadius:"10px", padding:"10px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", background:"var(--sp-hoverBg)", border:"1px solid var(--sp-cardBorder)" },
    weekDayShort:{ fontSize:"9px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" },
    weekDayCount:{ fontSize:"22px", fontWeight:800, letterSpacing:"-0.02em" },
    weekDayLabel:{ fontSize:"9px", fontWeight:500 },
    weekDaySessionList:{ marginTop:"6px", width:"100%", display:"flex", flexDirection:"column", gap:"2px" },
    weekDaySession:{ fontSize:"9px", fontWeight:500, textAlign:"center", background:"var(--sp-subtleBg)", borderRadius:"4px", padding:"1px 4px", color:"var(--sp-textSecondary)" },

    emptyDay:{ textAlign:"center", padding:"1.5rem" },
    emptyText:{ fontSize:"14px", color:"var(--sp-textMuted)", marginBottom:"12px" },
    miniBtn:{ display:"inline-flex", padding:"8px 16px", background:"var(--sp-accentLight)", color:"var(--sp-accent)", borderRadius:"8px", fontSize:"13px", fontWeight:600, textDecoration:"none" },

    currentBanner:{ display:"flex", alignItems:"flex-start", gap:"12px", background:"var(--sp-successBg)", border:"1px solid var(--sp-successBorder)", borderRadius:"10px", padding:"12px 14px", marginBottom:"1rem" },
    currentDot:{ width:"10px", height:"10px", borderRadius:"50%", background:"#22C55E", flexShrink:0, marginTop:"4px" },
    currentLabel:{ fontSize:"10px", fontWeight:700, color:"var(--sp-success)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 2px" },
    currentTitle:{ fontSize:"15px", fontWeight:700, color:"var(--sp-text)", margin:"0 0 2px" },
    currentTime:{ fontSize:"12px", color:"var(--sp-textSecondary)", margin:0 },

    rightCol:{ display:"flex", flexDirection:"column" },
    nextItem:{ display:"flex", alignItems:"center", gap:"12px", background:"var(--sp-hoverBg)", borderRadius:"10px", padding:"12px 14px", marginTop:"8px" },
    nextDot:{ width:"10px", height:"10px", borderRadius:"50%", flexShrink:0 },
    nextTitle:{ fontSize:"14px", fontWeight:600, color:"var(--sp-text)", margin:"0 0 2px" },
    nextTime:{ fontSize:"12px", color:"var(--sp-textSecondary)", margin:0 },

    actions:{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"8px" },
    actionBtn:{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:"var(--sp-hoverBg)", border:"1px solid var(--sp-cardBorder)", borderRadius:"10px", textDecoration:"none" },
    actionIcon:{ fontSize:"16px", flexShrink:0 },
    actionLabel:{ flex:1, fontSize:"13px", fontWeight:500, color:"var(--sp-text)" },

    weekMini:{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"4px" },
    weekDay:{ borderRadius:"8px", padding:"8px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", background:"var(--sp-hoverBg)", border:"1px solid var(--sp-cardBorder)" },
    weekShort:{ fontSize:"8px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" },
    weekCount:{ fontSize:"15px", fontWeight:800 },
    weekDetailBtn:{ marginTop:"10px", width:"100%", padding:"7px", background:"var(--sp-accentLight)", color:"var(--sp-accent)", border:"none", borderRadius:"8px", fontSize:"12px", fontWeight:600, cursor:"pointer" },
};
