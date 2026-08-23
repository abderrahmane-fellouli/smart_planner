import React from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';

const T = {
  fr: {
    fixedEvents: {
      title: "Cours fixes",
      subtitle: "Ajoutez vos cours pour que l'IA génère votre planning",
      statBadge: "{count} cours enregistrés",
      addCourse: "Ajouter un cours",
      subject: "Matière",
      subjectPlaceholder: "Ex: Mathématiques",
      day: "Jour",
      everyDay: "Tous les jours",
      everyDayDesc: "Appliquer à tous les jours (lundi–samedi)",
      startTime: "Heure début",
      endTime: "Heure fin",
      addButton: "+ Ajouter le cours",
      adding: "Ajout en cours...",
      courseList: "Liste des cours",
      emptyTitle: "Aucun cours ajouté",
      emptyDesc: "Ajoutez votre premier cours avec le formulaire",
      deleteConfirm: "Supprimer ce cours ?",
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
    fixedEvents: {
      title: "Fixed courses",
      subtitle: "Add your courses so the AI can generate your schedule",
      statBadge: "{count} courses saved",
      addCourse: "Add a course",
      subject: "Subject",
      subjectPlaceholder: "E.g., Mathematics",
      day: "Day",
      everyDay: "Every day",
      everyDayDesc: "Apply to all days (Monday–Saturday)",
      startTime: "Start time",
      endTime: "End time",
      addButton: "+ Add course",
      adding: "Adding...",
      courseList: "Course list",
      emptyTitle: "No courses added",
      emptyDesc: "Add your first course using the form",
      deleteConfirm: "Delete this course?",
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
    fixedEvents: {
      title: "الدروس الثابتة",
      subtitle: "أضف دروسك ليتمكن الذكاء الاصطناعي من إنشاء جدولك",
      statBadge: "{count} درس محفوظ",
      addCourse: "إضافة درس",
      subject: "المادة",
      subjectPlaceholder: "مثال: الرياضيات",
      day: "اليوم",
      everyDay: "كل يوم",
      everyDayDesc: "تطبيق على كل الأيام (الاثنين–السبت)",
      startTime: "وقت البدء",
      endTime: "وقت الانتهاء",
      addButton: "+ إضافة درس",
      adding: "جاري الإضافة...",
      courseList: "قائمة الدروس",
      emptyTitle: "لا توجد دروس مضافة",
      emptyDesc: "أضف درسك الأول باستخدام النموذج",
      deleteConfirm: "هل تريد حذف هذا الدرس؟",
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

export default function FixedEventsIndex({ fixedEvents }) {
  let lang = "fr";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("smartplanner_lang") || "fr";
  }
  const tr = T[lang]?.fixedEvents || T.fr.fixedEvents;
  const isRTL = lang === "ar";

  const jours = [
    tr.days.monday,
    tr.days.tuesday,
    tr.days.wednesday,
    tr.days.thursday,
    tr.days.friday,
    tr.days.saturday,
  ];

  const dayColors = {
    'Lundi':    { bg: 'var(--sp-accentLight)', color: 'var(--sp-accent)' },
    'Mardi':    { bg: '#FDF2F8', color: '#DB2777' },
    'Mercredi': { bg: '#ECFDF5', color: '#059669' },
    'Jeudi':    { bg: '#FFF7ED', color: '#EA580C' },
    'Vendredi': { bg: '#EFF6FF', color: '#2563EB' },
    'Samedi':   { bg: '#F5F3FF', color: '#7C3AED' },
  };

  const dayNameMap = {
    'Lundi': tr.days.monday,
    'Mardi': tr.days.tuesday,
    'Mercredi': tr.days.wednesday,
    'Jeudi': tr.days.thursday,
    'Vendredi': tr.days.friday,
    'Samedi': tr.days.saturday,
  };

  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    day_of_week: tr.days.monday,
    start_time: '09:00',
    end_time: '11:00',
    is_recurring_daily: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/fixed-events', { onSuccess: () => {
      // Reset form after successful submission, keeping the day in current language
      reset('title', 'start_time', 'end_time');
      setData('is_recurring_daily', false);
      setData('day_of_week', tr.days.monday);
    }});
  };

  const handleDelete = (id) => {
    if (confirm(tr.deleteConfirm)) {
      router.delete(`/fixed-events/${id}`);
    }
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
          <div style={s.statBadge}>
            {tr.statBadge.replace("{count}", fixedEvents?.length || 0)}
          </div>
        </div>

        <div style={{ ...s.layout, flexDirection: isRTL ? "row-reverse" : "row" }} className="sp-grid-2col">
          {/* Form */}
          <div style={s.formCard}>
            <div style={{ ...s.cardHeader, flexDirection: isRTL ? "row-reverse" : "row" }}>
              <div style={s.cardIcon}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <h2 style={s.cardTitle}>{tr.addCourse}</h2>
            </div>
            <form onSubmit={handleSubmit} style={s.form}>
              {/* Global error banner */}
              {errors.title && (
                <div style={s.errorBanner} role="alert">{errors.title}</div>
              )}

              <div style={s.field}>
                <label style={s.label} htmlFor="fe-title">{tr.subject}</label>
                <input
                  id="fe-title"
                  type="text"
                  style={{ ...s.input, ...(errors.title ? s.inputError : {}) }}
                  placeholder={tr.subjectPlaceholder}
                  value={data.title}
                  onChange={e => setData('title', e.target.value)}
                  required
                />
              </div>

              {/* Every day toggle — uses role="checkbox" for keyboard accessibility */}
              <div
                role="checkbox"
                aria-checked={data.is_recurring_daily}
                aria-label={tr.everyDay}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setData('is_recurring_daily', !data.is_recurring_daily);
                  }
                }}
                style={{
                  ...s.everyDayRow,
                  flexDirection: isRTL ? "row-reverse" : "row",
                  background: data.is_recurring_daily ? 'var(--sp-accentLight)' : 'var(--sp-hoverBg)',
                  borderColor: data.is_recurring_daily ? '#C7D2FE' : 'var(--sp-cardBorder)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setData('is_recurring_daily', !data.is_recurring_daily);
                }}
              >
                <div style={s.checkboxWrap}>
                  <div style={{
                    ...s.checkbox,
                    background: data.is_recurring_daily ? '#4F46E5' : '#fff',
                    borderColor: data.is_recurring_daily ? '#4F46E5' : '#D1D5DB',
                  }}>
                    {data.is_recurring_daily && (
                      <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: isRTL ? "right" : "left" }}>
                  <div style={s.everyDayLabel}>{tr.everyDay}</div>
                  <div style={s.everyDayDesc}>{tr.everyDayDesc}</div>
                </div>
              </div>

              {/* Day selector — hidden when every day is checked */}
              {!data.is_recurring_daily && (
                <div style={s.field}>
                  <label style={s.label} htmlFor="fe-day">{tr.day}</label>
                  <select
                    id="fe-day"
                    style={{ ...s.input, ...(errors.day_of_week ? s.inputError : {}) }}
                    value={data.day_of_week}
                    onChange={e => setData('day_of_week', e.target.value)}
                  >
                    {jours.map(j => <option key={j}>{j}</option>)}
                  </select>
                  {errors.day_of_week && <span style={s.fieldError}>{errors.day_of_week}</span>}
                </div>
              )}

              <div style={s.fieldRow}>
                <div style={s.field}>
                  <label style={s.label} htmlFor="fe-start">{tr.startTime}</label>
                  <input
                    id="fe-start"
                    type="time"
                    style={{ ...s.input, ...(errors.start_time ? s.inputError : {}) }}
                    value={data.start_time}
                    onChange={e => setData('start_time', e.target.value)}
                    required
                  />
                  {errors.start_time && <span style={s.fieldError}>{errors.start_time}</span>}
                </div>
                <div style={s.field}>
                  <label style={s.label} htmlFor="fe-end">{tr.endTime}</label>
                  <input
                    id="fe-end"
                    type="time"
                    style={{ ...s.input, ...(errors.end_time ? s.inputError : {}) }}
                    value={data.end_time}
                    onChange={e => setData('end_time', e.target.value)}
                    required
                  />
                  {errors.end_time && <span style={s.fieldError}>{errors.end_time}</span>}
                </div>
              </div>

              <button type="submit" style={s.submitBtn} disabled={processing}>
                {processing ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                      style={{ animation: "spin 0.8s linear infinite" }}>
                      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                      <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    {tr.adding}
                  </span>
                ) : tr.addButton}
              </button>
            </form>
          </div>

          {/* Course list */}
          <div style={s.listCard}>
            <div style={{ ...s.cardHeader, flexDirection: isRTL ? "row-reverse" : "row" }}>
              <div style={s.cardIcon}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <h2 style={s.cardTitle}>{tr.courseList}</h2>
            </div>
            <div style={s.listBody}>
              {!fixedEvents || fixedEvents.length === 0 ? (
                <div style={s.empty}>
                  <p style={s.emptyText}>{tr.emptyTitle}</p>
                  <p style={s.emptyDesc}>{tr.emptyDesc}</p>
                </div>
              ) : (
                fixedEvents.map(event => {
                  const isDaily = event.is_recurring_daily;
                  const dayName = event.day_of_week;
                  const dc = dayColors[dayName] || { bg: 'var(--sp-subtleBg)', color: 'var(--sp-textSecondary)' };
                  return (
                    <div key={event.id} style={{ ...s.eventRow, flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <div style={{
                        ...s.dayBadge,
                        background: isDaily ? '#FEF3C7' : dc.bg,
                        color: isDaily ? '#D97706' : dc.color,
                      }}>
                        {isDaily ? '☀' : (dayNameMap[dayName] || dayName || '').slice(0, 3)}
                      </div>
                      <div style={{ ...s.eventInfo, textAlign: isRTL ? "right" : "left" }}>
                        <span style={s.eventTitle}>{event.title}</span>
                        <span style={s.eventTime}>
                          {isDaily ? tr.everyDay + ' · ' : ''}
                          {event.start_time?.slice(0, 5)} – {event.end_time?.slice(0, 5)}
                        </span>
                      </div>
                      <button onClick={() => handleDelete(event.id)} style={s.deleteBtn} title={tr.deleteConfirm}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const s = {
  page: { padding: '32px', maxWidth: '900px', overflowX: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' },
  title: { fontSize: '22px', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: 'var(--sp-textSecondary)', margin: 0 },
  statBadge: {
    padding: '6px 14px', background: 'var(--sp-accentLight)',
    color: 'var(--sp-accent)', borderRadius: '20px',
    fontSize: '13px', fontWeight: 600,
  },
  layout: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' },
  formCard: {
    background: 'var(--sp-card)', border: '1px solid var(--sp-cardBorder)',
    borderRadius: '14px', overflow: 'hidden',
  },
  listCard: {
    background: 'var(--sp-card)', border: '1px solid var(--sp-cardBorder)',
    borderRadius: '14px', overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '16px 20px', borderBottom: '1px solid var(--sp-cardBorder)',
  },
  cardIcon: {
    width: '32px', height: '32px', background: 'var(--sp-accentLight)',
    color: 'var(--sp-accent)',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: 'var(--sp-text)', margin: 0 },
  form: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 500, color: 'var(--sp-text)' },
  input: {
    padding: '9px 12px',
    background: 'var(--sp-inputBg)',
    border: '1px solid var(--sp-inputBorder)', borderRadius: '8px',
    fontSize: '13px', color: 'var(--sp-text)', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  },
  inputError: { borderColor: '#FCA5A5', background: '#FEF2F2' },
  fieldError: { fontSize: '12px', color: '#EF4444', fontWeight: 500 },
  errorBanner: {
    padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2',
    border: '1px solid #FECACA', color: '#991B1B', fontSize: '13px', fontWeight: 500,
  },
  everyDayRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 14px', borderRadius: '10px',
    border: '1px solid var(--sp-cardBorder)', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  checkboxWrap: { flexShrink: 0 },
  checkbox: {
    width: '20px', height: '20px', borderRadius: '6px',
    border: '2px solid #D1D5DB', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  everyDayLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--sp-text)' },
  everyDayDesc: { fontSize: '11px', color: 'var(--sp-textMuted)', marginTop: '1px' },
  submitBtn: {
    padding: '11px', background: '#4F46E5', color: '#fff',
    border: 'none', borderRadius: '10px',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    width: '100%',
  },
  listBody: { padding: '8px 0' },
  empty: { padding: '40px 20px', textAlign: 'center' },
  emptyText: { fontSize: '14px', fontWeight: 600, color: 'var(--sp-text)', margin: '0 0 4px' },
  emptyDesc: { fontSize: '13px', color: 'var(--sp-textMuted)', margin: 0 },
  eventRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', borderBottom: '1px solid var(--sp-cardBorder)',
  },
  dayBadge: {
    fontSize: '11px', fontWeight: 700,
    padding: '4px 10px', borderRadius: '20px',
    minWidth: '36px', textAlign: 'center',
  },
  eventInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  eventTitle: { fontSize: '13px', fontWeight: 600, color: 'var(--sp-text)' },
  eventTime: { fontSize: '12px', color: 'var(--sp-textMuted)' },
  deleteBtn: {
    background: 'none', border: '1px solid #FCA5A5',
    color: '#EF4444', borderRadius: '6px',
    padding: '5px 8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
};
