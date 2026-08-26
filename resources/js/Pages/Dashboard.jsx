import { Head, Link } from "@inertiajs/react";
import AppLayout from "./AppLayout";
import { useTheme, useLang } from "./AppLayout";
import { useState } from "react";

const T = {
    fr: {
        title:"Tableau de bord",
        greeting_am:"Bonjour", greeting_pm:"Bon après-midi", greeting_eve:"Bonsoir",
        tasks_week:"Tâches cette semaine", fixed_tasks:"Tâches fixes",
        study_time:"Temps d'étude / semaine", today_slots:"Aujourd'hui", slots:"créneaux",
        today_schedule:"Programme", see_all:"Voir tout →",
        in_progress:"En cours maintenant", until:"jusqu'à", no_tasks:"Aucune session prévue",
        generate:"Générer le planning", next_slot:"Prochain créneau",         quick_actions:"Actions rapides",
        add_task:"Ajouter une tâche fixe", generate_schedule:"Générer le planning",
        sleep_schedule:"Horaire de sommeil", edit_prefs:"Préférences", export:"Exporter", daily_tasks:"Tâches du jour",
        week:"Semaine", at:"à", dir:"ltr",
        tab_today:"Aujourd'hui", tab_tomorrow:"Demain", tab_week:"Cette semaine",
        sessions:"sessions", session:"session", no_sessions:"Aucune session",
        no_sessions_day:"Repos", total_day:"Total", hours:"h",
        fixed_label:"Cours fixes", study_label:"Sessions d'étude",
        daily_task:"Tâche du jour", all_done:"Tout terminé !", no_tasks_yet:"Aucune tâche", more_items:"+{{n}} de plus",
        weekly_digest:"Résumé hebdomadaire", digest_sub:"Vue complète de votre planning",
        todos:"Tâches du jour", todos_sub:"{{completed}}/{{total}} terminées", see_todos:"Voir les tâches →",
        days_full: {
            Lundi:"Lundi", Mardi:"Mardi", Mercredi:"Mercredi",
            Jeudi:"Jeudi", Vendredi:"Vendredi", Samedi:"Samedi", Dimanche:"Dimanche"
        },
        days_fr: {
            Lundi:"Lun", Mardi:"Mar", Mercredi:"Mer",
            Jeudi:"Jeu", Vendredi:"Ven", Samedi:"Sam", Dimanche:"Dim"
        },
    },
    en: {
        title:"Dashboard",
        greeting_am:"Good morning", greeting_pm:"Good afternoon", greeting_eve:"Good evening",
        tasks_week:"Tasks this week", fixed_tasks:"Fixed tasks",
        study_time:"Study time / week", today_slots:"Today", slots:"slots",
        today_schedule:"Schedule", see_all:"See all →",
        in_progress:"In progress now", until:"until", no_tasks:"No sessions planned",
        generate:"Generate schedule", next_slot:"Next slot",         quick_actions:"Quick actions",
        add_task:"Add fixed task", generate_schedule:"Generate schedule",
        sleep_schedule:"Sleep schedule", edit_prefs:"Preferences", export:"Export", daily_tasks:"Daily Tasks",
        week:"Week", at:"at", dir:"ltr",
        tab_today:"Today", tab_tomorrow:"Tomorrow", tab_week:"This week",
        sessions:"sessions", session:"session", no_sessions:"No sessions",
        no_sessions_day:"Rest day", total_day:"Total", hours:"h",
        fixed_label:"Fixed courses", study_label:"Study sessions",
        daily_task:"Daily Task", all_done:"All done!", no_tasks_yet:"No tasks yet", more_items:"+{{n}} more",
        weekly_digest:"Weekly digest", digest_sub:"Full overview of your schedule",
        todos:"Daily Tasks", todos_sub:"{{completed}}/{{total}} done", see_todos:"See tasks →",
        days_full: {
            Lundi:"Monday", Mardi:"Tuesday", Mercredi:"Wednesday",
            Jeudi:"Thursday", Vendredi:"Friday", Samedi:"Saturday", Dimanche:"Sunday"
        },
        days_fr: {
            Lundi:"Mon", Mardi:"Tue", Mercredi:"Wed",
            Jeudi:"Thu", Vendredi:"Fri", Samedi:"Sat", Dimanche:"Sun"
        },
    },
    ar: {
        title:"لوحة التحكم",
        greeting_am:"صباح الخير", greeting_pm:"مساء الخير", greeting_eve:"مساء الخير",
        tasks_week:"مهام هذا الأسبوع", fixed_tasks:"المهام الثابتة",
        study_time:"وقت الدراسة / أسبوع", today_slots:"اليوم", slots:"فترات",
        today_schedule:"البرنامج", see_all:"عرض الكل →",
        in_progress:"جارٍ الآن", until:"حتى", no_tasks:"لا توجد جلسات",
        generate:"إنشاء الجدول", next_slot:"الفترة القادمة",         quick_actions:"إجراءات سريعة",
        add_task:"إضافة مهمة ثابتة", generate_schedule:"إنشاء الجدول",
        sleep_schedule:"جدول النوم", edit_prefs:"التفضيلات", export:"تصدير", daily_tasks:"مهام اليوم",
        week:"الأسبوع", at:"في", dir:"rtl",
        tab_today:"اليوم", tab_tomorrow:"غداً", tab_week:"هذا الأسبوع",
        sessions:"جلسات", session:"جلسة", no_sessions:"لا توجد جلسات",
        no_sessions_day:"يوم راحة", total_day:"المجموع", hours:"ساعة",
        fixed_label:"الدروس الثابتة", study_label:"جلسات الدراسة",
        daily_task:"مهام اليوم", all_done:"اكتمل كل شيء!", no_tasks_yet:"لا توجد مهام", more_items:"+{{n}} إضافية",
        weekly_digest:"ملخص أسبوعي", digest_sub:"نظرة عامة كاملة على جدولك",
        todos:"مهام اليوم", todos_sub:"{{completed}}/{{total}} منجزة", see_todos:"عرض المهام →",
        days_full: {
            Lundi:"الإثنين", Mardi:"الثلاثاء", Mercredi:"الأربعاء",
            Jeudi:"الخميس", Vendredi:"الجمعة", Samedi:"السبت", Dimanche:"الأحد"
        },
        days_fr: {
            Lundi:"اثن", Mardi:"ثلا", Mercredi:"أرب",
            Jeudi:"خمي", Vendredi:"جمع", Samedi:"سبت", Dimanche:"أحد"
        },
    },
};

const TYPE_COLORS = {
    fixed: { bg:"var(--sp-accentLight)", text:"var(--sp-accent)", dot:"var(--sp-accent)" },
    study: { bg:"var(--sp-successBg)", text:"var(--sp-success)", dot:"var(--sp-success)" },
    break: { bg:"var(--sp-warningBg)", text:"var(--sp-warning)", dot:"var(--sp-warning)" },
    free:  { bg:"var(--sp-accentLight)", text:"var(--sp-accent)", dot:"var(--sp-accent)" },
    sleep: { bg:"var(--sp-accentLight)", text:"var(--sp-accent)", dot:"var(--sp-accent)" },
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
        <div style={s.sessionRow}>
            <div style={s.sessionDot} />
            <div style={{ flex: 1, textAlign: "start" }}>
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
    todoStats = { total: 0, completed: 0, pending: 0 },
    pendingTodos = [],
}) {
    const { dark } = useTheme();
    const { lang } = useLang();
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
            <div style={s.page}>

                {/* Header */}
                <div style={s.header}>
                    <div style={{ textAlign: "start" }}>
                        <h1 style={s.greeting}>{greeting}, {user?.display_name || user?.name || "..."} 👋</h1>
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
                        <div style={s.cardHead}>
                            <h2 style={s.cardTitle}>{tr.today_schedule}</h2>
                            <button onClick={() => setActiveTab("week")} style={{ ...s.cardLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{tr.see_all}</button>
                        </div>

                        {/* In-progress banner */}
                        {currentSession && (
                            <div style={s.currentBanner}>
                                <div style={s.currentDot} />
                                <div style={{ textAlign: "start" }}>
                                    <p style={s.currentLabel}>{tr.in_progress}</p>
                                    <p style={s.currentTitle}>{currentSession.matiere}</p>
                                    <p style={s.currentTime}>{tr.until} {formatTime(currentSession.fin)}</p>
                                </div>
                            </div>
                        )}

                        {/* Tabs: Today / Tomorrow / Week */}
                        <div style={s.tabs}>
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

                        {/* ── Tab: Full week digest ── */}
                        {activeTab === "week" && (
                            <div>
                                <p style={s.tabSubLabel}>
                                    {totalWeekSessions} {tr.sessions} · {activeSchedule?.schedule?.resume?.total_heures_semaine ?? 0}{tr.hours}
                                </p>
                                {activeSchedule ? (
                                    <div style={s.digestGrid} className="sp-digest-grid">
                                        {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map(jour => {
                                            const isToday    = jour === todayName;
                                            const isTomorrow = jour === tomorrowName;
                                            const dayData    = activeSchedule.schedule?.details?.[jour] ?? null;
                                            const coursFixes = dayData?.cours_fixes ?? [];
                                            const sessions   = dayData?.sessions_etude ?? [];
                                            const totalH     = dayData?.total_heures_etude ?? 0;
                                            const isEmpty    = !dayData || (coursFixes.length === 0 && sessions.length === 0);
                                            return (
                                                <div
                                                    key={jour}
                                                    style={{
                                                        ...s.digestDay,
                                                        borderColor: isToday ? "var(--sp-accent)" : isTomorrow ? "var(--sp-accentLight)" : "var(--sp-cardBorder)",
                                                        background: isToday ? "var(--sp-accentLight)" : "var(--sp-card)",
                                                    }}
                                                >
                                                    <div style={{ ...s.digestDayHead, background: isToday ? "var(--sp-accent)" : isTomorrow ? "var(--sp-accentLight)" : "var(--sp-hoverBg)" }}>
                                                        <span style={{ ...s.digestDayName, color: isToday ? "var(--sp-accentText)" : "var(--sp-text)" }}>
                                                            {tr.days_full[jour] || jour}
                                                        </span>
                                                        {!isEmpty && (
                                                            <span style={{ ...s.digestDayTotal, color: isToday ? "var(--sp-accentText)" : "var(--sp-accent)" }}>
                                                                {totalH}{tr.hours}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={s.digestDayBody}>
                                                        {isEmpty ? (
                                                            <span style={s.digestEmpty}>{tr.no_sessions_day}</span>
                                                        ) : (
                                                            <>
                                                                {coursFixes.length > 0 && (
                                                                    <div style={s.digestSection}>
                                                                        <span style={s.digestSectionLabel}>{tr.fixed_label}</span>
                                                                        {coursFixes.map((c, i) => (
                                                                            <div key={i} style={{ ...s.digestItem, background: "var(--sp-accentLight)", color: "var(--sp-accent)" }}>
                                                                                <span>📘 {c.title}{c.teacher ? ` · ${c.teacher}` : ''}</span>
                                                                                <span style={{ opacity:0.7, fontSize:"var(--sp-text-xs)" }}>{formatTime(c.start_time)}–{formatTime(c.end_time)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {sessions.length > 0 && (
                                                                    <div style={s.digestSection}>
                                                                        <span style={s.digestSectionLabel}>{tr.study_label}</span>
                                                                        {sessions.map((sess, i) => (
                                                                            <div key={i} style={{ ...s.digestItem, background: "var(--sp-successBg)", color: "var(--sp-success)" }}>
                                                                                <span>📖 {sess.matiere}</span>
                                                                                <span style={{ opacity:0.7, fontSize:"var(--sp-text-xs)" }}>{formatTime(sess.debut)}–{formatTime(sess.fin)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={s.emptyDay}>
                                        <p style={s.emptyText}>{tr.no_tasks}</p>
                                        <Link href="/schedules" style={s.miniBtn}>{tr.generate}</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Right column ── */}
                    <div style={s.rightCol}>

                        {/* Next slot */}
                        {nextSession && (
                            <div style={s.card}>
                                <h2 style={{ ...s.cardTitle, textAlign: "start" }}>{tr.next_slot}</h2>
                                <div style={s.nextItem}>
                                    <div style={{ ...s.nextDot, background: "var(--sp-success)" }} />
                                    <div style={{ textAlign: "start" }}>
                                        <p style={s.nextTitle}>{nextSession.matiere}</p>
                                        <p style={s.nextTime}>{tr.at} {formatTime(nextSession.debut)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div style={s.card}>
                                <h2 style={{ ...s.cardTitle, textAlign: "start" }}>{tr.quick_actions}</h2>
                            <div style={s.actions}>
                                {[
                                    { href:"/todos",         icon:"📋", label:tr.daily_tasks },
                                    { href:"/fixed-events", icon:"➕", label:tr.add_task },
                                    { href:"/sleep-schedule",icon:"🌙", label:tr.sleep_schedule },
                                    { href:"/schedules",    icon:"⚡", label:tr.generate_schedule },
                                    { href:"/preferences",  icon:"⚙️", label:tr.edit_prefs },
                                    { href:"/export",       icon:"📤", label:tr.export },
                                ].map(a => (
                                    <Link key={a.href} href={a.href} style={s.actionBtn}>
                                        <span style={s.actionIcon}>{a.icon}</span>
                                        <span style={s.actionLabel}>{a.label}</span>
                                        <svg width="14" height="14" fill="none" stroke="var(--sp-textMuted)" strokeWidth="2" viewBox="0 0 24 24"
                                            style={{ transform: isRTL ? "rotate(180deg)" : "none", marginInlineStart: "auto", marginInlineEnd: 0 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Daily todo widget */}
                        <Link href="/todos" style={{ ...s.card, textDecoration: "none", display: "block" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <h2 style={{ ...s.cardTitle, textAlign: "start", margin: 0 }}>{tr.todos}</h2>
                                <span style={{ fontSize: "var(--sp-text-xs)", color: "var(--sp-accent)", fontWeight: 600 }}>{tr.see_todos}</span>
                            </div>
                            <p style={{ fontSize: "var(--sp-text-xs)", color: "var(--sp-textSecondary)", margin: "0 0 10px" }}>
                                {tr.todos_sub.replace("{{completed}}", todoStats.completed).replace("{{total}}", todoStats.total)}
                            </p>
                            {todoStats.total > 0 && (
                                <div style={{ height: 4, borderRadius: 2, background: "var(--sp-subtleBg)", overflow: "hidden", marginBottom: 10 }}>
                                    <div style={{ height: "100%", borderRadius: 2, background: "var(--sp-success)", width: `${todoStats.total > 0 ? Math.round((todoStats.completed / todoStats.total) * 100) : 0}%`, transition: "width 0.3s" }} />
                                </div>
                            )}
                            {pendingTodos.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {pendingTodos.slice(0, 4).map(t => (
                                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--sp-text-xs)", color: "var(--sp-textSecondary)" }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.is_scheduled ? "var(--sp-accent)" : "var(--sp-stroke)", flexShrink: 0 }} />
                                            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                                            {t.is_scheduled && (
                                                <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 9, background: "rgba(var(--sp-accent-rgb, 99,102,241), 0.1)", color: "var(--sp-accent)", fontWeight: 600, flexShrink: 0 }}>
                                                    {tr.daily_task}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {todoStats.pending > 4 && (
                                        <span style={{ fontSize: "var(--sp-text-xs)", color: "var(--sp-textMuted)" }}>{tr.more_items.replace("{{n}}", todoStats.pending - 4)}</span>
                                    )}
                                </div>
                            ) : todoStats.total > 0 ? (
                                <p style={{ fontSize: "var(--sp-text-xs)", color: "var(--sp-success)", fontWeight: 600 }}>
                                    {"\u2713"} {tr.all_done}
                                </p>
                            ) : (
                                <p style={{ fontSize: "var(--sp-text-xs)", color: "var(--sp-textMuted)" }}>
                                    {tr.no_tasks_yet}
                                </p>
                            )}
                        </Link>

                        {/* Week mini summary (sidebar) */}
                        <div style={s.card}>
                            <h2 style={{ ...s.cardTitle, textAlign: "start", marginBottom:"10px" }}>{tr.week}</h2>
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
    page:{ maxWidth:"1040px", margin:"0 auto", padding:"32px 24px 60px", fontFamily:"'DM Sans',sans-serif", overflowX:"hidden" },
    header:{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem", marginBottom:"1.25rem" },
    greeting:{ fontSize:"var(--sp-text-3xl)", fontWeight:800, color:"var(--sp-text)", margin:"0 0 4px", letterSpacing:"-0.02em" },
    date:{ fontSize:"var(--sp-text-lg)", color:"var(--sp-textMuted)", margin:0, textTransform:"capitalize" },
    genBtn:{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"10px 18px", background:"var(--sp-accent)", color:"var(--sp-accentText)", borderRadius:"10px", fontSize:"var(--sp-text-base)", fontWeight:600, textDecoration:"none" },
    statsRow:{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px", marginBottom:"1.75rem" },
    statCard:{ background:"var(--sp-card)", border:"1px solid var(--sp-cardBorder)", borderRadius:"12px", padding:"16px 18px", display:"flex", flexDirection:"column", gap:"4px" },
    statLabel:{ fontSize:"var(--sp-text-xs)", fontWeight:600, color:"var(--sp-textMuted)", textTransform:"uppercase", letterSpacing:"0.05em" },
    statVal:{ fontSize:"var(--sp-text-3xl)", fontWeight:800, letterSpacing:"-0.02em", color:"var(--sp-text)" },
    grid2:{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap:"12px", alignItems:"start" },
    card:{ background:"var(--sp-card)", border:"1px solid var(--sp-cardBorder)", borderRadius:"14px", padding:"1.25rem 1.5rem", marginBottom:"12px" },
    cardHead:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" },
    cardTitle:{ fontSize:"var(--sp-text-lg)", fontWeight:700, color:"var(--sp-text)", margin:0 },
    cardLink:{ fontSize:"var(--sp-text-sm)", color:"var(--sp-accent)", fontWeight:600, textDecoration:"none" },

    tabs:{ display:"flex", gap:"6px", marginBottom:"14px" },
    tab:{ padding:"6px 14px", borderRadius:"20px", fontSize:"var(--sp-text-sm)", fontWeight:600, border:"none", cursor:"pointer", transition:"all 0.15s" },
    tabSubLabel:{ fontSize:"var(--sp-text-sm)", color:"var(--sp-textMuted)", fontWeight:500, marginBottom:"10px" },

    sessionList:{ display:"flex", flexDirection:"column", gap:"8px" },
    sessionRow:{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", background:"var(--sp-successBg)", border:"1px solid var(--sp-successBorder)", borderRadius:"10px" },
    sessionDot:{ width:"8px", height:"8px", borderRadius:"50%", background:"var(--sp-success)", flexShrink:0 },
    sessionTitle:{ fontSize:"var(--sp-text-base)", fontWeight:600, color:"var(--sp-text)", margin:"0 0 2px" },
    sessionTime:{ fontSize:"var(--sp-text-xs)", color:"var(--sp-textSecondary)", margin:0 },

    weekGrid:{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" },
    weekDayCard:{ borderRadius:"10px", padding:"10px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", background:"var(--sp-hoverBg)", border:"1px solid var(--sp-cardBorder)" },
    weekDayShort:{ fontSize:"var(--sp-text-xs)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" },
    weekDayCount:{ fontSize:"var(--sp-text-2xl)", fontWeight:800, letterSpacing:"-0.02em" },
    weekDayLabel:{ fontSize:"var(--sp-text-xs)", fontWeight:500 },
    weekDaySessionList:{ marginTop:"6px", width:"100%", display:"flex", flexDirection:"column", gap:"2px" },
    weekDaySession:{ fontSize:"var(--sp-text-xs)", fontWeight:500, textAlign:"center", background:"var(--sp-subtleBg)", borderRadius:"4px", padding:"1px 4px", color:"var(--sp-textSecondary)" },

    digestGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:"8px" },
    digestDay:{ borderRadius:"10px", border:"1px solid var(--sp-cardBorder)", overflow:"hidden", display:"flex", flexDirection:"column" },
    digestDayHead:{ padding:"8px 10px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"4px" },
    digestDayName:{ fontSize:"var(--sp-text-xs)", fontWeight:700, textTransform:"capitalize" },
    digestDayTotal:{ fontSize:"var(--sp-text-xs)", fontWeight:700 },
    digestDayBody:{ padding:"6px 8px 8px", display:"flex", flexDirection:"column", gap:"4px", flex:1 },
    digestEmpty:{ fontSize:"var(--sp-text-xs)", color:"var(--sp-textMuted)", textAlign:"center", padding:"8px 0" },
    digestSection:{ display:"flex", flexDirection:"column", gap:"3px" },
    digestSectionLabel:{ fontSize:"var(--sp-text-xs)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:"var(--sp-textMuted)", marginBottom:"1px" },
    digestItem:{ display:"flex", justifyContent:"space-between", alignItems:"center", borderRadius:"5px", padding:"3px 5px", fontSize:"var(--sp-text-xs)", fontWeight:500 },

    emptyDay:{ textAlign:"center", padding:"1.5rem" },
    emptyText:{ fontSize:"var(--sp-text-lg)", color:"var(--sp-textMuted)", marginBottom:"12px" },
    miniBtn:{ display:"inline-flex", padding:"8px 16px", background:"var(--sp-accentLight)", color:"var(--sp-accent)", borderRadius:"8px", fontSize:"var(--sp-text-base)", fontWeight:600, textDecoration:"none" },

    currentBanner:{ display:"flex", alignItems:"flex-start", gap:"12px", background:"var(--sp-successBg)", border:"1px solid var(--sp-successBorder)", borderRadius:"10px", padding:"12px 14px", marginBottom:"1rem" },
    currentDot:{ width:"10px", height:"10px", borderRadius:"50%", background:"var(--sp-success)", flexShrink:0, marginTop:"4px" },
    currentLabel:{ fontSize:"var(--sp-text-xs)", fontWeight:700, color:"var(--sp-success)", textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 2px" },
    currentTitle:{ fontSize:"var(--sp-text-lg)", fontWeight:700, color:"var(--sp-text)", margin:"0 0 2px" },
    currentTime:{ fontSize:"var(--sp-text-sm)", color:"var(--sp-textSecondary)", margin:0 },

    rightCol:{ display:"flex", flexDirection:"column" },
    nextItem:{ display:"flex", alignItems:"center", gap:"12px", background:"var(--sp-hoverBg)", borderRadius:"10px", padding:"12px 14px", marginTop:"8px" },
    nextDot:{ width:"10px", height:"10px", borderRadius:"50%", flexShrink:0 },
    nextTitle:{ fontSize:"var(--sp-text-lg)", fontWeight:600, color:"var(--sp-text)", margin:"0 0 2px" },
    nextTime:{ fontSize:"var(--sp-text-sm)", color:"var(--sp-textSecondary)", margin:0 },

    actions:{ display:"flex", flexDirection:"column", gap:"6px", marginTop:"8px" },
    actionBtn:{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:"var(--sp-hoverBg)", border:"1px solid var(--sp-cardBorder)", borderRadius:"10px", textDecoration:"none" },
    actionIcon:{ fontSize:"var(--sp-text-xl)", flexShrink:0 },
    actionLabel:{ flex:1, fontSize:"var(--sp-text-base)", fontWeight:500, color:"var(--sp-text)" },

    weekMini:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"4px" },
    weekDay:{ borderRadius:"8px", padding:"8px 4px", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", background:"var(--sp-hoverBg)", border:"1px solid var(--sp-cardBorder)" },
    weekShort:{ fontSize:"var(--sp-text-xs)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" },
    weekCount:{ fontSize:"var(--sp-text-lg)", fontWeight:800 },
    weekDetailBtn:{ marginTop:"10px", width:"100%", padding:"7px", background:"var(--sp-accentLight)", color:"var(--sp-accent)", border:"none", borderRadius:"8px", fontSize:"var(--sp-text-sm)", fontWeight:600, cursor:"pointer" },
};
