import { Head, Link } from "@inertiajs/react";
import AppLayout from "./AppLayout";
import { useTheme } from "./AppLayout";

// Translation object – add to your existing T or keep here
const T = {
  fr: {
    statistics: {
      title: "Statistiques",
      subtitle: "Analyse de votre planning d'étude",
      planningBadge: "Planning {type} actif",
      hoursPerWeek: "Heures / semaine",
      totalSessions: "Sessions totales",
      avgPerDay: "Moy. par jour",
      fixedCourses: "Cours fixes",
      bestDay: "Meilleur jour",
      hoursPerDayTitle: "Heures d'étude par jour",
      hoursPerDaySub: "Distribution hebdomadaire des sessions",
      compareTitle: "Comparaison des plannings",
      compareSub: "Vos 3 types de planning générés",
      subjectsTitle: "Matières étudiées",
      subjectsSub: "Répartition du temps par matière",
      dayDetailTitle: "Détail par jour",
      dayDetailSub: "Cours fixes + sessions d'étude",
      typeIntensif: "Intensif",
      typeEquilibre: "Équilibré",
      typeLeger: "Léger",
      activeBadge: "Actif",
      sessionsPerWeek: "sessions / semaine",
      noSubjects: "Aucune session d'étude trouvée",
      courseCount: "cours",
      sessionCount: "sessions",
      studyHoursAbbr: "étude",
      hourUnit: "h",
      sessionAbbr: "sess.",
      emptyTitle: "Aucune statistique disponible",
      emptySub: "Générez d'abord un planning pour voir vos statistiques",
      generateBtn: "Générer un planning →",
      days: {
        monday: "Lundi",
        tuesday: "Mardi",
        wednesday: "Mercredi",
        thursday: "Jeudi",
        friday: "Vendredi",
        saturday: "Samedi",
      },
    },
  },
  en: {
    statistics: {
      title: "Statistics",
      subtitle: "Analyze your study schedule",
      planningBadge: "{type} schedule (active)",
      hoursPerWeek: "Hours / week",
      totalSessions: "Total sessions",
      avgPerDay: "Avg per day",
      fixedCourses: "Fixed courses",
      bestDay: "Best day",
      hoursPerDayTitle: "Study hours per day",
      hoursPerDaySub: "Weekly session distribution",
      compareTitle: "Schedule comparison",
      compareSub: "Your 3 generated plan types",
      subjectsTitle: "Subjects studied",
      subjectsSub: "Time distribution by subject",
      dayDetailTitle: "Daily breakdown",
      dayDetailSub: "Fixed courses + study sessions",
      typeIntensif: "Intensive",
      typeEquilibre: "Balanced",
      typeLeger: "Light",
      activeBadge: "Active",
      sessionsPerWeek: "sessions / week",
      noSubjects: "No study sessions found",
      courseCount: "courses",
      sessionCount: "sessions",
      studyHoursAbbr: "study",
      hourUnit: "h",
      sessionAbbr: "sess.",
      emptyTitle: "No statistics available",
      emptySub: "Generate a schedule first to see your stats",
      generateBtn: "Generate schedule →",
      days: {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
      },
    },
  },
  ar: {
    statistics: {
      title: "الإحصائيات",
      subtitle: "تحليل جدول دراستك",
      planningBadge: "جدول {type} (نشط)",
      hoursPerWeek: "ساعات / أسبوع",
      totalSessions: "إجمالي الجلسات",
      avgPerDay: "المتوسط يومياً",
      fixedCourses: "الدروس الثابتة",
      bestDay: "أفضل يوم",
      hoursPerDayTitle: "ساعات الدراسة في اليوم",
      hoursPerDaySub: "توزيع الجلسات الأسبوعية",
      compareTitle: "مقارنة الجداول",
      compareSub: "أنواع الجداول الثلاثة المُنشأة",
      subjectsTitle: "المواد المدروسة",
      subjectsSub: "توزيع الوقت حسب المادة",
      dayDetailTitle: "تفاصيل اليوم",
      dayDetailSub: "الدروس الثابتة + جلسات الدراسة",
      typeIntensif: "مكثف",
      typeEquilibre: "متوازن",
      typeLeger: "خفيف",
      activeBadge: "نشط",
      sessionsPerWeek: "جلسة / أسبوع",
      noSubjects: "لم يتم العثور على جلسات دراسة",
      courseCount: "دروس",
      sessionCount: "جلسات",
      studyHoursAbbr: "دراسة",
      hourUnit: "س",
      sessionAbbr: "جلسة",
      emptyTitle: "لا توجد إحصائيات متاحة",
      emptySub: "قم بإنشاء جدول أولاً لمشاهدة إحصائياتك",
      generateBtn: "إنشاء جدول →",
      days: {
        monday: "الاثنين",
        tuesday: "الثلاثاء",
        wednesday: "الأربعاء",
        thursday: "الخميس",
        friday: "الجمعة",
        saturday: "السبت",
      },
    },
  },
};

export default function Statistics({ schedules = [], fixedEvents = [], user }) {
  const { dark } = useTheme();
  // Get language from localStorage (same as your Dashboard)
  let lang = "fr";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("smartplanner_lang") || "fr";
  }
  const tr = T[lang]?.statistics || T.fr.statistics;
  const isRTL = lang === "ar";

  // Days array using translation
  const jours = [
    tr.days.monday,
    tr.days.tuesday,
    tr.days.wednesday,
    tr.days.thursday,
    tr.days.friday,
    tr.days.saturday,
  ];

  const activeSchedule = schedules.find((s) => s.is_active) ?? schedules[0];
  const details = activeSchedule?.schedule?.details ?? {};
  const resume = activeSchedule?.schedule?.resume ?? {};

  // Hours per day
 const hoursPerDay = jours.map((jour, idx) => {
    const dayKey = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][idx];
    const dayDetails = details[dayKey] ?? {};
    return {
        day: jour.slice(0, 3),
        hours: dayDetails.total_heures_etude ?? 0,
        sessions: (dayDetails.sessions_etude ?? []).length,
        cours: (dayDetails.cours_fixes ?? []).length,
    };
});

  const maxHours = Math.max(...hoursPerDay.map((d) => d.hours), 1);
  const bestDay = hoursPerDay.reduce((a, b) => (a.hours > b.hours ? a : b), hoursPerDay[0]);

  const typeStats = schedules.map((s) => ({
    type: s.type,
    hours: s.schedule?.resume?.total_heures_semaine ?? 0,
    sessions: s.schedule?.resume?.sessions_totales ?? 0,
    active: s.is_active,
  }));

  const subjectMap = {};
  jours.forEach((_, idx) => {
    const dayKey =["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][idx];
    (details[dayKey]?.sessions_etude ?? []).forEach((sess) => {
      const raw = sess.matiere ?? "";
      const name = raw.replace(/^[🎯📖📚]\s*[^:]*:\s*/, "").trim();
      subjectMap[name] = (subjectMap[name] ?? 0) + (sess.duree ?? 60);
    });
  });
  const subjects = Object.entries(subjectMap)
    .map(([name, minutes]) => ({ name, hours: Math.round((minutes / 60) * 10) / 10 }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);
  const totalSubjectHours = subjects.reduce((s, x) => s + x.hours, 0) || 1;

  const typeConfig = {
    intensif: { label: tr.typeIntensif, color: "var(--sp-type-intensif-fg)", bg: "var(--sp-type-intensif)", icon: "🔥" },
    equilibre: { label: tr.typeEquilibre, color: "var(--sp-type-equilibre-fg)", bg: "var(--sp-type-equilibre)", icon: "⚖️" },
    leger: { label: tr.typeLeger, color: "var(--sp-type-leger-fg)", bg: "var(--sp-type-leger)", icon: "🍃" },
  };

  const dayColors = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

  if (schedules.length === 0) {
    return (
      <AppLayout>
        <Head title={tr.title} />
        <div style={s.page}>
          <div style={s.empty}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <h2 style={s.emptyTitle}>{tr.emptyTitle}</h2>
            <p style={s.emptySub}>{tr.emptySub}</p>
            <Link href="/schedules" style={s.emptyBtn}>{tr.generateBtn}</Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const activeTypeLabel = typeConfig[activeSchedule?.type]?.label ?? activeSchedule?.type;

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={s.page}>
        <div style={s.header}>
          <div style={{ textAlign: "start" }}>
            <h1 style={s.title}>{tr.title}</h1>
            <p style={s.subtitle}>{tr.subtitle}</p>
          </div>
          <div style={s.planningBadge}>
            {tr.planningBadge.replace("{type}", activeTypeLabel)}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={s.kpiRow} className="sp-kpi-row" data-tutorial-target="stats-kpi">
          {[
            { label: tr.hoursPerWeek, value: `${resume.total_heures_semaine ?? 0}${tr.hourUnit}`, icon: "⏱️", color: "var(--sp-accent)", bg: "var(--sp-accentLight)" },
            { label: tr.totalSessions, value: resume.sessions_totales ?? 0, icon: "📚", color: "var(--sp-type-equilibre-fg)", bg: "var(--sp-type-equilibre)" },
            { label: tr.avgPerDay, value: `${resume.moyenne_par_jour ?? 0}${tr.hourUnit}`, icon: "📅", color: "var(--sp-type-leger-fg)", bg: "var(--sp-type-leger)" },
            { label: tr.fixedCourses, value: fixedEvents.length, icon: "🎓", color: "var(--sp-type-intensif-fg)", bg: "var(--sp-type-intensif)" },
            { label: tr.bestDay, value: bestDay?.day ?? "-", icon: "🏆", color: "var(--sp-day-vendredi-fg)", bg: "var(--sp-day-vendredi)" },
          ].map((kpi, i) => (
            <div key={i} style={{ ...s.kpiCard, borderTop: `3px solid ${kpi.color}` }}>
              <div style={{ ...s.kpiIcon, background: kpi.bg }}>{kpi.icon}</div>
              <div style={{ ...s.kpiValue, color: kpi.color }}>{kpi.value}</div>
              <div style={s.kpiLabel}>{kpi.label}</div>
            </div>
          ))}
        </div>

        <div style={s.grid2} className="sp-grid-2col">
          {/* Bar Chart */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>{tr.hoursPerDayTitle}</h2>
            <p style={s.cardSub}>{tr.hoursPerDaySub}</p>
            <div style={s.barChart}>
              {hoursPerDay.map((d, i) => (
                <div key={i} style={s.barCol}>
                  <div style={s.barWrap}>
                      <div style={s.barBg}>
                      <div style={{ ...s.barFill, height: `${(d.hours / maxHours) * 100}%`, background: dayColors[i] }} />
                    </div>
                    <span style={s.barVal}>{d.hours}{tr.hourUnit}</span>
                  </div>
                  <span style={s.barLabel}>{d.day}</span>
                  <span style={s.barSessions}>{d.sessions} {tr.sessionAbbr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Planning comparison */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>{tr.compareTitle}</h2>
            <p style={s.cardSub}>{tr.compareSub}</p>
            <div style={s.compareList}>
              {typeStats.map((t, i) => {
                const cfg = typeConfig[t.type] ?? typeConfig.equilibre;
                const maxH = Math.max(...typeStats.map((x) => x.hours), 1);
                return (
                  <div key={i} style={s.compareItem}>
                    <div style={s.compareHeader}>
                      <span style={s.compareIcon}>{cfg.icon}</span>
                      <span style={{ ...s.compareLabel, color: cfg.color }}>
                        {cfg.label}
                        {t.active && <span style={{ ...s.activePill, background: cfg.color }}>{tr.activeBadge}</span>}
                      </span>
                      <span style={s.compareVal}>{t.hours}{tr.hourUnit}</span>
                    </div>
                    <div style={s.progressBg}>
                      <div style={{ ...s.progressFill, width: `${(t.hours / maxH) * 100}%`, background: cfg.color }} />
                    </div>
                    <div style={s.compareSub}>{t.sessions} {tr.sessionsPerWeek}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subjects */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>{tr.subjectsTitle}</h2>
            <p style={s.cardSub}>{tr.subjectsSub}</p>
            {subjects.length === 0 ? (
              <p style={{ color: "var(--sp-textMuted)", fontSize: "var(--sp-text-base)" }}>{tr.noSubjects}</p>
            ) : (
              <div style={s.subjectList}>
                {subjects.map((sub, i) => (
                  <div key={i} style={s.subjectItem}>
                    <div style={s.subjectHeader}>
                      <span style={s.subjectDot(dayColors[i % dayColors.length])} />
                        <span style={s.subjectName}>{sub.name}</span>
                        <span style={s.subjectHours}>{sub.hours}{tr.hourUnit}</span>
                    </div>
                    <div style={s.progressBg}>
                      <div style={{ ...s.progressFill, width: `${(sub.hours / totalSubjectHours) * 100}%`, background: dayColors[i % dayColors.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Day detail */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>{tr.dayDetailTitle}</h2>
            <p style={s.cardSub}>{tr.dayDetailSub}</p>
            <div style={s.dayDetailList}>
              {hoursPerDay.map((d, i) => (
                <div key={i} style={s.dayDetailRow}>
                  <div style={{ ...s.dayBadge, background: dayColors[i] + "20", color: dayColors[i] }}>{d.day}</div>
                  <div style={s.dayDetailBar}>
                    <div style={s.dayMiniStats}>
                      <span style={s.dayMiniStat}>📘 {d.cours} {tr.courseCount}</span>
                      <span style={s.dayMiniStat}>📚 {d.sessions} {tr.sessionCount}</span>
                      <span style={{ ...s.dayMiniStat, fontWeight: 700 }}>{d.hours}{tr.hourUnit} {tr.studyHoursAbbr}</span>
                    </div>
                    <div style={s.progressBg}>
                      <div style={{ ...s.progressFill, width: `${(d.hours / maxHours) * 100}%`, background: dayColors[i] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Styles
const s = {
  page: { maxWidth: "1040px", margin: "0 auto", padding: "32px 24px 60px", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "var(--sp-text-2xl)", fontWeight: 700, color: "var(--sp-text)", margin: "0 0 4px" },
  subtitle: { fontSize: "var(--sp-text-lg)", color: "var(--sp-textSecondary)", margin: 0 },
  planningBadge: { background: "var(--sp-accentLight)", color: "var(--sp-accent)", padding: "8px 16px", borderRadius: "20px", fontSize: "var(--sp-text-base)", fontWeight: 600 },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" },
  kpiCard: { background: "var(--sp-card)", border: "1px solid var(--sp-cardBorder)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" },
  kpiIcon: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--sp-text-xl)" },
  kpiValue: { fontSize: "var(--sp-text-2xl)", fontWeight: 800, letterSpacing: "-0.02em" },
  kpiLabel: { fontSize: "var(--sp-text-xs)", color: "var(--sp-textMuted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(440px, 100%), 1fr))", gap: "12px" },
  card: { background: "var(--sp-card)", border: "1px solid var(--sp-cardBorder)", borderRadius: "14px", padding: "22px 24px" },
  cardTitle: { fontSize: "var(--sp-text-lg)", fontWeight: 700, color: "var(--sp-text)", margin: "0 0 4px" },
  cardSub: { fontSize: "var(--sp-text-sm)", color: "var(--sp-textMuted)", margin: "0 0 20px" },
  barChart: { display: "flex", alignItems: "flex-end", gap: "12px", height: "160px", paddingBottom: "32px", position: "relative" },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" },
  barWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: "100%", gap: "4px" },
  barBg: { width: "100%", maxWidth: "36px", height: "120px", background: "var(--sp-subtleBg)", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "flex-end" },
  barFill: { width: "100%", borderRadius: "6px 6px 0 0", transition: "height 0.6s ease", minHeight: "4px" },
  barVal: { fontSize: "var(--sp-text-xs)", fontWeight: 700, color: "var(--sp-text)" },
  barLabel: { fontSize: "var(--sp-text-xs)", fontWeight: 700, color: "var(--sp-textSecondary)" },
  barSessions: { fontSize: "var(--sp-text-xs)", color: "var(--sp-textMuted)" },
  compareList: { display: "flex", flexDirection: "column", gap: "16px" },
  compareItem: { display: "flex", flexDirection: "column", gap: "6px" },
  compareHeader: { display: "flex", alignItems: "center", gap: "8px" },
  compareIcon: { fontSize: "var(--sp-text-xl)" },
  compareLabel: { flex: 1, minWidth: 0, fontSize: "var(--sp-text-base)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" },
  compareVal: { fontSize: "var(--sp-text-base)", fontWeight: 700, color: "var(--sp-text)" },
  compareSub: { fontSize: "var(--sp-text-xs)", color: "var(--sp-textMuted)" },
  activePill: { fontSize: "var(--sp-text-xs)", color: "var(--sp-accentText)", padding: "1px 7px", borderRadius: "20px", fontWeight: 700 },
  progressBg: { height: "8px", background: "var(--sp-subtleBg)", borderRadius: "20px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "20px", transition: "width 0.8s ease" },
  subjectList: { display: "flex", flexDirection: "column", gap: "12px" },
  subjectItem: { display: "flex", flexDirection: "column", gap: "6px" },
  subjectHeader: { display: "flex", alignItems: "center", gap: "8px" },
  subjectDot: (color) => ({ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }),
  subjectName: { flex: 1, minWidth: 0, fontSize: "var(--sp-text-base)", fontWeight: 500, color: "var(--sp-text)" },
  subjectHours: { fontSize: "var(--sp-text-sm)", fontWeight: 700, color: "var(--sp-text)" },
  dayDetailList: { display: "flex", flexDirection: "column", gap: "12px" },
  dayDetailRow: { display: "flex", alignItems: "center", gap: "12px" },
  dayBadge: { minWidth: "36px", padding: "0 6px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--sp-text-xs)", fontWeight: 700, flexShrink: 0 },
  dayDetailBar: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  dayMiniStats: { display: "flex", gap: "10px", flexWrap: "wrap", rowGap: "4px" },
  dayMiniStat: { fontSize: "var(--sp-text-xs)", color: "var(--sp-textSecondary)" },
  empty: { background: "var(--sp-card)", border: "1px solid var(--sp-cardBorder)", borderRadius: "16px", padding: "60px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" },
  emptyTitle: { fontSize: "var(--sp-text-xl)", fontWeight: 700, color: "var(--sp-text)", margin: "0 0 8px" },
  emptySub: { fontSize: "var(--sp-text-base)", color: "var(--sp-textMuted)", margin: "0 0 20px" },
  emptyBtn: { display: "inline-flex", padding: "10px 20px", background: "var(--sp-accent)", color: "var(--sp-accentText)", borderRadius: "8px", fontSize: "var(--sp-text-base)", fontWeight: 600, textDecoration: "none" },
};
