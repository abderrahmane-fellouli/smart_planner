import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Pages/AppLayout";
import { useTheme } from "@/Pages/AppLayout";
import { useState } from "react";

const T = {
  fr: {
    export: {
      title: "Exporter le planning",
      subtitle: "Téléchargez votre planning en PDF ou CSV",
      emptyTitle: "Aucun planning disponible",
      emptySub: "Générez d'abord un planning depuis la page \"Mon planning\"",
      emptyBtn: "Aller à Mon planning →",
      step1_title: "Sélectionner le planning",
      step1_sub: "Choisissez le planning à exporter",
      planningIntensif: "Intensif",
      planningEquilibre: "Équilibré",
      planningLeger: "Léger",
      activeBadge: "Actif",
      generatedFor: "Généré le {date}",
      previewTitle: "Aperçu",
      perWeek: "/ semaine",
      sessions: "sessions",
      avgPerDay: "moy/jour",
      exportPdf: "Exporter en PDF",
      pdfOpening: "Ouverture...",
      pdfDesc: "S'ouvre dans un nouvel onglet · Imprimable avec Ctrl+P",
      infoText: "Le PDF s'ouvre dans un nouvel onglet. Utilisez Ctrl+P ou le bouton « Imprimer » pour sauvegarder en PDF.",
      exportCsv: "Exporter en CSV",
      csvOpening: "Téléchargement...",
      csvDesc: "Télécharge le fichier CSV · Ouvre-le dans Excel ou Google Sheets",
    },
  },
  en: {
    export: {
      title: "Export Schedule",
      subtitle: "Download your schedule as PDF or CSV",
      emptyTitle: "No schedule available",
      emptySub: "First generate a schedule from the \"My Schedule\" page",
      emptyBtn: "Go to My Schedule →",
      step1_title: "Select schedule",
      step1_sub: "Choose the schedule to export",
      planningIntensif: "Intensive",
      planningEquilibre: "Balanced",
      planningLeger: "Light",
      activeBadge: "Active",
      generatedFor: "Generated on {date}",
      previewTitle: "Preview",
      perWeek: "/ week",
      sessions: "sessions",
      avgPerDay: "avg/day",
      exportPdf: "Export as PDF",
      pdfOpening: "Opening...",
      pdfDesc: "Opens in new tab · Printable with Ctrl+P",
      infoText: "The PDF opens in a new tab. Use Ctrl+P or the Print button to save as PDF.",
      exportCsv: "Export as CSV",
      csvOpening: "Downloading...",
      csvDesc: "Downloads an Excel/Google Sheets compatible CSV file",
    },
  },
  ar: {
    export: {
      title: "تصدير الجدول",
      subtitle: "قم بتنزيل جدولك بصيغة PDF أو CSV",
      emptyTitle: "لا يوجد جدول متاح",
      emptySub: "قم أولاً بإنشاء جدول من صفحة \"جدولي\"",
      emptyBtn: "الذهاب إلى جدولي →",
      step1_title: "تحديد الجدول",
      step1_sub: "اختر الجدول الذي تريد تصديره",
      planningIntensif: "مكثف",
      planningEquilibre: "متوازن",
      planningLeger: "خفيف",
      activeBadge: "نشط",
      generatedFor: "تم الإنشاء في {date}",
      previewTitle: "معاينة",
      perWeek: "/ أسبوع",
      sessions: "جلسات",
      avgPerDay: "معدل/يوم",
      exportPdf: "تصدير بصيغة PDF",
      pdfOpening: "جاري الفتح...",
      pdfDesc: "يفتح في علامة تبويب جديدة · قابل للطباعة بـ Ctrl+P",
      infoText: "يفتح PDF في علامة تبويب جديدة. استخدم Ctrl+P أو زر الطباعة للحفظ بصيغة PDF.",
      exportCsv: "تصدير بصيغة CSV",
      csvOpening: "جاري التنزيل...",
      csvDesc: "تنزيل ملف CSV متوافق مع Excel أو جداول بيانات Google",
    },
  },
};

export default function ExportIndex({ activeSchedule, allSchedules, fixedEvents, user }) {
  const { dark } = useTheme();
  let lang = "fr";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("smartplanner_lang") || "fr";
  }
  const tr = T[lang]?.export || T.fr.export;
  const isRTL = lang === "ar";

  const [selectedId, setSelectedId] = useState(activeSchedule?.id ?? "");
  const [loading, setLoading] = useState(null);

  const typeConfig = {
    intensif:  { label: tr.planningIntensif,   color: "var(--sp-type-intensif-fg)", bg: "var(--sp-type-intensif)", icon: "🔥" },
    equilibre: { label: tr.planningEquilibre,  color: "var(--sp-type-equilibre-fg)", bg: "var(--sp-type-equilibre)", icon: "⚖️" },
    leger:     { label: tr.planningLeger,      color: "var(--sp-type-leger-fg)", bg: "var(--sp-type-leger)", icon: "🍃" },
  };

  const handleExportPdf = () => {
    setLoading("pdf");
    const params = `?lang=${lang}${selectedId ? `&schedule_id=${selectedId}` : ""}`;
    window.open(`/export/pdf${params}`, "_blank");
    setTimeout(() => setLoading(null), 1500);
  };

  const handleExportCsv = () => {
    setLoading("csv");
    const params = `?lang=${lang}${selectedId ? `&schedule_id=${selectedId}` : ""}`;
    const a = document.createElement("a");
    a.href = `/export/csv${params}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => setLoading(null), 1500);
  };

  const selectedSchedule = allSchedules?.find(s => s.id == selectedId) ?? activeSchedule;
  const resume = selectedSchedule?.schedule?.resume ?? null;
  const cfg = selectedSchedule ? (typeConfig[selectedSchedule.type] ?? typeConfig.equilibre) : null;

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={s.page}>

        {/* Header */}
        <div style={{ textAlign: "start" }}>
          <h1 style={s.title}>{tr.title}</h1>
          <p style={s.subtitle}>{tr.subtitle}</p>
        </div>

        {allSchedules?.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <p style={s.emptyTitle}>{tr.emptyTitle}</p>
            <p style={s.emptySub}>{tr.emptySub}</p>
            <Link href="/schedules" style={s.emptyBtn}>{tr.emptyBtn}</Link>
          </div>
        ) : (
          <div style={s.content}>

            {/* Schedule selection */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>{tr.step1_title}</h2>
              <p style={s.cardSub}>{tr.step1_sub}</p>
              <div style={s.selectList}>
                {allSchedules?.map(plan => {
                  const c = typeConfig[plan.type] ?? typeConfig.equilibre;
                  const isSelected = plan.id == selectedId;
                  return (
                    <div
                      key={plan.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(plan.id)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(plan.id); } }}
                      style={{
                        ...s.selectItem,
                        border: isSelected ? `2px solid ${c.color}` : "2px solid var(--sp-cardBorder)",
                        background: isSelected ? c.bg : "var(--sp-subtleBg)",
                      }}
                    >
                      <span style={s.selectIcon}>{c.icon}</span>
                      <div style={{ ...s.selectInfo, textAlign: "start" }}>
                        <span style={{ ...s.selectLabel, color: isSelected ? c.color : "var(--sp-textSecondary)" }}>
                          {c.label}
                          {plan.is_active && (
                            <span style={{ ...s.activeBadge, background: c.color }}>{tr.activeBadge}</span>
                          )}
                        </span>
                        <span style={s.selectDate}>
                          {tr.generatedFor.replace("{date}", plan.generated_for ?? "")}
                        </span>
                      </div>
                      {isSelected && (
                        <svg width="18" height="18" fill="none" stroke={c.color} strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview + Export */}
            {selectedSchedule && resume && (
              <>
                <div style={s.card}>
                  <h2 style={s.cardTitle}>{tr.previewTitle}</h2>
                  <div style={s.previewRow}>
                    <div style={s.previewStat}>
                      <span style={s.previewVal}>{resume.total_heures_semaine}h</span>
                      <span style={s.previewKey}>{tr.perWeek}</span>
                    </div>
                    <div style={{ ...s.previewStat, borderInlineStart: "1px solid var(--sp-cardBorder)" }}>
                      <span style={s.previewVal}>{resume.sessions_totales}</span>
                      <span style={s.previewKey}>{tr.sessions}</span>
                    </div>
                    <div style={{ ...s.previewStat, borderInlineStart: "1px solid var(--sp-cardBorder)" }}>
                      <span style={s.previewVal}>{resume.moyenne_par_jour}h</span>
                      <span style={s.previewKey}>{tr.avgPerDay}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleExportPdf}
                  disabled={!selectedId && !activeSchedule}
                  data-tutorial-target="export-btn"
                  style={{
                    ...s.exportBtn,
                    opacity: (!selectedId && !activeSchedule) ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = "var(--sp-accentHover)"; e.currentTarget.style.borderColor = "var(--sp-accentHover)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--sp-subtleBg)"; e.currentTarget.style.borderColor = "var(--sp-cardBorder)"; }}
                >
                  <div style={{ ...s.exportBtnIcon, background: "var(--sp-errorBg)" }}>
                    <svg width="28" height="28" fill="none" stroke="var(--sp-error)" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4"/>
                    </svg>
                  </div>
                  <div style={{ ...s.exportBtnInfo, textAlign: "start" }}>
                    <span style={s.exportBtnTitle}>
                      {loading === "pdf" ? tr.pdfOpening : tr.exportPdf}
                    </span>
                    <span style={s.exportBtnDesc}>{tr.pdfDesc}</span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="var(--sp-textMuted)" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  onClick={handleExportCsv}
                  disabled={!selectedId && !activeSchedule}
                  style={{
                    ...s.exportBtn,
                    opacity: (!selectedId && !activeSchedule) ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = "var(--sp-subtleBg)"; e.currentTarget.style.borderColor = "var(--sp-accent)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--sp-subtleBg)"; e.currentTarget.style.borderColor = "var(--sp-cardBorder)"; }}
                >
                  <div style={{ ...s.exportBtnIcon, background: "var(--sp-successBg)" }}>
                    <svg width="28" height="28" fill="none" stroke="var(--sp-success)" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
                    </svg>
                  </div>
                  <div style={{ ...s.exportBtnInfo, textAlign: "start" }}>
                    <span style={s.exportBtnTitle}>
                      {loading === "csv" ? tr.csvOpening : tr.exportCsv}
                    </span>
                    <span style={s.exportBtnDesc}>{tr.csvDesc}</span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="var(--sp-textMuted)" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <div style={s.infoBox}>
                  <svg width="16" height="16" fill="none" stroke="var(--sp-accent)" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
                  </svg>
                  <div style={{ fontSize: "var(--sp-text-sm)", color: "var(--sp-accent)", textAlign: "start" }}>
                    {tr.infoText}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

const s = {
  page: { maxWidth: "640px", margin: "0 auto", padding: "32px 24px 60px", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" },
  title: { fontSize: "var(--sp-text-2xl)", fontWeight: 700, color: "var(--sp-text)", margin: "0 0 4px" },
  subtitle: { fontSize: "var(--sp-text-lg)", color: "var(--sp-textSecondary)", margin: "0 0 28px" },
  content: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { background: "var(--sp-card)", border: "1px solid var(--sp-cardBorder)", borderRadius: "14px", padding: "20px 22px" },
  cardTitle: { fontSize: "var(--sp-text-lg)", fontWeight: 700, color: "var(--sp-text)", margin: "0 0 4px" },
  cardSub: { fontSize: "var(--sp-text-sm)", color: "var(--sp-textMuted)", margin: "0 0 14px" },
  selectList: { display: "flex", flexDirection: "column", gap: "8px" },
  selectItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "10px", cursor: "pointer", transition: "all 0.12s" },
  selectIcon: { fontSize: "var(--sp-text-2xl)", flexShrink: 0 },
  selectInfo: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" },
  selectLabel: { fontSize: "var(--sp-text-base)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" },
  selectDate: { fontSize: "var(--sp-text-xs)", color: "var(--sp-textMuted)" },
  activeBadge: { fontSize: "var(--sp-text-xs)", color: "#fff", padding: "1px 7px", borderRadius: "20px", fontWeight: 700 },
  previewRow: { display: "flex", marginTop: "12px", borderTop: "1px solid var(--sp-cardBorder)", paddingTop: "12px" },
  previewStat: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0" },
  previewVal: { fontSize: "var(--sp-text-xl)", fontWeight: 800, color: "var(--sp-text)" },
  previewKey: { fontSize: "var(--sp-text-xs)", color: "var(--sp-textMuted)" },
  exportBtn: { display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", background: "var(--sp-subtleBg)", border: "1px solid var(--sp-cardBorder)", borderRadius: "12px", cursor: "pointer", textAlign: "start", width: "100%", transition: "all 0.12s" },
  exportBtnIcon: { width: "52px", height: "52px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  exportBtnInfo: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" },
  exportBtnTitle: { fontSize: "var(--sp-text-lg)", fontWeight: 600, color: "var(--sp-text)" },
  exportBtnDesc: { fontSize: "var(--sp-text-xs)", color: "var(--sp-textMuted)" },
  infoBox: { display: "flex", gap: "10px", alignItems: "flex-start", background: "var(--sp-accentLight)", border: "1px solid var(--sp-accent)", borderRadius: "10px", padding: "12px 14px" },
  empty: { background: "var(--sp-card)", border: "1px solid var(--sp-cardBorder)", borderRadius: "16px", padding: "60px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  emptyIcon: { fontSize: "48px" },
  emptyTitle: { fontSize: "var(--sp-text-xl)", fontWeight: 600, color: "var(--sp-text)", margin: 0 },
  emptySub: { fontSize: "var(--sp-text-base)", color: "var(--sp-textMuted)", margin: 0 },
  emptyBtn: { display: "inline-flex", padding: "10px 20px", background: "var(--sp-accent)", color: "var(--sp-accentText)", borderRadius: "8px", fontSize: "var(--sp-text-base)", fontWeight: 600, textDecoration: "none", marginTop: "4px" },
};
