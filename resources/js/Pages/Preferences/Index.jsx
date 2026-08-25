import React from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';
import { useTheme } from '@/Pages/AppLayout';
import { THEMES } from '@/Themes';
import TimeInput from '@/Components/TimeInput';
import { useToast } from '@/Components/Toast';

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
      theme: "Thème",
      theme_desc: "Choisissez un thème pour l'interface",
      sleep_schedule: "Horaires de sommeil",
      sleep_schedule_desc: "Configurez des horaires différents par jour",
      configure: "Configurer →",
      active: "Actif",
      saveSuccess: "Préférences enregistrées !",
      saveError: "Erreur lors de l'enregistrement.",
      themeSaveError: "Impossible d'enregistrer le thème.",
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
      theme: "Theme",
      theme_desc: "Choose a look for the interface",
      sleep_schedule: "Sleep schedule",
      sleep_schedule_desc: "Set different wake/sleep times per day",
      configure: "Configure →",
      active: "Active",
      saveSuccess: "Preferences saved!",
      saveError: "Failed to save preferences.",
      themeSaveError: "Could not save the theme.",
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
      theme: "المظهر",
      theme_desc: "اختر مظهرًا للواجهة",
      sleep_schedule: "جدول النوم",
      sleep_schedule_desc: "حدد أوقات مختلفة لكل يوم",
      configure: "تكوين →",
      active: "نشط",
      saveSuccess: "تم حفظ التفضيلات!",
      saveError: "حدث خطأ أثناء الحفظ.",
      themeSaveError: "تعذر حفظ المظهر.",
    },
  },
};

export default function PreferencesIndex({ preferences }) {
  const { themeName, setThemeName, dark } = useTheme();
  let lang = "fr";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("smartplanner_lang") || "fr";
  }
  const tr = T[lang]?.preferences || T.fr.preferences;
  const isRTL = lang === "ar";

  const themeOptions = Object.entries(THEMES).map(([key, theme]) => ({
    key,
    label: theme.label?.[lang] || theme.label?.fr || key,
    desc: theme.description?.[lang] || theme.description?.fr || '',
    accent: (dark ? theme.dark : theme.light).accent,
    body: (dark ? theme.dark : theme.light).body,
    card: (dark ? theme.dark : theme.light).card,
    isActive: key === themeName,
  }));

  const { data, setData, post, processing, errors } = useForm({
    wake_up_time: preferences?.wake_up_time?.slice(0, 5) || '08:00',
    sleep_time: preferences?.sleep_time?.slice(0, 5) || '22:00',
    study_preference: preferences?.study_preference || 'morning',
    concentration_hours: preferences?.concentration_hours || 2,
    desired_free_time: preferences?.desired_free_time || 2,
    theme: preferences?.theme || themeName || 'default',
  });

  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/preferences', {
      lang,
      onSuccess: () => toast.success(tr.saveSuccess),
      onError: () => toast.error(tr.saveError),
    });
  };

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={s.page}>
        <div style={{ ...s.header, textAlign: "start" }}>
          <div>
            <h1 style={s.title}>{tr.title}</h1>
            <p style={s.subtitle}>{tr.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.grid} className="sp-preferences-grid">

            {/* Horaires */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardIcon}>
                  <svg width="16" height="16" fill="none" stroke="var(--sp-accent)" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h2 style={s.cardTitle}>{tr.wake_up} & {tr.sleep_time}</h2>
              </div>
              <div style={s.cardBody}>
                <div style={s.fieldRow} className="sp-field-row">
                  <div style={s.field}>
                    <label style={s.label}>{tr.wake_up}</label>
                    <TimeInput
                      value={data.wake_up_time}
                      onChange={v => setData('wake_up_time', v)}
                      hasError={!!errors.wake_up_time}
                    />
                    {errors.wake_up_time && <span style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--sp-error)', fontWeight: 500 }}>{errors.wake_up_time}</span>}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>{tr.sleep_time}</label>
                    <TimeInput
                      value={data.sleep_time}
                      onChange={v => setData('sleep_time', v)}
                      hasError={!!errors.sleep_time}
                    />
                    {errors.sleep_time && <span style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--sp-error)', fontWeight: 500 }}>{errors.sleep_time}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Rythme d'étude */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardIcon}>
                  <svg width="16" height="16" fill="none" stroke="var(--sp-accent)" strokeWidth="2" viewBox="0 0 24 24">
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
                        }}
                        onClick={() => setData('study_preference', opt.value)}
                      >
                        <div style={s.radioDot}>
                          {data.study_preference === opt.value && <div style={s.radioDotInner} />}
                        </div>
                        <div style={{ textAlign: "start", minWidth: 0 }}>
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
              <div style={s.cardHeader}>
                <div style={s.cardIcon}>
                  <svg width="16" height="16" fill="none" stroke="var(--sp-accent)" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 style={s.cardTitle}>{tr.durations}</h2>
              </div>
              <div style={s.cardBody}>
                <div style={s.fieldRow} className="sp-field-row">
                  <div style={s.field}>
                    <label style={s.label}>{tr.hours_per_day}</label>
                    <div style={{ ...s.numberWrapper, ...(errors.concentration_hours ? { borderColor: 'var(--sp-errorBorder)' } : {}) }}>
                      <button type="button" style={s.numBtn} onClick={() => setData('concentration_hours', Math.max(1, data.concentration_hours - 1))}>−</button>
                      <span style={s.numValue}>{data.concentration_hours}{tr.hour_unit}</span>
                      <button type="button" style={s.numBtn} onClick={() => setData('concentration_hours', Math.min(12, data.concentration_hours + 1))}>+</button>
                    </div>
                    {errors.concentration_hours && <span style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--sp-error)', fontWeight: 500 }}>{errors.concentration_hours}</span>}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>{tr.free_time}</label>
                    <div style={{ ...s.numberWrapper, ...(errors.desired_free_time ? { borderColor: 'var(--sp-errorBorder)' } : {}) }}>
                      <button type="button" style={s.numBtn} onClick={() => setData('desired_free_time', Math.max(0, data.desired_free_time - 1))}>−</button>
                      <span style={s.numValue}>{data.desired_free_time}{tr.hour_unit}</span>
                      <button type="button" style={s.numBtn} onClick={() => setData('desired_free_time', Math.min(8, data.desired_free_time + 1))}>+</button>
                    </div>
                    {errors.desired_free_time && <span style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--sp-error)', fontWeight: 500 }}>{errors.desired_free_time}</span>}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Theme selector ── */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardIcon}>
                <svg width="16" height="16" fill="none" stroke="var(--sp-accent)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h2 style={s.cardTitle}>{tr.theme}</h2>
            </div>
            <div style={s.cardBody}>
              <p style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--sp-textSecondary)', margin: '0 0 14px' }}>{tr.theme_desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '10px' }}>
                {themeOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                        setThemeName(opt.key);
                        setData('theme', opt.key);
                        fetch('/preferences/theme', {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                            },
                            body: JSON.stringify({ theme: opt.key }),
                        })
                            .then(res => { if (!res.ok) throw new Error('theme save failed'); })
                            .catch(() => toast.error(tr.themeSaveError));
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px',
                      border: opt.isActive ? `2px solid ${opt.accent}` : '1.5px solid var(--sp-cardBorder)',
                      background: opt.isActive ? 'var(--sp-accentLight)' : 'var(--sp-hoverBg)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'start',
                      transition: 'all 0.15s',
                      width: '100%',
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: `linear-gradient(135deg, ${opt.accent}, ${opt.body})`,
                      border: '1px solid var(--sp-cardBorder)',
                      flexShrink: 0,
                    }} />
                    <div style={{ minWidth: 0 }}>
                       <div style={{ fontSize: 'var(--sp-text-base)', fontWeight: 600, color: 'var(--sp-text)' }}>{opt.label}</div>
                       <div style={{ fontSize: 'var(--sp-text-xs)', color: 'var(--sp-textMuted)' }}>{opt.desc}</div>
                     </div>
                    {opt.isActive && (
                      <span style={{ marginInlineStart: 'auto', fontSize: 'var(--sp-text-xs)', fontWeight: 700, color: opt.accent }}>
                        {tr.active}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sleep schedule link ── */}
          <Link href="/sleep-schedule" style={{ ...s.card, textDecoration: 'none', display: 'block' }}>
            <div style={{ ...s.cardBody, display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={s.cardIcon}>
                <svg width="16" height="16" fill="none" stroke="var(--sp-accent)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div style={{ flex: 1, textAlign: 'start' }}>
                <div style={{ fontSize: 'var(--sp-text-base)', fontWeight: 600, color: 'var(--sp-text)' }}>{tr.sleep_schedule}</div>
                <div style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--sp-textSecondary)' }}>{tr.sleep_schedule_desc}</div>
              </div>
              <span style={{ fontSize: 'var(--sp-text-sm)', fontWeight: 600, color: 'var(--sp-accent)' }}>{tr.configure}</span>
            </div>
          </Link>

          <div style={{ ...s.footer, textAlign: "start" }}>
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
  page: { maxWidth: '1040px', margin: '0 auto', padding: '32px 24px 60px', overflowX: 'hidden' },
  header: { marginBottom: '20px' },
  title: { fontSize: 'var(--sp-text-2xl)', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  subtitle: { fontSize: 'var(--sp-text-lg)', color: 'var(--sp-textSecondary)', margin: 0 },
  grid: { display: 'flex', flexDirection: 'column', gap: '12px' },
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
  cardTitle: { fontSize: 'var(--sp-text-lg)', fontWeight: 600, color: 'var(--sp-text)', margin: 0 },
  cardBody: { padding: '16px 18px' },
  fieldRow: { display: 'grid', gridTemplateColumns: 'minmax(min(200px, 100%), 1fr) minmax(min(200px, 100%), 1fr)', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0, width: '100%', boxSizing: 'border-box' },
  label: { fontSize: 'var(--sp-text-base)', fontWeight: 500, color: 'var(--sp-text)' },
  input: {
    padding: '9px 12px',
    background: 'var(--sp-inputBg)',
    border: '1px solid var(--sp-inputBorder)',
    borderRadius: '8px',
    fontSize: 'var(--sp-text-lg)',
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
    border: '2px solid var(--sp-inputBorder)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  radioDotInner: {
    width: '8px', height: '8px',
    background: 'var(--sp-accent)', borderRadius: '50%',
  },
  radioLabel: { fontSize: 'var(--sp-text-base)', fontWeight: 600, color: 'var(--sp-text)' },
  radioDesc: { fontSize: 'var(--sp-text-sm)', color: 'var(--sp-textMuted)' },
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
    fontSize: 'var(--sp-text-xl)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600,
    color: 'var(--sp-text)',
  },
  numValue: { fontSize: 'var(--sp-text-xl)', fontWeight: 700, color: 'var(--sp-text)', minWidth: '32px', textAlign: 'center' },
  footer: { marginTop: '16px' },
  saveBtn: {
    padding: '11px 28px',
    background: 'var(--sp-accent)',
    color: 'var(--sp-accentText)',
    border: 'none',
    borderRadius: '10px',
    fontSize: 'var(--sp-text-lg)',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
