import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';

const T = {
  fr: {
    preferences: {
      title: "Préférences",
      subtitle: "Configurez vos habitudes d'étude pour un planning personnalisé",
      wake_up: "Heure de réveil",
      sleep_time: "Heure de coucher",
      study_rhythm: "Rythme d'étude",
      study_time_label: "Moment préféré pour étudier",
      morning: "Matin",
      morning_desc: "Productif tôt le matin",
      normal: "Journée",
      normal_desc: "Réparti sur la journée",
      night: "Soir",
      night_desc: "Productif en soirée",
      any: "Flexible",
      any_desc: "L'algorithme choisit librement",
      durations: "Durées quotidiennes",
      hours_per_day: "Heures d'étude par jour",
      free_time: "Temps libre souhaité",
      save: "Sauvegarder les préférences",
      saving: "Sauvegarde...",
      hour_unit: "h",
    },
  },
  en: {
    preferences: {
      title: "Preferences",
      subtitle: "Configure your study habits for a personalised schedule",
      wake_up: "Wake-up time",
      sleep_time: "Bedtime",
      study_rhythm: "Study rhythm",
      study_time_label: "Preferred study time",
      morning: "Morning",
      morning_desc: "Productive early morning",
      normal: "Daytime",
      normal_desc: "Spread throughout the day",
      night: "Evening",
      night_desc: "Productive in the evening",
      any: "Flexible",
      any_desc: "Let the algorithm choose freely",
      durations: "Daily durations",
      hours_per_day: "Study hours per day",
      free_time: "Desired free time",
      save: "Save preferences",
      saving: "Saving...",
      hour_unit: "h",
    },
  },
  ar: {
    preferences: {
      title: "التفضيلات",
      subtitle: "قم بتكوين عادات دراستك للحصول على جدول مخصص",
      wake_up: "وقت الاستيقاظ",
      sleep_time: "وقت النوم",
      study_rhythm: "إيقاع الدراسة",
      study_time_label: "الوقت المفضل للدراسة",
      morning: "الصباح",
      morning_desc: "نشاط في الصباح الباكر",
      normal: "أثناء النهار",
      normal_desc: "موزع على مدار اليوم",
      night: "المساء",
      night_desc: "نشاط في المساء",
      any: "مرن",
      any_desc: "دع الخوارزمية تختار بحرية",
      durations: "المدد اليومية",
      hours_per_day: "ساعات الدراسة في اليوم",
      free_time: "الوقت الحر المرغوب",
      save: "حفظ التفضيلات",
      saving: "جاري الحفظ...",
      hour_unit: "س",
    },
  },
};

export default function PreferencesIndex({ preferences }) {
  // Read language from localStorage (same as Statistics)
  let lang = "fr";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("smartplanner_lang") || "fr";
  }
  const tr = T[lang]?.preferences || T.fr.preferences;
  const isRTL = lang === "ar";

  const { data, setData, post, processing, errors } = useForm({
    wake_up_time: preferences?.wake_up_time?.slice(0, 5) || '08:00',
    sleep_time: preferences?.sleep_time?.slice(0, 5) || '22:00',
    study_preference: preferences?.study_preference || 'morning',
    concentration_hours: preferences?.concentration_hours || 2,
    desired_free_time: preferences?.desired_free_time || 2,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/preferences', { lang });
  };

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={{ ...s.page, direction: isRTL ? "rtl" : "ltr" }}>
        <div style={{ ...s.header, textAlign: isRTL ? "right" : "left" }}>
          <div>
            <h1 style={s.title}>{tr.title}</h1>
            <p style={s.subtitle}>{tr.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.grid} className="sp-preferences-grid">

            {/* Horaires */}
            <div style={s.card}>
              <div style={{ ...s.cardHeader, flexDirection: isRTL ? "row-reverse" : "row" }}>
                <div style={s.cardIcon}>
                  <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h2 style={s.cardTitle}>{tr.wake_up} & {tr.sleep_time}</h2>
              </div>
              <div style={s.cardBody}>
                <div style={s.fieldRow}>
                  <div style={s.field}>
                    <label style={s.label}>{tr.wake_up}</label>
                    <input
                      type="time"
                      style={{ ...s.input, ...(errors.wake_up_time ? { borderColor: '#FCA5A5', background: '#FEF2F2' } : {}) }}
                      value={data.wake_up_time}
                      onChange={e => setData('wake_up_time', e.target.value)}
                      required
                    />
                    {errors.wake_up_time && <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>{errors.wake_up_time}</span>}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>{tr.sleep_time}</label>
                    <input
                      type="time"
                      style={{ ...s.input, ...(errors.sleep_time ? { borderColor: '#FCA5A5', background: '#FEF2F2' } : {}) }}
                      value={data.sleep_time}
                      onChange={e => setData('sleep_time', e.target.value)}
                      required
                    />
                    {errors.sleep_time && <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>{errors.sleep_time}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Rythme d'étude */}
            <div style={s.card}>
              <div style={{ ...s.cardHeader, flexDirection: isRTL ? "row-reverse" : "row" }}>
                <div style={s.cardIcon}>
                  <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 style={s.cardTitle}>{tr.study_rhythm}</h2>
              </div>
              <div style={s.cardBody}>
                <div style={s.field}>
                  <label style={s.label}>{tr.study_time_label}</label>
                  <div style={s.radioGroup}>
                    {[
                      { value: 'morning', label: tr.morning, desc: tr.morning_desc },
                      { value: 'normal', label: tr.normal, desc: tr.normal_desc },
                      { value: 'night', label: tr.night, desc: tr.night_desc },
                      { value: 'any', label: tr.any, desc: tr.any_desc },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        style={{
                          ...s.radioCard,
                          ...(data.study_preference === opt.value ? s.radioCardActive : {}),
                          flexDirection: isRTL ? "row-reverse" : "row",
                        }}
                        onClick={() => setData('study_preference', opt.value)}
                      >
                        <div style={s.radioDot}>
                          {data.study_preference === opt.value && <div style={s.radioDotInner} />}
                        </div>
                        <div style={{ textAlign: isRTL ? "right" : "left" }}>
                          <div style={s.radioLabel}>{opt.label}</div>
                          <div style={s.radioDesc}>{opt.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Durées */}
            <div style={s.card}>
              <div style={{ ...s.cardHeader, flexDirection: isRTL ? "row-reverse" : "row" }}>
                <div style={s.cardIcon}>
                  <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 style={s.cardTitle}>{tr.durations}</h2>
              </div>
              <div style={s.cardBody}>
                <div style={s.fieldRow}>
                  <div style={s.field}>
                    <label style={s.label}>{tr.hours_per_day}</label>
                    <div style={{ ...s.numberWrapper, ...(errors.concentration_hours ? { borderColor: '#FCA5A5' } : {}) }}>
                      <button type="button" style={s.numBtn} onClick={() => setData('concentration_hours', Math.max(1, data.concentration_hours - 1))}>−</button>
                      <span style={s.numValue}>{data.concentration_hours}{tr.hour_unit}</span>
                      <button type="button" style={s.numBtn} onClick={() => setData('concentration_hours', Math.min(12, data.concentration_hours + 1))}>+</button>
                    </div>
                    {errors.concentration_hours && <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>{errors.concentration_hours}</span>}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>{tr.free_time}</label>
                    <div style={{ ...s.numberWrapper, ...(errors.desired_free_time ? { borderColor: '#FCA5A5' } : {}) }}>
                      <button type="button" style={s.numBtn} onClick={() => setData('desired_free_time', Math.max(0, data.desired_free_time - 1))}>−</button>
                      <span style={s.numValue}>{data.desired_free_time}{tr.hour_unit}</span>
                      <button type="button" style={s.numBtn} onClick={() => setData('desired_free_time', Math.min(8, data.desired_free_time + 1))}>+</button>
                    </div>
                    {errors.desired_free_time && <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 500 }}>{errors.desired_free_time}</span>}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div style={{ ...s.footer, textAlign: isRTL ? "right" : "left" }}>
            <button type="submit" style={s.saveBtn} disabled={processing}>
              {processing ? tr.saving : tr.save}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

const s = {
  page: { padding: '32px', maxWidth: '860px', overflowX: 'hidden' },
  header: { marginBottom: '28px' },
  title: { fontSize: '22px', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: 'var(--sp-textSecondary)', margin: 0 },
  grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    background: 'var(--sp-card)',
    border: '1px solid var(--sp-cardBorder)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--sp-cardBorder)',
  },
  cardIcon: {
    width: '32px', height: '32px',
    background: 'var(--sp-accentLight)',
    borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: 'var(--sp-text)', margin: 0 },
  cardBody: { padding: '20px' },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 500, color: 'var(--sp-text)' },
  input: {
    padding: '9px 12px',
    background: 'var(--sp-inputBg)',
    border: '1px solid var(--sp-inputBorder)',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--sp-text)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  radioCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 14px',
    border: '1px solid var(--sp-cardBorder)',
    background: 'var(--sp-hoverBg)',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  radioCardActive: {
    border: '1.5px solid var(--sp-accent)',
    background: 'var(--sp-accentLight)',
  },
  radioDot: {
    width: '16px', height: '16px',
    border: '2px solid #D1D5DB',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  radioDotInner: {
    width: '8px', height: '8px',
    background: 'var(--sp-accent)', borderRadius: '50%',
  },
  radioLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--sp-text)' },
  radioDesc: { fontSize: '12px', color: 'var(--sp-textMuted)' },
  numberWrapper: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '8px 12px',
    background: 'var(--sp-inputBg)',
    border: '1px solid var(--sp-inputBorder)',
    borderRadius: '8px',
    width: 'fit-content',
  },
  numBtn: {
    width: '28px', height: '28px',
    background: 'var(--sp-hoverBg)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600,
    color: 'var(--sp-text)',
  },
  numValue: { fontSize: '16px', fontWeight: 700, color: 'var(--sp-text)', minWidth: '32px', textAlign: 'center' },
  footer: { marginTop: '24px' },
  saveBtn: {
    padding: '11px 28px',
    background: 'var(--sp-accent)',
    color: 'var(--sp-accentText)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
