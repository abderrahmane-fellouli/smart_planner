import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { router, usePage } from "@inertiajs/react";
import { useTheme, useLang } from "@/ThemeProvider";

/* ─────────────────────────────────────────────────────────────────────
 * SmartPlanner Guided Tour
 *
 * A native, interactive first-time onboarding guide that walks the user
 * through the real SmartPlanner workflow by doing it — never by faking
 * data. It reuses the app's existing design tokens (CSS variables / tk),
 * follows the active theme + dark mode live, is fully RTL-aware
 * (Arabic), responsive (bottom sheet on narrow screens), accessible,
 * never blocks the app (temporary close ≠ permanent skip), and persists
 * its state server-side so it follows the account.
 * ───────────────────────────────────────────────────────────────────── */

const GT = {
  fr: {
    ui: {
      skip: "Ignorer",
      next: "Suivant",
      back: "Retour",
      finish: "Terminer",
      tryIt: "Essayez — je passe à la suite automatiquement.",
      automatic: "Bien vu, c'est fait ! Je continue.",
      skipTitle: "Ignorer le guide ?",
      skipBody: "Vous pourrez le relancer à tout moment depuis Préférences → Aide.",
      skipConfirm: "Ignorer définitivement",
      skipCancel: "Continuer le guide",
      resume: "Reprendre le guide",
    },
    steps: {
      welcome:      { title: "Bienvenue sur SmartPlanner", body: "Ce court guide vous apprend votre nouveau planning en le construisant avec vous. À tout moment, « Ignorer » le ferme sans rien supprimer." },
      overview:     { title: "Votre vue d'ensemble", body: "Cette page résume vos statistiques, votre aujourd'hui (programme) et vos tâches du jour. Vous y reviendrez chaque jour." },
      quickactions: { title: "Vos raccourcis", body: "Depuis ici vous accédez à tout : tâches fixes, horaires de sommeil, préférences, génération et export." },
      courses:      { title: "Ajoutez vos cours fixes", body: "Un cours fixe se répète chaque semaine (cours, examens, travail…). Ajoutez-en au moins un : c'est lui qui nourrit votre planning." },
      coursesDone:  { title: "Parfait !", body: "Votre cours est enregistré. Le moteur connaît maintenant vos contraintes fixes et peut les replacer dans la semaine." },
      todos:        { title: "Vos tâches du jour", body: "Ajoutez vos tâches du jour et leur difficulté. Une tâche cochée « Ajouter au planning » sera intégrée à votre planning généré." },
      sleep:        { title: "Vos horaires de sommeil", body: "Indiquez vos heures de réveil et de coucher — mêmes ou différentes par jour. Le planning respectera votre rythme." },
      preferences:  { title: "Vos préférences d'étude", body: "Choisissez votre rythme, vos heures par jour, votre thème d'interface et le mode sombre ici, puis enregistrez." },
      generate:     { title: "Générez vos plannings", body: "Cliquez sur « Générer les plannings » : l'IA propose 3 types (intensif, équilibré, léger)." },
      activate:     { title: "Activez votre planning", body: "Comparez puis activez le planning qui vous convient. Le planning actif s'affiche sur votre tableau de bord." },
      statistics:   { title: "Vos statistiques", body: "Suivez vos heures d'étude, votre meilleur jour et la répartition par matière et par type de planning." },
      export:       { title: "Exportez en PDF", body: "Téléchargez ou imprimez votre planning en PDF, prêt à être affiché." },
      profile:      { title: "Personnalisez votre profil", body: "Modifiez votre nom, votre photo et vos informations de compte." },
      done:         { title: "C'est fait !", body: "Vous connaissez l'essentiel. Ce guide reste disponible à tout moment depuis Préférences → Aide." },
    },
  },
  en: {
    ui: {
      skip: "Skip",
      next: "Next",
      back: "Back",
      finish: "Finish",
      tryIt: "Try it — I'll move on automatically.",
      automatic: "Great, done! Moving on.",
      skipTitle: "Skip the guide?",
      skipBody: "You can restart it anytime from Preferences → Help.",
      skipConfirm: "Skip permanently",
      skipCancel: "Keep guiding",
      resume: "Continue the guide",
    },
    steps: {
      welcome:      { title: "Welcome to SmartPlanner", body: "This short guide teaches you your new planner by building it with you. « Skip » closes it anytime without removing anything." },
      overview:     { title: "Your overview", body: "This page summarises your stats, your today (schedule) and your daily tasks. You'll come back here every day." },
      quickactions: { title: "Your shortcuts", body: "From here you reach everything: fixed tasks, sleep schedule, preferences, generation and export." },
      courses:      { title: "Add your fixed courses", body: "A fixed course repeats weekly (classes, exams, work…). Add at least one: it's what feeds your schedule." },
      coursesDone:  { title: "Done!", body: "Your course is saved. The engine now knows your fixed constraints and can place them across the week." },
      todos:        { title: "Your daily tasks", body: "Add your tasks for the day and their difficulty. A task ticked \"Add to schedule\" is worked into your generated planner." },
      sleep:        { title: "Your sleep schedule", body: "Set your wake-up and bed times — same or different per day. The schedule will respect your rhythm." },
      preferences:  { title: "Your study preferences", body: "Choose your study rhythm, hours per day, interface theme and dark mode here, then save." },
      generate:     { title: "Generate your schedules", body: "Click \"Generate schedules\": the AI proposes 3 types (intensive, balanced, light)." },
      activate:     { title: "Activate your schedule", body: "Compare then activate the schedule that suits you. The active schedule shows on your dashboard." },
      statistics:   { title: "Your statistics", body: "Track your study hours, best day and distribution by subject and by schedule type." },
      export:       { title: "Export to PDF", body: "Download or print your schedule as PDF, ready to display." },
      profile:      { title: "Customise your profile", body: "Edit your name, photo and account information." },
      done:         { title: "That's it!", body: "You know the essentials. This guide stays available anytime from Preferences → Help." },
    },
  },
  ar: {
    ui: {
      skip: "تخطي",
      next: "التالي",
      back: "السابق",
      finish: "إنهاء",
      tryIt: "جرّب — سأتابع تلقائيًا.",
      automatic: "ممتاز، تم! سأتابع.",
      skipTitle: "تخطي الدليل؟",
      skipBody: "يمكنك إعادة تشغيله في أي وقت من التفضيلات ← المساعدة.",
      skipConfirm: "تخطي نهائيًا",
      skipCancel: "متابعة الدليل",
      resume: "متابعة الدليل",
    },
    steps: {
      welcome:      { title: "مرحبًا بك في SmartPlanner", body: "هذا الدليل القصير يعلّمك منصّة التنظيم الجديدة من خلال بنائها معك. زر «تخطي» يغلقه في أي وقت دون حذف أي شيء." },
      overview:     { title: "نظرة عامة", body: "تلخص هذه الصفحة إحصائياتك ويومك الحالي (البرنامج) ومهامك اليومية. ستعود إليها كل يوم." },
      quickactions: { title: "اختصاراتك", body: "من هنا تصل إلى كل شيء: المهام الثابتة، جدول النوم، التفضيلات، الإنشاء والتصدير." },
      courses:      { title: "أضف دروسك الثابتة", body: "الدرس الثابت يتكرر أسبوعيًا (دروس، امتحانات، عمل…). أضف درسًا واحدًا على الأقل: فهو الذي يغذي جدولك." },
      coursesDone:  { title: "ممتاز!", body: "تم حفظ درسك. أصبح المحرك يعرف قيودك الثابتة ويمكنه وضعها عبر الأسبوع." },
      todos:        { title: "مهامك اليومية", body: "أضف مهام يومك وصعوبتها. المهمة المحددة «إضافة إلى الجدول» تُدمج في خطتك المولدة." },
      sleep:        { title: "جدول نومك", body: "حدد أوقات الاستيقاظ والنوم — نفسها أو مختلفة لكل يوم. سيحترم الجدول إيقاعك." },
      preferences:  { title: "تفضيلات دراستك", body: "اختر إيقاع الدراسة وساعات اليوم ومظهر الواجهة والوضع الداكن هنا، ثم احفظ." },
      generate:     { title: "أنشئ جداولك", body: "انقر على «إنشاء الجداول»: يقترح الذكاء الاصطناعي 3 أنواع (مكثف، متوازن، خفيف)." },
      activate:     { title: "فعّل جدولك", body: "قارن ثم فعّل الجدول المناسب لك. يظهر الجدول النشط في لوحة التحكم." },
      statistics:   { title: "إحصائياتك", body: "تتبع ساعات دراستك وأفضل يوم وتوزيع الوقت حسب المادة ونوع الجدول." },
      export:       { title: "تصدير إلى PDF", body: "نزّل أو اطبع جدولك بصيغة PDF، جاهزًا للعرض." },
      profile:      { title: "خصص ملفك الشخصي", body: "عدّل اسمك وصورتك ومعلومات حسابك." },
      done:         { title: "انتهى الأمر!", body: "أنت تعرف الأساسيات. يبقى هذا الدليل متاحًا في أي وقت من التفضيلات ← المساعدة." },
    },
  },
};

const INTRO_ROUTE = /^\/dashboard/;

/** Full (unfiltered) step list — mirrors the real workflow, in order. */
const ALL_STEPS = [
  { key: "welcome",      path: "/dashboard",      target: "dash-greeting",     interactive: false },
  { key: "overview",     path: "/dashboard",      target: "dash-overview",     interactive: false },
  { key: "quickactions", path: "/dashboard",      target: "dash-actions",      interactive: false },
  { key: "courses",      path: "/fixed-events",   target: "courses-form",      interactive: true,  advanceOn: ["[data-course-row]"], after: "coursesDone" },
  { key: "coursesDone",  path: "/fixed-events",   target: "courses-list",      interactive: false },
  { key: "todos",        path: "/todos",          target: "todos-form",        interactive: true,  advanceOn: ["[data-todo-row]"] },
  { key: "sleep",        path: "/sleep-schedule", target: "sleep-form",        interactive: false },
  { key: "preferences",  path: "/preferences",    target: "prefs-theme",       interactive: false },
  { key: "generate",     path: "/schedules",      target: "schedules-generate",interactive: true,  advanceOn: ["[data-schedule-card]"] },
  { key: "activate",     path: "/schedules",      target: "schedules-card",    interactive: true,  advanceOn: ["[data-schedule-active]"] },
  { key: "statistics",   path: "/statistics",     target: "stats-kpi",         interactive: false },
  { key: "export",       path: "/export",         target: "export-btn",        interactive: false },
  { key: "profile",      path: "/profile",        target: "profile-info",      interactive: false },
  { key: "done",         path: "/dashboard",      target: "dash-greeting",     interactive: false, done: true },
];

function persistState(payload) {
  try {
    fetch("/tutorial/state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-XSRF-TOKEN": decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ""),
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (e) { /* ignore */ }
}

/*
 * AppLayout is re-mounted on every Inertia navigation (pages wrap it in JSX
 * rather than using a true persistent layout). To keep the guide open while
 * it walks the user across pages, its runtime state lives in module scope so
 * it survives those remounts. Full page reloads (fresh module) reset it.
 */
const KEEP = { open: false, pos: 0, dismissed: false };

export default function GuidedTour() {
  const { url, props } = usePage();
  const { tk } = useTheme();
  const { lang } = useLang();
  const t = GT[lang] || GT.fr;
  const isRTL = lang === "ar";

  /* Respect the operating system "reduce motion" preference: with it set, we
   * drop the spotlight cross-fade and tooltip transitions so the tour is
   * calmer for users with vestibular sensitivities. */
  const reducedMotion = typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tutorial = props.tutorial || null;
  const tourData = props.tourData || null;

  const [open, setOpen] = useState(() => KEEP.open);
  const [pos, setPos] = useState(() => KEEP.pos);
  const [skipModal, setSkipModal] = useState(false);
  const [dismissedSession, setDismissedSession] = useState(() => KEEP.dismissed);

  useEffect(() => {
    KEEP.open = open;
    KEEP.pos = pos;
    KEEP.dismissed = dismissedSession;
  }, [open, pos, dismissedSession]);
  const [rect, setRect] = useState(null);
  const [autoNote, setAutoNote] = useState(false);
  const dialogRef = useRef(null);

  /*
   * ALL_STEPS is the canonical, stable order. `pos` is an index into
   * ALL_STEPS and always resolves to a visible (non-skipped) step. Steps are
   * skipped only when the user already has that data — NEVER faked. Keeping
   * the list stable means adding data mid-tour (e.g. adding a course) does
   * not corrupt indexing: the just-completed step simply becomes skipped and
   * the tour advances naturally.
   */
  const skipKeys = useMemo(() => {
    const s = new Set();
    if (tourData) {
      if (tourData.has_courses)         { s.add("courses"); s.add("coursesDone"); }
      if (tourData.has_todos)             s.add("todos");
      if (tourData.has_schedule)          s.add("generate");
      if (tourData.has_active_schedule)   s.add("activate");
    }
    return s;
  }, [tourData]);

  const visibleSteps = useMemo(() => ALL_STEPS.filter(x => !skipKeys.has(x.key)), [skipKeys]);

  /* Current step = first visible (non-skipped) step at or after pos. */
  const current = useMemo(() => {
    for (let i = pos; i < ALL_STEPS.length; i++) {
      if (!skipKeys.has(ALL_STEPS[i].key)) return ALL_STEPS[i];
    }
    return ALL_STEPS[ALL_STEPS.length - 1];
  }, [pos, skipKeys]);

  /* Visible-position counter (0-based) of the current step. */
  const currentVisibleIdx = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < ALL_STEPS.length; i++) {
      if (skipKeys.has(ALL_STEPS[i].key)) continue;
      if (ALL_STEPS[i].key === current.key) return acc;
      acc++;
    }
    return 0;
  }, [current, skipKeys]);

  const total = visibleSteps.length;
  const span = current.done ? total : Math.min(currentVisibleIdx + 1, total);

  /* ── First-load step restoration from the server ────────────────── */
  const didKeepOpen = useRef(false);
  if (KEEP.open) didKeepOpen.current = true;
  useEffect(() => {
    if (!didKeepOpen.current && tutorial && tutorial.started && !tutorial.completed && !tutorial.skipped) {
      const saved = Math.min(tutorial.step || 0, ALL_STEPS.length - 1);
      if (saved >= 0 && saved < ALL_STEPS.length) setPos(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-start for brand-new users ─────────────────────────────── */
  const canIntro = tutorial && !tutorial.completed && !tutorial.skipped && !tutorial.started;
  useEffect(() => {
    if (!canIntro) return;
    const timer = setTimeout(() => {
      if (INTRO_ROUTE.test(url)) {
        openGuide("welcome");
      } else {
        router.visit("/dashboard");
      }
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canIntro, url]);

  /* ── "Start guide" event from Preferences ───────────────────────── */
  useEffect(() => {
    const handler = () => openGuide("welcome");
    window.addEventListener("smartplanner:tutorial:start", handler);
    return () => window.removeEventListener("smartplanner:tutorial:start", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openGuide(stepKey) {
    const idx = ALL_STEPS.findIndex(s => s.key === stepKey);
    const target = idx < 0 ? 0 : idx;
    setPos(target);
    setSkipModal(false);
    setAutoNote(false);
    setOpen(true);
    persistState({ started: true, step: target });
  }

  /* ── Navigate to the current step's page if not already there ───── */

  useEffect(() => {
    if (!open || !current) return;
    if (!url.startsWith(current.path)) {
      router.visit(current.path, { preserveState: true });
    }
  }, [open, pos, current, url]);

  /* ── Track target rect + scroll into view ───────────────────────── */
  useEffect(() => {
    if (!open || !current) return;
    if (!url.startsWith(current.path)) return;

    const find = () => current.target
      ? document.querySelector(`[data-tutorial-target="${current.target}"]`)
      : null;

    const update = () => {
      const el = find();
      setRect(el ? el.getBoundingClientRect() : null);
    };

    update();
    const t1 = setTimeout(update, 80);
    const iv = setInterval(update, 400);

    const scrollTimer = setInterval(() => {
      const el = find();
      if (el) { el.scrollIntoView({ block: "center", behavior: "smooth" }); clearInterval(scrollTimer); }
    }, 120);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearTimeout(t1); clearInterval(iv); clearInterval(scrollTimer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, pos, current, url]);

  /* ── Auto-advance when the user completes the action ────────────── */
  useEffect(() => {
    if (!open || !current || !current.advanceOn) return;
    const iv = setInterval(() => {
      const found = current.advanceOn.some(sel => document.querySelector(sel));
      if (found) {
        clearInterval(iv);
        setAutoNote(true);
        setTimeout(() => {
          setAutoNote(false);
          goToNext();
        }, 1000);
      }
    }, 500);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pos, current, url]);

  /* Focus management: keep it in the tooltip while open. */
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
  }, [open, pos]);

  if (!open) {
    /* Resume chip — never blocks; dismissible for the session only. */
    const canResume = tutorial && tutorial.started && !tutorial.completed && !tutorial.skipped
      && tutorial.step >= 0 && tutorial.step < ALL_STEPS.length - 1;
    if (canResume && !dismissedSession) {
      return createPortal(
        <button
          onClick={() => openGuide(current.key)}
          style={{
            position: "fixed", zIndex: 60, bottom: 18, insetInlineEnd: 18,
            display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12,
            background: tk.accent, color: tk.accentText, border: "none",
            fontSize: "var(--sp-text-base)", fontWeight: 600, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t.ui.resume}
          <span
            role="button"
            aria-label="x"
            onClick={(e) => { e.stopPropagation(); setDismissedSession(true); }}
            style={{ marginInlineStart: 4, opacity: 0.7, fontWeight: 700, fontSize: "var(--sp-text-sm)", padding: "0 4px" }}
          >✕</span>
        </button>,
        document.body
      );
    }
    return null;
  }

  if (!current) return null;

  const tip = t.steps[current.key] || {};
  const ui = t.ui;
  const isDone = current.done;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  /* Advance to the next visible (non-skipped) step. */
  const goToNext = () => {
    const curPos = ALL_STEPS.findIndex(s => s.key === current.key);
    let next = curPos + 1;
    while (next < ALL_STEPS.length && skipKeys.has(ALL_STEPS[next].key)) next++;
    if (next >= ALL_STEPS.length) next = ALL_STEPS.length - 1;
    setPos(next); setAutoNote(false); persistState({ step: next });
  };
  const handleNext = () => { if (isDone) finish(); else goToNext(); };
  const handleBack = () => {
    const curPos = ALL_STEPS.findIndex(s => s.key === current.key);
    let prev = curPos - 1;
    while (prev >= 0 && skipKeys.has(ALL_STEPS[prev].key)) prev--;
    if (prev >= 0) { setPos(prev); setAutoNote(false); persistState({ step: prev }); }
  };
  const finish = () => { persistState({ completed: true }); setOpen(false); };
  const confirmSkip = () => { persistState({ skipped: true }); setSkipModal(false); setOpen(false); };

  const accentHex = "#6366f1";
  const overlay = "rgba(0,0,0,0.55)";
  const boxW = isMobile ? "100%" : Math.min(340, Math.max(280, (typeof window !== "undefined" ? window.innerWidth : 360) - 40));
  const boxStyle = {
    background: tk.card, border: `1px solid ${tk.sidebarBorder}`, borderRadius: 14,
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)", padding: 16, boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  };

  return createPortal(
    <>
      {/* Spotlight overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }}>
        {rect && (
          <>
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: rect.top, background: overlay }} />
            <div style={{ position: "fixed", top: rect.top, left: 0, width: rect.left, height: Math.max(0, rect.bottom - rect.top), background: overlay }} />
            <div style={{ position: "fixed", top: rect.top, right: 0, width: (typeof window !== "undefined" ? window.innerWidth : 0) - rect.right, height: Math.max(0, rect.bottom - rect.top), background: overlay }} />
            <div style={{ position: "fixed", top: rect.bottom, left: 0, right: 0, bottom: 0, background: overlay }} />
            <div style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width, height: rect.height, borderRadius: 10, boxShadow: `0 0 0 2px ${accentHex}, 0 0 0 5px rgba(255,255,255,0.25)`, transition: reducedMotion ? "none" : "all 0.2s ease" }} />
          </>
        )}
      </div>

      {/* Tooltip / bottom sheet */}
      {isMobile ? (
        <div style={{ position: "fixed", inset: "auto 0 0 0", zIndex: 70, padding: 8, pointerEvents: "none" }}>
          <div ref={dialogRef} tabIndex={-1} role="dialog" aria-label={tip.title}
            style={{ ...boxStyle, pointerEvents: "auto", width: "100%" }}>
            <TooltipInner tip={tip} ui={ui} isDone={isDone} autoNote={autoNote} current={current} span={span} total={total}
              onNext={handleNext} onBack={handleBack} onSkip={() => setSkipModal(true)} isRTL={isRTL} tk={tk} />
          </div>
        </div>
      ) : rect ? (
        <div ref={dialogRef} tabIndex={-1} role="dialog" aria-label={tip.title}
          style={{ ...boxStyle, ...placeTooltip(rect, typeof window !== "undefined" ? window.innerWidth : 1000, typeof window !== "undefined" ? window.innerHeight : 800, parseInt(boxW, 10)), position: "fixed", zIndex: 70, pointerEvents: "auto" }}>
          <TooltipInner tip={tip} ui={ui} isDone={isDone} autoNote={autoNote} current={current} span={span} total={total}
            onNext={handleNext} onBack={handleBack} onSkip={() => setSkipModal(true)} isRTL={isRTL} tk={tk} />
        </div>
      ) : (
        <div ref={dialogRef} tabIndex={-1} role="dialog" aria-label={tip.title}
          style={{ ...boxStyle, position: "fixed", bottom: 24, left: isRTL ? 24 : "50%", transform: isRTL ? "none" : "translateX(-50%)", zIndex: 70, pointerEvents: "auto" }}>
          <TooltipInner tip={tip} ui={ui} isDone={isDone} autoNote={autoNote} current={current} span={span} total={total}
            onNext={handleNext} onBack={handleBack} onSkip={() => setSkipModal(true)} isRTL={isRTL} tk={tk} />
        </div>
      )}

      {/* Skip confirmation */}
      {skipModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "auto" }} onClick={() => setSkipModal(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", background: tk.card, border: `1px solid ${tk.sidebarBorder}`, borderRadius: 16, padding: 22, maxWidth: 360, boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "var(--sp-text-lg)", fontWeight: 700, color: tk.text }}>{ui.skipTitle}</h3>
            <p style={{ margin: "0 0 18px", fontSize: "var(--sp-text-base)", color: tk.textSecondary }}>{ui.skipBody}</p>
            <div style={{ display: "flex", flexDirection: isRTL ? "row-reverse" : "row", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => setSkipModal(false)} style={btn(tk, { flex: 1, background: tk.subtleBg, color: tk.text, border: `1px solid ${tk.sidebarBorder}` })}>{ui.skipCancel}</button>
              <button onClick={confirmSkip} style={btn(tk, { flex: 1, background: tk.danger, color: "#fff", border: "none" })}>{ui.skipConfirm}</button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

function TooltipInner({ tip, ui, isDone, autoNote, current, span, total, onNext, onBack, onSkip, isRTL, tk }) {
  const isLast = current.done;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontWeight: 800, fontSize: "var(--sp-text-sm)", color: "var(--sp-accent)" }}>SmartPlanner</span>
        <span style={{ marginInlineStart: "auto", fontSize: "var(--sp-text-xs)", fontWeight: 700, color: "var(--sp-textMuted)" }}>{span} / {total}</span>
      </div>
      <h2 style={{ margin: "0 0 6px", fontSize: "var(--sp-text-lg)", fontWeight: 800, color: tk.text }}>{tip.title}</h2>
      <p style={{ margin: "0 0 12px", fontSize: "var(--sp-text-base)", lineHeight: 1.5, color: tk.textSecondary }}>{tip.body}</p>
      {autoNote ? (
        <p style={{ margin: "0 0 12px", fontSize: "var(--sp-text-sm)", color: "var(--sp-success)", fontWeight: 700 }}>{ui.automatic}</p>
      ) : (current.interactive && (
        <p style={{ margin: "0 0 12px", fontSize: "var(--sp-text-sm)", color: "var(--sp-accent)", fontWeight: 700 }}>{ui.tryIt}</p>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRTL ? "row-reverse" : "row" }}>
        <button onClick={onSkip} style={btn(tk, { background: "none", border: "none", color: tk.textMuted })}>{ui.skip}</button>
        {!isLast && (
          <button onClick={onBack} disabled={span <= 1} style={btn(tk, { background: tk.subtleBg, color: tk.text, border: `1px solid ${tk.sidebarBorder}`, opacity: span <= 1 ? 0.4 : 1, cursor: span <= 1 ? "default" : "pointer" })}>{ui.back}</button>
        )}
        <button onClick={onNext} style={btn(tk, { marginInlineStart: "auto", background: tk.accent, color: tk.accentText, border: "none" })}>
          {isDone ? ui.finish : ui.next}
        </button>
      </div>
    </>
  );
}

function placeTooltip(rect, vw, vh, w) {
  const th = 240;
  const pad = 14;
  let top;
  if (rect.bottom + th + pad < vh) top = rect.bottom + pad;
  else if (rect.top - th - pad > 0) top = rect.top - th - pad;
  else top = 12;
  let left = rect.left + rect.width / 2 - w / 2;
  left = Math.max(10, Math.min(left, vw - w - 10));
  return { top, left };
}

function btn(tk, extra) {
  return { padding: "10px 14px", borderRadius: 10, fontSize: "var(--sp-text-base)", fontWeight: 600, cursor: "pointer", ...extra };
}
