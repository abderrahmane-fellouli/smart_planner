import React, { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
import { Head } from '@inertiajs/react';

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const T = {
  fr: {
    title: "Mon calendrier",
    subtitle: "Votre programme à la semaine, à jour près.",
    day: "Jour",
    week: "Semaine",
    month: "Mois",
    today: "Aujourd'hui",
    restDay: "Jour de repos",
    noSchedule: "Aucun planning actif",
    noScheduleText: "Générez votre planning pour le visualiser ici.",
    goSchedule: "Générer mon planning",
    freeTime: "{n} min libres",
    study: "{n} min d'étude",
    dayNames: { Lundi:"Lundi", Mardi:"Mardi", Mercredi:"Mercredi", Jeudi:"Jeudi", Vendredi:"Vendredi", Samedi:"Samedi", Dimanche:"Dimanche" },
    monthNames: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    totalWeek: "{h}h / semaine",
  },
  en: {
    title: "My calendar",
    subtitle: "Your program at a glance, day by day.",
    day: "Day",
    week: "Week",
    month: "Month",
    today: "Today",
    restDay: "Rest day",
    noSchedule: "No active schedule",
    noScheduleText: "Generate your schedule to view it here.",
    goSchedule: "Generate my schedule",
    freeTime: "{n} min free",
    study: "{n} min study",
    dayNames: { Lundi:"Monday", Mardi:"Tuesday", Mercredi:"Wednesday", Jeudi:"Thursday", Vendredi:"Friday", Samedi:"Saturday", Dimanche:"Sunday" },
    monthNames: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    totalWeek: "{h}h / week",
  },
  ar: {
    title: "التقويم الخاص بي",
    subtitle: "برنامجك في نظرة، يوماً بيوم.",
    day: "يوم",
    week: "أسبوع",
    month: "شهر",
    today: "اليوم",
    restDay: "يوم راحة",
    noSchedule: "لا يوجد جدول نشط",
    noScheduleText: "أنشئ جدولك لعرضه هنا.",
    goSchedule: "إنشاء جدولي",
    freeTime: "{n} دقيقة حرة",
    study: "{n} دقيقة دراسة",
    dayNames: { Lundi:"الاثنين", Mardi:"الثلاثاء", Mercredi:"الأربعاء", Jeudi:"الخميس", Vendredi:"الجمعة", Samedi:"السبت", Dimanche:"الأحد" },
    monthNames: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
    totalWeek: "{h} ساعة / أسبوع",
  },
};

const typeCfg = {
  intensif:  { label: "Intensif",  color: '#EF4444' },
  equilibre: { label: "Équilibré", color: '#10B981' },
  leger:     { label: "Léger",     color: '#3B82F6' },
};

export default function CalendarIndex({ schedule, todayName, hasCourses, scheduleUrl }) {
  let lang = "fr";
  if (typeof window !== "undefined") lang = localStorage.getItem("smartplanner_lang") || "fr";
  const tr = T[lang] || T.fr;
  const isRTL = lang === "ar";

  const [view, setView] = useState('week');
  const [day, setDay] = useState(todayName || 'Lundi');
  const [today] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); });

  const details = schedule?.schedule?.details || {};
  const type = schedule?.type || 'equilibre';
  const cfg = typeCfg[type] || typeCfg.equilibre;

  // availability per day (free minutes) derived from capacity metadata if present
  const perDayCapacity = useMemo(() => {
    const out = {};
    for (const j of jours) {
      const c = details[j]?.capacity;
      out[j] = c ? (c.free ?? null) : null;
    }
    return out;
  }, [details]);

  const sortedEvents = (jour) => {
    const cours = (details[jour]?.cours_fixes || []).map(c => ({ ...c, kind: 'cours' }));
    const sessions = (details[jour]?.sessions_etude || []).map(s => ({ ...s, kind: 'session', isFlex: s.flexible }));
    return [...cours, ...sessions].sort((a, b) => (a.start_time || a.debut || '').localeCompare(b.start_time || b.debut || ''));
  };

  const renderEvent = (ev) => {
    const start = (ev.kind === 'cours' ? ev.start_time : ev.debut)?.slice(0, 5);
    const end   = (ev.kind === 'cours' ? ev.end_time   : ev.fin)?.slice(0, 5);
    const isCours = ev.kind === 'cours';
    return (
      <div key={`${ev.kind}-${start}-${ev.title || ev.matiere}`} style={{
        backgroundColor: isCours ? 'var(--sp-subtleBg)' : cfg.color,
        color: isCours ? 'var(--sp-textSecondary)' : '#fff',
        border: isCours ? '1px solid var(--sp-cardBorder)' : 'none',
        borderRadius: 8, padding: '5px 8px', fontSize: 'var(--sp-text-xs)',
        fontWeight: isCours ? 500 : 600, lineHeight: 1.35,
      }}>
        <div>{isCours ? `📘 ${ev.title}` : (isRTL ? '📖 ' : '') + (ev.matiere || '')}</div>
        <div style={{ opacity: 0.8, fontWeight: 500 }}>
          {start}–{end}{isCours && ev.teacher ? ` · ${ev.teacher}` : ''}
        </div>
      </div>
    );
  };

  // ── DAY view ──
  const dayBlock = (jour, compact = false) => {
    const events = sortedEvents(jour);
    const isToday = jour === todayName;
    const cap = perDayCapacity[jour];
    const study = details[jour]?.total_heures_etude ?? 0;
    return (
      <div style={{
        flex: 1, minWidth: compact ? 0 : '240px', border: `1.5px solid ${isToday && !compact ? 'var(--sp-accent)' : 'var(--sp-cardBorder)'}`,
        borderRadius: 14, padding: 12, backgroundColor: isToday && !compact ? 'var(--sp-accentLight)' : 'transparent',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight:700, color: isToday ? 'var(--sp-accent)' : 'var(--sp-text)', fontSize: 'var(--sp-text-base)' }}>
            {tr.dayNames[jour] == null ? jour : tr.dayNames[jour]} {isToday && !compact ? `· ${tr.today}` : ''}
          </span>
          {study > 0 && <span style={{ fontSize:'var(--sp-text-xs)', color: cfg.color, fontWeight:600 }}>{study}h</span>}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {events.length === 0
            ? <span style={{ fontSize:'var(--sp-text-xs)', color:'var(--sp-textMuted)' }}>{tr.restDay}</span>
            : events.map(renderEvent)}
        </div>
        {cap !== null && (
          <div style={{ marginTop:8, fontSize:'var(--sp-text-xs)', color:'var(--sp-textMuted)' }}>
            {tr.freeTime.replace('{n}', cap)}
          </div>
        )}
      </div>
    );
  };

  // ── MONTH view data ──
  const monthData = useMemo(() => {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const gridStart = new Date(today.getFullYear(), today.getMonth(), 1 - startOffset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      cells.push(d);
    }
    return { name: tr.monthNames[today.getMonth()], year: today.getFullYear(), cells };
  }, [today, tr]);

  // iso weekday (1=Mon..7=Sun) -> French day
  const isoToFr = (d) => jours[(d.getDay() + 6) % 7];

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px', marginBottom:'20px' }}>
          <div style={{ textAlign:'start' }}>
            <h1 style={{ fontSize:'var(--sp-text-2xl)', fontWeight:700, color:'var(--sp-text)', margin:'0 0 4px' }}>{tr.title}</h1>
            <p style={{ fontSize:'var(--sp-text-lg)', color:'var(--sp-textSecondary)', margin:0 }}>{tr.subtitle}</p>
          </div>
          {/* View toggle */}
          <div style={{ display:'flex', background:'var(--sp-subtleBg)', border:'1px solid var(--sp-cardBorder)', borderRadius:10, padding:3, gap:2 }}>
            {[['day', tr.day], ['week', tr.week], ['month', tr.month]].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
                style={{ padding:'7px 14px', border:'none', borderRadius:8, cursor:'pointer', fontSize:'var(--sp-text-sm)', fontWeight:600,
                  background: view === v ? 'var(--sp-accent)' : 'transparent', color: view === v ? 'var(--sp-accentText)' : 'var(--sp-textSecondary)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* No schedule empty state */}
        {!schedule && (
          <div style={{ background:'var(--sp-card)', border:'1px solid var(--sp-cardBorder)', borderRadius:16, padding:'60px 32px', textAlign:'center' }}>
            <div style={{ fontSize:48 }}>📅</div>
            <h2 style={{ fontSize:'var(--sp-text-xl)', fontWeight:600, color:'var(--sp-text)', margin:'12px 0 4px' }}>{tr.noSchedule}</h2>
            <p style={{ fontSize:'var(--sp-text-base)', color:'var(--sp-textMuted)', margin:'0 0 20px' }}>{tr.noScheduleText}</p>
            {hasCourses && (
              <Link href="/schedules" style={{ textDecoration:'none' }}>
                <span style={{ background:'var(--sp-accent)', color:'var(--sp-accentText)', padding:'10px 20px', borderRadius:10, fontSize:'var(--sp-text-base)', fontWeight:600, display:'inline-block' }}>
                  {tr.goSchedule}
                </span>
              </Link>
            )}
          </div>
        )}

        {/* Week summary strip */}
        {schedule && (
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px' }}>
            <div style={{ background: cfg.color, color:'#fff', borderRadius:12, padding:'10px 16px', fontSize:'var(--sp-text-base)', fontWeight:700 }}>
              {tr.totalWeek.replace('{h}', schedule.schedule?.resume?.total_heures_semaine ?? '0')}
            </div>
            {details[day]?.overloaded && (
              <div style={{ background:'var(--sp-dangerBg)', color:'var(--sp-danger)', borderRadius:12, padding:'10px 16px', fontSize:'var(--sp-text-sm)', fontWeight:600 }}>
                ⚠️ {details[day].explanation}
              </div>
            )}
          </div>
        )}

        {schedule && view === 'day' && (
          <div>
            {/* Day picker */}
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:14 }}>
              {jours.map(j => (
                <button key={j} onClick={() => setDay(j)} aria-pressed={day === j}
                  style={{ padding:'8px 12px', border:'1px solid var(--sp-cardBorder)', borderRadius:8, cursor:'pointer', fontSize:'var(--sp-text-sm)',
                    background: day === j ? 'var(--sp-accent)' : 'transparent', color: day === j ? 'var(--sp-accentText)' : 'var(--sp-textSecondary)', fontWeight:600 }}>
                  {tr.dayNames[j]} {j === todayName ? '· ' + tr.today : ''}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'12px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              {dayBlock(day)}
            </div>
            {details[day]?.explanation && (
              <p style={{ marginTop:12, fontSize:'var(--sp-text-sm)', color:'var(--sp-textMuted)' }}>{details[day].explanation}</p>
            )}
          </div>
        )}

        {schedule && view === 'week' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'10px' }}>
            {jours.map(j => dayBlock(j, true))}
          </div>
        )}

        {schedule && view === 'month' && (
          <div style={{ background:'var(--sp-card)', border:'1px solid var(--sp-cardBorder)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--sp-cardBorder)', fontSize:'var(--sp-text-lg)', fontWeight:700, color:'var(--sp-text)' }}>
              {monthData.name} {monthData.year}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', borderBottom:'1px solid var(--sp-cardBorder)' }}>
              {jours.map(j => (
                <div key={j} style={{ padding:'8px 6px', textAlign:'center', fontSize:'var(--sp-text-xs)', fontWeight:700, color:'var(--sp-textMuted)' }}>
                  {tr.dayNames[j]?.slice(0, 3)}
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)' }}>
              {monthData.cells.map((d, i) => {
                const inMonth = d.getMonth() === today.getMonth();
                const isToday = d.toDateString() === new Date().toDateString();
                const frDay = isoToFr(d);
                const evts = sortedEvents(frDay);
                return (
                  <div key={i} style={{ minHeight: 92, padding: 6, borderTop:'1px solid var(--sp-cardBorder)', borderInlineStart:i%7? '1px solid var(--sp-cardBorder)':'none',
                    background: isToday ? 'var(--sp-accentLight)' : (inMonth ? 'transparent' : 'var(--sp-subtleBg)'), opacity: inMonth ? 1 : 0.5 }}>
                    <span style={{ fontSize:'var(--sp-text-xs)', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--sp-accent)' : 'var(--sp-textSecondary)' }}>
                      {d.getDate()}
                    </span>
                    <div style={{ display:'flex', flexDirection:'column', gap:3, marginTop:4 }}>
                      {evts.slice(0, 3).map(renderEvent)}
                      {evts.length > 3 && <span style={{ fontSize:'var(--sp-text-xs)', color:'var(--sp-textMuted)' }}>+{evts.length - 3}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
