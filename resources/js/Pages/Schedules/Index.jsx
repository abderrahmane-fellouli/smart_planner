import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';

const T = {
  fr: {
    schedules: {
      title: "Mes plannings d'étude",
      subtitle: "Générez et activez votre planning personnalisé par IA",
      generate: "Générer les plannings",
      generating: "Génération en cours...",
      loadingTitle: "L'IA génère vos plannings...",
      loadingSub: "Analyse de vos cours et préférences en cours",
      emptyTitle: "Aucun planning généré",
      emptyText: "Ajoutez d'abord vos cours fixes, puis cliquez sur 'Générer les plannings'",
      generateNow: "Générer maintenant",
      planningLabel: "Planning {type}",
      active: "Actif",
      hoursPerWeek: "/ semaine",
      sessions: "sessions",
      avgPerDay: "/ jour moy.",
      showDetail: "Voir le détail",
      hideDetail: "Masquer le détail",
      noSession: "Jour de repos 🎉",
      activate: "Activer ce planning",
      activeLabel: "✓ Planning actif",
      delete: "Supprimer",
      deleteConfirm: "Supprimer ce planning ?",
      moveSession: "Déplacer",
      moveSessionTitle: "Déplacer la session",
      moveSessionSub: "Choisissez un nouvel horaire pour cette session",
      newStartTime: "Nouvelle heure de début",
      confirm: "Confirmer",
      cancel: "Annuler",
      moving: "Déplacement...",
      typeIntensif: "Intensif",
      typeEquilibre: "Équilibré",
      typeLeger: "Léger",
      descIntensif: "2h/session · 4 sessions/jour max",
      descEquilibre: "1h/session · 3 sessions/jour max",
      descLeger: "30min/session · 2 sessions/jour max",
      days: { monday:"Lundi", tuesday:"Mardi", wednesday:"Mercredi", thursday:"Jeudi", friday:"Vendredi", saturday:"Samedi", sunday:"Dimanche" },
    },
  },
  en: {
    schedules: {
      title: "My study schedules",
      subtitle: "Generate and activate your AI-powered personalised schedule",
      generate: "Generate schedules",
      generating: "Generating...",
      loadingTitle: "AI is generating your schedules...",
      loadingSub: "Analysing your fixed courses and preferences",
      emptyTitle: "No schedules generated",
      emptyText: "First add your fixed courses, then click 'Generate schedules'",
      generateNow: "Generate now",
      planningLabel: "{type} schedule",
      active: "Active",
      hoursPerWeek: "/ week",
      sessions: "sessions",
      avgPerDay: "/ day avg.",
      showDetail: "Show details",
      hideDetail: "Hide details",
      noSession: "Rest day 🎉",
      activate: "Activate this schedule",
      activeLabel: "✓ Schedule active",
      delete: "Delete",
      deleteConfirm: "Delete this schedule?",
      moveSession: "Move",
      moveSessionTitle: "Move session",
      moveSessionSub: "Choose a new time for this session",
      newStartTime: "New start time",
      confirm: "Confirm",
      cancel: "Cancel",
      moving: "Moving...",
      typeIntensif: "Intensive",
      typeEquilibre: "Balanced",
      typeLeger: "Light",
      descIntensif: "2h/session · 4 sessions/day max",
      descEquilibre: "1h/session · 3 sessions/day max",
      descLeger: "30min/session · 2 sessions/day max",
      days: { monday:"Monday", tuesday:"Tuesday", wednesday:"Wednesday", thursday:"Thursday", friday:"Friday", saturday:"Saturday", sunday:"Sunday" },
    },
  },
  ar: {
    schedules: {
      title: "جداول دراستي",
      subtitle: "قم بإنشاء وتفعيل جدولك الشخصي المدعوم بالذكاء الاصطناعي",
      generate: "إنشاء الجداول",
      generating: "جاري الإنشاء...",
      loadingTitle: "الذكاء الاصطناعي ينشئ جداولك...",
      loadingSub: "تحليل دروسك الثابتة وتفضيلاتك",
      emptyTitle: "لم يتم إنشاء أي جدول",
      emptyText: "أضف دروسك الثابتة أولاً، ثم انقر على 'إنشاء الجداول'",
      generateNow: "إنشاء الآن",
      planningLabel: "جدول {type}",
      active: "نشط",
      hoursPerWeek: "/ أسبوع",
      sessions: "جلسات",
      avgPerDay: "/ يوم (متوسط)",
      showDetail: "عرض التفاصيل",
      hideDetail: "إخفاء التفاصيل",
      noSession: "يوم راحة 🎉",
      activate: "تفعيل هذا الجدول",
      activeLabel: "✓ الجدول نشط",
      delete: "حذف",
      deleteConfirm: "هل تريد حذف هذا الجدول؟",
      moveSession: "نقل",
      moveSessionTitle: "نقل الجلسة",
      moveSessionSub: "اختر وقتاً جديداً لهذه الجلسة",
      newStartTime: "وقت البدء الجديد",
      confirm: "تأكيد",
      cancel: "إلغاء",
      moving: "جاري النقل...",
      typeIntensif: "مكثف",
      typeEquilibre: "متوازن",
      typeLeger: "خفيف",
      descIntensif: "ساعتان/جلسة · 4 جلسات/يوم كحد أقصى",
      descEquilibre: "ساعة/جلسة · 3 جلسات/يوم كحد أقصى",
      descLeger: "30 دقيقة/جلسة · 2 جلسات/يوم كحد أقصى",
      days: { monday:"الاثنين", tuesday:"الثلاثاء", wednesday:"الأربعاء", thursday:"الخميس", friday:"الجمعة", saturday:"السبت", sunday:"الأحد" },
    },
  },
};

export default function SchedulesIndex({ schedules, activeSchedule }) {
  let lang = "fr";
  if (typeof window !== "undefined") lang = localStorage.getItem("smartplanner_lang") || "fr";
  const tr    = T[lang]?.schedules || T.fr.schedules;
  const isRTL = lang === "ar";

  const { post, processing } = useForm();

  // FIX 1: Single state — stores the id of the ONE expanded card (null = all closed)
  const [expanded, setExpanded] = useState(null);

  // FIX 2: Move-session modal
  const [moveModal, setMoveModal] = useState(null);
  const [isMoving,  setIsMoving]  = useState(false);

  const handleGenerate = () => post('/schedules/generate');
  const handleActivate = (id) => router.post(`/schedules/activate/${id}`);
  const handleDelete   = (id) => { if (confirm(tr.deleteConfirm)) router.delete(`/schedules/${id}`); };

  const openMoveModal = (scheduleId, jour, sessionIndex, session) => {
    setMoveModal({
      scheduleId, jour, sessionIndex,
      matiere: session.matiere,
      debut:   session.debut?.slice(0, 5),
      fin:     session.fin?.slice(0, 5),
      duree:   session.duree,
      newTime: session.debut?.slice(0, 5),
    });
  };

  const handleMoveConfirm = () => {
    if (!moveModal?.newTime) return;
    setIsMoving(true);
    router.post(
      `/schedules/${moveModal.scheduleId}/move-session`,
      { jour: moveModal.jour, session_index: moveModal.sessionIndex, new_start: moveModal.newTime },
      { onFinish: () => { setIsMoving(false); setMoveModal(null); } }
    );
  };

  const typeConfig = {
    intensif:  { label: tr.typeIntensif,  color: '#EF4444', bg: '#FEF2F2', icon: '🔥', desc: tr.descIntensif  },
    equilibre: { label: tr.typeEquilibre, color: '#10B981', bg: '#ECFDF5', icon: '⚖️', desc: tr.descEquilibre },
    leger:     { label: tr.typeLeger,     color: '#3B82F6', bg: '#EFF6FF', icon: '🍃', desc: tr.descLeger     },
  };

  // French keys match what PHP stores — display labels come from translation
  const jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const jourLabels = {
    'Lundi':    tr.days.monday,
    'Mardi':    tr.days.tuesday,
    'Mercredi': tr.days.wednesday,
    'Jeudi':    tr.days.thursday,
    'Vendredi': tr.days.friday,
    'Samedi':   tr.days.saturday,
    'Dimanche': tr.days.sunday,
  };

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={{ ...s.page, direction: isRTL ? "rtl" : "ltr" }}>

        {/* Header */}
        <div style={{ ...s.header, flexDirection: isRTL ? "row-reverse" : "row" }}>
          <div style={{ textAlign: isRTL ? "right" : "left" }}>
            <h1 style={s.title}>{tr.title}</h1>
            <p style={s.subtitle}>{tr.subtitle}</p>
          </div>
          <button onClick={handleGenerate} style={s.generateBtn} disabled={processing}>
            {processing
              ? <><Spinner />{tr.generating}</>
              : <><RefreshIcon />{tr.generate}</>}
          </button>
        </div>

        {/* Loading banner */}
        {processing && (
          <div style={{ ...s.loadingBanner, flexDirection: isRTL ? "row-reverse" : "row" }}>
            <Spinner color="var(--sp-accent)" />
            <div style={{ textAlign: isRTL ? "right" : "left" }}>
              <p style={s.loadingTitle}>{tr.loadingTitle}</p>
              <p style={s.loadingSub}>{tr.loadingSub}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!schedules || schedules.length === 0) && !processing && (
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>📅</div>
            <p style={s.emptyTitle}>{tr.emptyTitle}</p>
            <p style={s.emptyText}>{tr.emptyText}</p>
            <button onClick={handleGenerate} style={s.generateBtn} disabled={processing}>{tr.generateNow}</button>
          </div>
        )}

        {/* Cards grid */}
        {schedules && schedules.length > 0 && (
          <div style={s.grid}>
            {schedules.map(plan => {
              const cfg = typeConfig[plan.type] || typeConfig.equilibre;
              const isActive   = plan.is_active;
              // FIX 1: Each card checks its own id against the single `expanded` value
              const isExpanded = expanded === plan.id;
              const details    = plan.schedule?.details || {};

              return (
                <div key={plan.id} style={{ ...s.card, ...(isActive ? { border: `2px solid ${cfg.color}` } : {}) }}>

                  {/* Top */}
                  <div style={{ ...s.cardTop, background: cfg.bg }}>
                    <div style={{ ...s.cardTopLeft, flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <span style={s.cardIcon}>{cfg.icon}</span>
                      <div>
                        <div style={{ ...s.cardLabel, color: cfg.color }}>
                          {tr.planningLabel.replace("{type}", cfg.label)}
                          {isActive && <span style={{ ...s.activeBadge, background: cfg.color }}>{tr.active}</span>}
                        </div>
                        <div style={s.cardDesc}>{cfg.desc}</div>
                      </div>
                    </div>
                  </div>

                  {/* Resume stats */}
                  {plan.schedule?.resume && (
                    <div style={s.resumeRow}>
                      <div style={s.resumeStat}>
                        <span style={s.resumeVal}>{plan.schedule.resume.total_heures_semaine}h</span>
                        <span style={s.resumeKey}>{tr.hoursPerWeek}</span>
                      </div>
                      <div style={s.resumeStat}>
                        <span style={s.resumeVal}>{plan.schedule.resume.sessions_totales}</span>
                        <span style={s.resumeKey}>{tr.sessions}</span>
                      </div>
                      <div style={s.resumeStat}>
                        <span style={s.resumeVal}>{plan.schedule.resume.moyenne_par_jour}h</span>
                        <span style={s.resumeKey}>{tr.avgPerDay}</span>
                      </div>
                    </div>
                  )}

                  {/* Expandable detail */}
                  <div style={s.cardBody}>
                    <button
                      style={{ ...s.expandBtn, flexDirection: isRTL ? "row-reverse" : "row" }}
                      // FIX 1: Toggle only this card; clicking a second card closes the first automatically
                      onClick={() => setExpanded(isExpanded ? null : plan.id)}
                    >
                      {isExpanded ? tr.hideDetail : tr.showDetail}
                      <ChevronIcon rotated={isExpanded} />
                    </button>

                    {/* FIX 1: Only renders when THIS plan.id === expanded */}
                    {isExpanded && (
                      <div style={s.dayList}>
                        {jours.map(jour => {
                          // Look up by French key — matches what PHP saved
                          const jourData = details[jour];
                          if (!jourData) return null;
                          const sessions = jourData.sessions_etude || [];
                          const cours    = jourData.cours_fixes    || [];
                          const isEmpty  = sessions.length === 0 && cours.length === 0;
                          return (
                            <div key={jour} style={s.dayRow}>
                              <div style={s.dayName}>{jourLabels[jour]}</div>
                              <div style={s.dayContent}>
                                {cours.map((c, i) => (
                                  <div key={i} style={s.coursTag}>
                                    📘 {c.title}{c.teacher ? ` · ${c.teacher}` : ''} {c.start_time?.slice(0,5)}–{c.end_time?.slice(0,5)}
                                  </div>
                                ))}
                                {isEmpty && <span style={s.noSession}>{tr.noSession}</span>}
                                {sessions.map((sess, i) => (
                                  <div key={i} style={s.sessionRow}>
                                    <div style={{ ...s.sessionTag, background: cfg.bg, color: cfg.color }}>
                                      {sess.debut?.slice(0,5)}–{sess.fin?.slice(0,5)} · {sess.matiere}
                                    </div>
                                    {/* FIX 2: Edit/move button per session */}
                                    <button
                                      style={s.moveBtn}
                                      title={tr.moveSession}
                                      aria-label={`${tr.moveSession} ${sess.matiere}`}
                                      onClick={() => openMoveModal(plan.id, jour, i, sess)}
                                    >
                                      ✏️
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ ...s.cardFooter, flexDirection: isRTL ? "row-reverse" : "row" }}>
                    {!isActive
                      ? <button onClick={() => handleActivate(plan.id)} style={{ ...s.activateBtn, background: cfg.color }}>{tr.activate}</button>
                      : <span style={{ ...s.activeLabel, color: cfg.color }}>{tr.activeLabel}</span>
                    }
                    <button onClick={() => handleDelete(plan.id)} style={s.deleteBtn}>{tr.delete}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FIX 2: Move-session modal — appears on top of everything */}
        {moveModal && (
          <div style={s.modalOverlay} onClick={() => !isMoving && setMoveModal(null)}>
            <div style={s.modalBox} onClick={e => e.stopPropagation()}>
              <h3 style={s.modalTitle}>{tr.moveSessionTitle}</h3>
              <p  style={s.modalSub}>{tr.moveSessionSub}</p>

              <div style={s.modalSessionInfo}>
                <span style={s.modalSessionName}>{moveModal.matiere}</span>
                <span style={s.modalSessionTime}>
                  {moveModal.debut} → {moveModal.fin} &nbsp;({moveModal.duree} min)
                </span>
              </div>

              <label style={s.modalLabel}>{tr.newStartTime}</label>
              <TimeInput value={moveModal.newTime} onChange={v => setMoveModal({ ...moveModal, newTime: v })} disabled={isMoving} />

              <div style={s.modalFooter}>
                <button style={s.modalCancelBtn}  onClick={() => setMoveModal(null)} disabled={isMoving}>{tr.cancel}</button>
                <button style={{ ...s.modalConfirmBtn, opacity: isMoving ? 0.7 : 1 }} onClick={handleMoveConfirm} disabled={isMoving}>
                  {isMoving ? <><Spinner size={12} />{tr.moving}</> : tr.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function TimeInput({ value, onChange, disabled }) {
  const [h, m] = (value || '09:00').split(':');
  const hours = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const baseStyle = {
    flex: 1, padding: '9px 8px',
    background: 'var(--sp-inputBg)',
    border: '1px solid var(--sp-inputBorder)',
    borderRadius: '8px', fontSize: '13px', color: 'var(--sp-text)',
    outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans',sans-serif", opacity: disabled ? 0.6 : 1,
    appearance: 'none', WebkitAppearance: 'none',
  };
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
      <select value={h} disabled={disabled} onChange={e => onChange(e.target.value + ':' + m)} style={baseStyle}>
        {hours.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span style={{ fontWeight: 700, color: 'var(--sp-textMuted)' }}>:</span>
      <select value={m} disabled={disabled} onChange={e => onChange(h + ':' + e.target.value)} style={baseStyle}>
        {minutes.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
}

function Spinner({ color = "currentColor", size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
  );
}
function ChevronIcon({ rotated }) {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      style={{ transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s', flexShrink: 0 }}>
      <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
    </svg>
  );
}

const s = {
  page:            { padding: '32px', maxWidth: '1100px', overflowX: 'hidden' },
  header:          { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  title:           { fontSize: '22px', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  subtitle:        { fontSize: '14px', color: 'var(--sp-textSecondary)', margin: 0 },
  generateBtn:     { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'var(--sp-accent)', color: 'var(--sp-accentText)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  loadingBanner:   { display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--sp-accentLight)', border: '1px solid var(--sp-cardBorder)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' },
  loadingTitle:    { fontSize: '14px', fontWeight: 600, color: 'var(--sp-accent)', margin: '0 0 2px' },
  loadingSub:      { fontSize: '12px', color: 'var(--sp-accent)', margin: 0 },
  emptyCard:       { background: 'var(--sp-card)', border: '1px solid var(--sp-cardBorder)', borderRadius: '16px', padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  emptyIcon:       { fontSize: '48px' },
  emptyTitle:      { fontSize: '16px', fontWeight: 600, color: 'var(--sp-text)', margin: 0 },
  emptyText:       { fontSize: '13px', color: 'var(--sp-textMuted)', margin: 0, maxWidth: '320px' },
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', alignItems: 'flex-start' },
  card:            { background: 'var(--sp-card)', border: '1px solid var(--sp-cardBorder)', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardTop:         { padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTopLeft:     { display: 'flex', alignItems: 'center', gap: '10px' },
  cardIcon:        { fontSize: '22px' },
  cardLabel:       { fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' },
  cardDesc:        { fontSize: '12px', color: 'var(--sp-textMuted)', marginTop: '2px' },
  activeBadge:     { fontSize: '10px', fontWeight: 700, color: 'var(--sp-accentText)', padding: '2px 8px', borderRadius: '20px' },
  resumeRow:       { display: 'flex', borderTop: '1px solid var(--sp-cardBorder)', borderBottom: '1px solid var(--sp-cardBorder)' },
  resumeStat:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', borderRight: '1px solid var(--sp-cardBorder)' },
  resumeVal:       { fontSize: '16px', fontWeight: 700, color: 'var(--sp-text)' },
  resumeKey:       { fontSize: '11px', color: 'var(--sp-textMuted)' },
  cardBody:        { padding: '14px 18px', flex: 1 },
  expandBtn:       { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid var(--sp-cardBorder)', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: 'var(--sp-textSecondary)', cursor: 'pointer', width: '100%', justifyContent: 'center' },
  dayList:         { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  dayRow:          { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  dayName:         { fontSize: '12px', fontWeight: 700, color: 'var(--sp-textSecondary)', minWidth: '64px', paddingTop: '4px' },
  dayContent:      { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  coursTag:        { fontSize: '11px', background: 'var(--sp-subtleBg)', color: 'var(--sp-textSecondary)', padding: '3px 8px', borderRadius: '6px' },
  sessionRow:      { display: 'flex', alignItems: 'center', gap: '4px' },
  sessionTag:      { fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 500, flex: 1 },
  moveBtn:         { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '2px 4px', borderRadius: '4px', opacity: 0.55, flexShrink: 0 },
  noSession:       { fontSize: '11px', color: 'var(--sp-textMuted)' },
  cardFooter:      { padding: '14px 18px', borderTop: '1px solid var(--sp-cardBorder)', display: 'flex', alignItems: 'center', gap: '10px' },
  activateBtn:     { flex: 1, padding: '9px', color: 'var(--sp-accentText)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  activeLabel:     { flex: 1, fontSize: '13px', fontWeight: 600, textAlign: 'center' },
  deleteBtn:       { padding: '9px 14px', background: 'none', border: '1px solid var(--sp-dangerBorder)', color: 'var(--sp-danger)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' },
  modalOverlay:    { position: 'fixed', inset: 0, background: 'var(--sp-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox:        { background: 'var(--sp-card)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' },
  modalTitle:      { fontSize: '16px', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  modalSub:        { fontSize: '13px', color: 'var(--sp-textSecondary)', margin: '0 0 18px' },
  modalSessionInfo:{ background: 'var(--sp-subtleBg)', border: '1px solid var(--sp-inputBorder)', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '4px' },
  modalSessionName:{ fontSize: '13px', fontWeight: 600, color: 'var(--sp-text)' },
  modalSessionTime:{ fontSize: '12px', color: 'var(--sp-textSecondary)' },
  modalLabel:      { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--sp-textSecondary)', marginBottom: '6px' },
  modalInput:      { width: '100%', padding: '10px 12px', background: 'var(--sp-inputBg)', border: '1px solid var(--sp-inputBorder)', borderRadius: '8px', fontSize: '14px', color: 'var(--sp-text)', boxSizing: 'border-box', marginBottom: '20px' },
  modalFooter:     { display: 'flex', gap: '10px' },
  modalCancelBtn:  { flex: 1, padding: '10px', background: 'none', border: '1px solid var(--sp-cardBorder)', borderRadius: '8px', fontSize: '13px', color: 'var(--sp-textSecondary)', cursor: 'pointer' },
  modalConfirmBtn: { flex: 1, padding: '10px', background: 'var(--sp-accent)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--sp-accentText)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
};
