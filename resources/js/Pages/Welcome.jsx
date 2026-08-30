import { Head, Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { useTheme, useLang } from "@/Pages/AppLayout";

/* ─── Landing page translations ──────────────────────────────
   The Welcome page is the first thing visitors see, so it must
   speak their language too. Structure mirrors the page sections;
   visual identity and layout are untouched — only words localize. */
const WT = {
    fr: {
        headTitle: "SmartPlanner - Planifiez vos études avec l'IA",
        login: "Se connecter",
        register: "Commencer gratuitement",
        heroBadge: "🎓 Conçu pour les étudiants",
        heroTitle1: "Planifiez vos études",
        heroAccent: "intelligemment avec l'IA",
        heroSub: "SmartPlanner génère automatiquement votre planning d'étude personnalisé selon vos cours, vos préférences et votre rythme de travail.",
        ctaPrimary: "🚀 Commencer gratuitement",
        ctaSecondary: "Se connecter →",
        stats: [
            { value: "3", label: "Types de planning" },
            { value: "100%", label: "Personnalisé" },
            { value: "PDF", label: "Export inclus" },
            { value: "IA", label: "Algorithme intelligent" },
        ],
        featBadge: "Fonctionnalités",
        featTitle: "Tout ce dont vous avez besoin",
        featSub: "Un outil complet pour organiser votre temps d'étude efficacement",
        feats: [
            { title: "Génération IA", desc: "Notre algorithme analyse vos cours fixes et génère automatiquement 3 plannings adaptés à votre rythme." },
            { title: "3 Types de planning", desc: "Choisissez entre Intensif (2h/session), Équilibré (1h/session) ou Léger (30min/session) selon votre énergie." },
            { title: "Préférences personnalisées", desc: "Définissez vos horaires de réveil, de coucher et votre moment préféré pour étudier (matin, journée, soir)." },
            { title: "Tableau de bord", desc: "Suivez votre programme du jour, vos créneaux d'étude et vos statistiques hebdomadaires en un coup d'œil." },
            { title: "Export PDF", desc: "Téléchargez votre planning en PDF imprimable." },
            { title: "Responsive", desc: "Accédez à votre planning depuis n'importe quel appareil : ordinateur, tablette ou smartphone." },
        ],
        howBadge: "Comment ça marche",
        howTitle: "Prêt en 3 étapes",
        howSub: "Commencez à planifier vos études en moins de 5 minutes",
        steps: [
            { title: "Ajoutez vos cours", desc: "Entrez vos cours fixes avec les jours et horaires. SmartPlanner les intègre dans votre planning." },
            { title: "Configurez vos préférences", desc: "Indiquez vos heures de réveil, coucher et votre style d'étude préféré." },
            { title: "Générez et exportez", desc: "L'IA génère 3 plannings optimisés. Activez celui qui vous convient et exportez-le." },
        ],
        typesBadge: "Nos plannings",
        typesTitle: "3 types adaptés à chaque étudiant",
        recommended: "⭐ Recommandé",
        types: [
            { max: "4 séances/jour", desc: "Pour les semaines chargées : des blocs longs et concentrés pour avancer vite.", tags: ["Focus", "Longues séances", "Examens"], recommended: false },
            { max: "3 séances/jour", desc: "Le meilleur compromis entre progression et temps libre.", tags: ["Régulier", "Équilibré"], recommended: true },
            { max: "2 séances/jour", desc: "Un rythme doux pour réviser sans vous épuiser.", tags: ["Détendu", "Léger"], recommended: false },
        ],
        ctaTitle: "Prêt à optimiser vos études ?",
        ctaSub: "Rejoignez SmartPlanner et laissez l'IA créer votre planning d'étude parfait. Gratuit, rapide et efficace.",
        ctaBtn: "🚀 Créer mon compte gratuit",
        ctaBtnSec: "J'ai déjà un compte",
        footerText: "© 2026 SmartPlanner · Planification d'études intelligente par IA",
        footerLogin: "Connexion",
        footerRegister: "Inscription",
        footerPrivacy: "Confidentialité",
        footerTerms: "Conditions",
    },
    en: {
        headTitle: "SmartPlanner - Plan your studies with AI",
        login: "Log in",
        register: "Get started free",
        heroBadge: "🎓 Built for students",
        heroTitle1: "Plan your studies",
        heroAccent: "smartly with AI",
        heroSub: "SmartPlanner automatically generates your personalised study schedule based on your courses, preferences and working rhythm.",
        ctaPrimary: "🚀 Get started free",
        ctaSecondary: "Log in →",
        stats: [
            { value: "3", label: "Schedule types" },
            { value: "100%", label: "Personalised" },
            { value: "PDF", label: "Export included" },
            { value: "AI", label: "Smart algorithm" },
        ],
        featBadge: "Features",
        featTitle: "Everything you need",
        featSub: "A complete tool to organise your study time efficiently",
        feats: [
            { title: "AI generation", desc: "Our algorithm analyses your fixed courses and automatically generates 3 schedules tailored to your rhythm." },
            { title: "3 schedule types", desc: "Choose between Intensive (2h/session), Balanced (1h/session) or Light (30min/session) depending on your energy." },
            { title: "Personal preferences", desc: "Set your wake-up and bedtime hours and your preferred time to study (morning, day, evening)." },
            { title: "Dashboard", desc: "Track today's programme, your study slots and weekly statistics at a glance." },
            { title: "PDF export", desc: "Download your schedule as a printable PDF." },
            { title: "Responsive", desc: "Access your schedule from any device: computer, tablet or smartphone." },
        ],
        howBadge: "How it works",
        howTitle: "Ready in 3 steps",
        howSub: "Start planning your studies in less than 5 minutes",
        steps: [
            { title: "Add your courses", desc: "Enter your fixed courses with days and times. SmartPlanner fits them into your schedule." },
            { title: "Set your preferences", desc: "Tell us your wake-up, bedtime and preferred study style." },
            { title: "Generate & export", desc: "The AI generates 3 optimised schedules. Activate the one that suits you and export it." },
        ],
        typesBadge: "Our schedules",
        typesTitle: "3 types suited to every student",
        recommended: "⭐ Recommended",
        types: [
            { max: "4 sessions/day", desc: "For busy weeks: long focused blocks to move forward fast.", tags: ["Focus", "Long sessions", "Exams"], recommended: false },
            { max: "3 sessions/day", desc: "The best balance between progress and free time.", tags: ["Steady", "Balanced"], recommended: true },
            { max: "2 sessions/day", desc: "A gentle pace to revise without burning out.", tags: ["Relaxed", "Light"], recommended: false },
        ],
        ctaTitle: "Ready to boost your studies?",
        ctaSub: "Join SmartPlanner and let AI create your perfect study schedule. Free, fast and effective.",
        ctaBtn: "🚀 Create my free account",
        ctaBtnSec: "I already have an account",
        footerText: "© 2026 SmartPlanner · Smart AI-powered study planning",
        footerLogin: "Log in",
        footerRegister: "Sign up",
        footerPrivacy: "Privacy",
        footerTerms: "Terms",
    },
    ar: {
        headTitle: "سمارت بلانر - خطط لدراستك بالذكاء الاصطناعي",
        login: "تسجيل الدخول",
        register: "ابدأ مجانًا",
        heroBadge: "🎓 مصمم للطلاب",
        heroTitle1: "خطط لدراستك",
        heroAccent: "بذكاء مع الذكاء الاصطناعي",
        heroSub: "ينشئ سمارت بلانر جدول دراستك المخصص تلقائيًا بناءً على موادك وتفضيلاتك وإيقاع عملك.",
        ctaPrimary: "🚀 ابدأ مجانًا",
        ctaSecondary: "تسجيل الدخول ←",
        stats: [
            { value: "3", label: "أنواع جداول" },
            { value: "100%", label: "مخصص لك" },
            { value: "PDF", label: "تصدير مضمّن" },
            { value: "AI", label: "خوارزمية ذكية" },
        ],
        featBadge: "الميزات",
        featTitle: "كل ما تحتاجه",
        featSub: "أداة متكاملة لتنظيم وقت دراستك بكفاءة",
        feats: [
            { title: "توليد بالذكاء الاصطناعي", desc: "تحلل خوارزميتنا موادك الثابتة وتنشئ تلقائيًا 3 جداول تناسب إيقاعك." },
            { title: "3 أنواع من الجداول", desc: "اختر بين المكثف (ساعتان/جلسة) أو المتوازن (ساعة/جلسة) أو الخفيف (30 دقيقة/جلسة) حسب طاقتك." },
            { title: "تفضيلات شخصية", desc: "حدد أوقات استيقاظك ونومك ووقتك المفضل للدراسة (صباحًا، نهارًا، مساءً)." },
            { title: "لوحة التحكم", desc: "تابع برنامج اليوم وفترات دراستك وإحصاءاتك الأسبوعية بنظرة واحدة." },
            { title: "تصدير PDF", desc: "حمّل جدولك كملف PDF قابل للطباعة." },
            { title: "متجاوب", desc: "ادخل إلى جدولك من أي جهاز: حاسوب أو لوحي أو هاتف ذكي." },
        ],
        howBadge: "كيف يعمل",
        howTitle: "جاهز في 3 خطوات",
        howSub: "ابدأ التخطيط لدراستك في أقل من 5 دقائق",
        steps: [
            { title: "أضف موادك", desc: "أدخل موادك الثابتة مع الأيام والأوقات، وسيدمجها سمارت بلانر في جدولك." },
            { title: "اضبط تفضيلاتك", desc: "حدد أوقات استيقاظك ونومك وأسلوب دراستك المفضل." },
            { title: "ولّد وصدّر", desc: "ينشئ الذكاء الاصطناعي 3 جداول محسّنة. فعّل ما يناسبك وصدّره." },
        ],
        typesBadge: "جداولنا",
        typesTitle: "3 أنواع تناسب كل طالب",
        recommended: "⭐ موصى به",
        types: [
            { max: "4 حصص/يوم", desc: "للأسابيع المزدحمة: جلسات طويلة ومركزة للتقدم بسرعة.", tags: ["تركيز", "جلسات طويلة", "امتحانات"], recommended: false },
            { max: "3 حصص/يوم", desc: "أفضل توازن بين التقدم والوقت الحر.", tags: ["منتظم", "متوازن"], recommended: true },
            { max: "2 حصة/يوم", desc: "إيقاع هادئ للمراجعة دون إرهاق.", tags: ["هادئ", "خفيف"], recommended: false },
        ],
        ctaTitle: "مستعد لتحسين دراستك؟",
        ctaSub: "انضم إلى سمارت بلانر ودع الذكاء الاصطناعي ينشئ جدول دراستك المثالي. مجاني وسريع وفعال.",
        ctaBtn: "🚀 أنشئ حسابي المجاني",
        ctaBtnSec: "لدي حساب بالفعل",
        footerText: "© 2026 سمارت بلانر · تخطيط دراسي ذكي بالذكاء الاصطناعي",
        footerLogin: "دخول",
        footerRegister: "تسجيل",
        footerPrivacy: "الخصوصية",
        footerTerms: "الشروط",
    },
};

export default function Welcome({ canLogin, canRegister }) {
    const { tk } = useTheme();
    // This page renders OUTSIDE AppLayout (no LangProvider above it),
    // so read the stored language the same way Preferences does.
    const { lang: ctxLang } = useLang();
    let lang = ctxLang || "fr";
    if (typeof window !== "undefined") {
        lang = localStorage.getItem("smartplanner_lang") || lang;
    }
    // Fall back to French so the landing page never renders half-translated.
    const tr = WT[lang] || WT.fr;
    const s = makeStyles(tk);

    return (
        <>
            <Head title={tr.headTitle}>
                {(() => {
                    const origin = typeof window !== "undefined" ? window.location.origin : "";
                    return (
                        <>
                            <meta name="description" content={tr.heroSub} />
                            <meta property="og:title" content={tr.headTitle} />
                            <meta property="og:description" content={tr.heroSub} />
                            <meta property="og:type" content="website" />
                            <meta property="og:url" content={origin + "/"} />
                            <meta name="twitter:card" content="summary" />
                            <meta name="twitter:title" content={tr.headTitle} />
                            <meta name="twitter:description" content={tr.heroSub} />
                            <script type="application/ld+json">{JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "WebSite",
                                "name": "SmartPlanner",
                                "url": origin + "/",
                            })}</script>
                        </>
                    );
                })()}
            </Head>
            <div style={s.root} dir={lang === "ar" ? "rtl" : "ltr"}>

                {/* NAVBAR */}
                <nav style={s.nav}>
                    <div style={s.navInner}>
                        <div style={s.logo}>
                            <ApplicationLogo size={34} />
                            <span style={s.logoText}>SmartPlanner</span>
                        </div>
                        <div style={s.navLinks}>
                            {canLogin && (
                                <Link href="/login" style={s.navLogin}>{tr.login}</Link>
                            )}
                            {canRegister && (
                                <Link href="/register" style={s.navRegister}>{tr.register}</Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO */}
                <section style={s.hero}>
                    <div style={s.heroInner}>
                        <div style={s.heroBadge}>{tr.heroBadge}</div>
                        <h1 style={s.heroTitle}>
                            {tr.heroTitle1}<br />
                            <span style={s.heroAccent}>{tr.heroAccent}</span>
                        </h1>
                        <p style={s.heroSub}>
                            {tr.heroSub}
                        </p>
                        <div style={s.heroBtns}>
                            {canRegister && (
                                <Link href="/register" style={s.btnPrimary}>
                                    {tr.ctaPrimary}
                                </Link>
                            )}
                            {canLogin && (
                                <Link href="/login" style={s.btnSecondary}>
                                    {tr.ctaSecondary}
                                </Link>
                            )}
                        </div>

                        {/* Stats */}
                        <div style={s.heroStats}>
                            {tr.stats.map((stat, i) => (
                                <div key={i} style={{
                                    ...s.heroStat,
                                    borderInlineEnd: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none"
                                }}>
                                    <span style={s.heroStatVal}>{stat.value}</span>
                                    <span style={s.heroStatLabel}>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={s.blob1} />
                    <div style={s.blob2} />
                </section>

                {/* FEATURES */}
                <section style={s.features}>
                    <div style={s.sectionInner}>
                        <div style={s.sectionBadge}>{tr.featBadge}</div>
                        <h2 style={s.sectionTitle}>{tr.featTitle}</h2>
                        <p style={s.sectionSub}>{tr.featSub}</p>

                        <div style={s.featGrid}>
                            {[
                                { icon: "🤖", color: tk.accent, bg: tk.accentLight },
                                { icon: "📅", color: "var(--sp-type-equilibre-fg)", bg: "var(--sp-type-equilibre)" },
                                { icon: "⚙️", color: "var(--sp-warning)", bg: "var(--sp-warningBg)" },
                                { icon: "📊", color: "var(--sp-type-leger-fg)", bg: "var(--sp-type-leger)" },
                                { icon: "📤", color: "var(--sp-danger)", bg: "var(--sp-dangerBg)" },
                                { icon: "📱", color: "var(--sp-accent)", bg: "var(--sp-accentLight)" },
                            ].map((feat, i) => (
                                <div key={i} style={s.featCard}>
                                    <div style={{ ...s.featIcon, background: feat.bg }}>
                                        <span style={{ fontSize: "24px" }}>{feat.icon}</span>
                                    </div>
                                    <h3 style={{ ...s.featTitle, color: feat.color }}>{tr.feats[i].title}</h3>
                                    <p style={s.featDesc}>{tr.feats[i].desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section style={s.howSection}>
                    <div style={s.sectionInner}>
                        <div style={s.sectionBadge}>{tr.howBadge}</div>
                        <h2 style={s.sectionTitle}>{tr.howTitle}</h2>
                        <p style={s.sectionSub}>{tr.howSub}</p>

                        <div style={s.stepsRow}>
                            {[
                                { step: "01", icon: "📚" },
                                { step: "02", icon: "⚙️" },
                                { step: "03", icon: "🚀" },
                            ].map((step, i) => (
                                <div key={i} style={s.stepCard}>
                                    <div style={s.stepNumber}>{step.step}</div>
                                    <div style={s.stepIconBox}>{step.icon}</div>
                                    <h3 style={s.stepTitle}>{tr.steps[i].title}</h3>
                                    <p style={s.stepDesc}>{tr.steps[i].desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PLANNING TYPES */}
                <section style={s.typesSection}>
                    <div style={s.sectionInner}>
                        <div style={s.sectionBadge}>{tr.typesBadge}</div>
                        <h2 style={s.sectionTitle}>{tr.typesTitle}</h2>

                        <div style={s.typesGrid}>
                            {[
                                { icon: "🔥", type: "Intensif", color: "var(--sp-type-intensif-fg)", bg: "var(--sp-type-intensif)", border: "var(--sp-type-intensif-fg)", sessions: 4 },
                                { icon: "⚖️", type: "Équilibré", color: "var(--sp-type-equilibre-fg)", bg: "var(--sp-type-equilibre)", border: "var(--sp-type-equilibre-fg)", sessions: 3 },
                                { icon: "🍃", type: "Léger", color: "var(--sp-type-leger-fg)", bg: "var(--sp-type-leger)", border: "var(--sp-type-leger-fg)", sessions: 2 },
                            ].map((t, i) => {
                                const info = tr.types[i] || {};
                                return (
                                    <div key={i} style={{ ...s.typeCard, border: `2px solid ${info.recommended ? t.color : t.border}`, background: info.recommended ? t.bg : tk.card }}>
                                        {info.recommended && (
                                            <div style={{ ...s.recommendedBadge, background: t.color }}>{tr.recommended}</div>
                                        )}
                                        <div style={s.typeIcon}>{t.icon}</div>
                                        <h3 style={{ ...s.typeTitle, color: t.color }}>{t.type}</h3>
                                        <div style={s.typeStats}>
                                            <span style={{ ...s.typeStat, background: t.bg, color: t.color }}>{t.sessions}</span>
                                            <span style={{ ...s.typeStat, background: t.bg, color: t.color }}>{info.max}</span>
                                        </div>
                                        <p style={s.typeDesc}>{info.desc}</p>
                                        <div style={s.typeTags}>
                                            {(info.tags || []).map((tag, j) => (
                                                <span key={j} style={s.typeTag}>{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={s.ctaSection}>
                    <div style={s.ctaInner}>
                        <div style={s.ctaIcon}>⚡</div>
                        <h2 style={s.ctaTitle}>{tr.ctaTitle}</h2>
                        <p style={s.ctaSub}>
                            {tr.ctaSub}
                        </p>
                        <div style={s.ctaBtns}>
                            {canRegister && (
                                <Link href="/register" style={s.ctaBtn}>{tr.ctaBtn}</Link>
                            )}
                            {canLogin && (
                                <Link href="/login" style={s.ctaBtnSecondary}>{tr.ctaBtnSec}</Link>
                            )}
                        </div>
                    </div>
                    <div style={s.ctaBlob} />
                </section>

                {/* FOOTER */}
                <footer style={s.footer}>
                    <div style={s.footerInner}>
                        <div style={s.footerLogo}>
                            <ApplicationLogo size={28} />
                            <span style={{ ...s.logoText, fontSize: "14px" }}>SmartPlanner</span>
                        </div>
                        <p style={s.footerText}>{tr.footerText}</p>
                        <div style={s.footerLinks}>
                            {canLogin && <Link href="/login" style={s.footerLink}>{tr.footerLogin}</Link>}
                            {canRegister && <Link href="/register" style={s.footerLink}>{tr.footerRegister}</Link>}
                            <Link href="/privacy" style={s.footerLink}>{tr.footerPrivacy}</Link>
                            <Link href="/terms" style={s.footerLink}>{tr.footerTerms}</Link>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}

function makeStyles(tk) {
    return {
        root: { fontFamily: "'DM Sans', sans-serif", background: tk.body, minHeight: "100vh", overflowX: "hidden" },
        nav: { position: "sticky", top: 0, zIndex: 100, background: tk.topbarBg, backdropFilter: "blur(10px)", borderBottom: `1px solid ${tk.subtleBg}` },
        navInner: { maxWidth: "1100px", margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
        logo: { display: "flex", alignItems: "center", gap: "10px" },
        logoIcon: { width: "34px", height: "34px", background: tk.accent, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
        logoText: { fontSize: "16px", fontWeight: 800, color: tk.text, letterSpacing: "-0.02em" },
        navLinks: { display: "flex", alignItems: "center", gap: "12px" },
        navLogin: { fontSize: "13px", fontWeight: 600, color: tk.textSecondary, textDecoration: "none", padding: "8px 16px" },
        navRegister: { fontSize: "13px", fontWeight: 600, color: "#fff", background: tk.accent, padding: "8px 18px", borderRadius: "8px", textDecoration: "none" },
        hero: { position: "relative", background: "linear-gradient(135deg, #667eea 0%, #4F46E5 50%, #7C3AED 100%)", padding: "100px 24px 80px", overflow: "hidden" },
        heroInner: { maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 },
        heroBadge: { display: "inline-block", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, marginBottom: "24px" },
        heroTitle: { fontSize: "52px", fontWeight: 900, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 20px" },
        heroAccent: { color: "#A5B4FC" },
        heroSub: { fontSize: "18px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto 36px" },
        heroBtns: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "56px" },
        btnPrimary: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", background: "#fff", color: tk.accent, borderRadius: "12px", fontSize: "15px", fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" },
        btnSecondary: { display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "12px", fontSize: "15px", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)" },
        heroStats: { display: "flex", justifyContent: "center", background: "rgba(255,255,255,0.1)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)", overflow: "hidden" },
        heroStat: { flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center" },
        heroStatVal: { fontSize: "24px", fontWeight: 900, color: "#fff" },
        heroStatLabel: { fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px", fontWeight: 500 },
        blob1: { position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: "-100px", right: "-100px", zIndex: 1 },
        blob2: { position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: "-80px", left: "-80px", zIndex: 1 },
        features: { padding: "80px 0", background: tk.body },
        sectionInner: { maxWidth: "1100px", margin: "0 auto", padding: "0 24px" },
        sectionBadge: { display: "inline-block", background: tk.accentLight, color: tk.accent, padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" },
        sectionTitle: { fontSize: "36px", fontWeight: 800, color: tk.text, letterSpacing: "-0.02em", margin: "0 0 12px" },
        sectionSub: { fontSize: "16px", color: tk.textSecondary, margin: "0 0 48px", maxWidth: "500px" },
        featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
        featCard: { background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: "16px", padding: "28px 24px" },
        featIcon: { width: "52px", height: "52px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
        featTitle: { fontSize: "16px", fontWeight: 700, margin: "0 0 8px" },
        featDesc: { fontSize: "13px", color: tk.textSecondary, lineHeight: 1.6, margin: 0 },
        howSection: { padding: "80px 0", background: tk.card },
        stepsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" },
        stepCard: { background: tk.body, border: `1px solid ${tk.cardBorder}`, borderRadius: "16px", padding: "32px 24px", textAlign: "center", position: "relative" },
        stepNumber: { position: "absolute", top: "16px", left: "20px", fontSize: "11px", fontWeight: 800, color: tk.textMuted, letterSpacing: "0.05em" },
        stepIconBox: { fontSize: "36px", marginBottom: "16px" },
        stepTitle: { fontSize: "16px", fontWeight: 700, color: tk.text, margin: "0 0 8px" },
        stepDesc: { fontSize: "13px", color: tk.textSecondary, lineHeight: 1.6, margin: 0 },
        typesSection: { padding: "80px 0", background: tk.body },
        typesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
        typeCard: { borderRadius: "16px", padding: "28px 24px", position: "relative" },
        recommendedBadge: { position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "20px", whiteSpace: "nowrap" },
        typeIcon: { fontSize: "36px", marginBottom: "12px" },
        typeTitle: { fontSize: "20px", fontWeight: 800, margin: "0 0 12px" },
        typeStats: { display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" },
        typeStat: { fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" },
        typeDesc: { fontSize: "13px", color: tk.textSecondary, lineHeight: 1.6, margin: "0 0 16px" },
        typeTags: { display: "flex", gap: "6px", flexWrap: "wrap" },
        typeTag: { fontSize: "11px", background: tk.subtleBg, color: tk.textSecondary, padding: "3px 10px", borderRadius: "20px" },
        ctaSection: { padding: "80px 24px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", textAlign: "center", position: "relative", overflow: "hidden" },
        ctaInner: { maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 2 },
        ctaIcon: { fontSize: "48px", marginBottom: "20px" },
        ctaTitle: { fontSize: "36px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 16px" },
        ctaSub: { fontSize: "16px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: "0 0 36px" },
        ctaBtns: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
        ctaBtn: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", background: "#fff", color: tk.accent, borderRadius: "12px", fontSize: "15px", fontWeight: 700, textDecoration: "none" },
        ctaBtnSecondary: { display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "12px", fontSize: "15px", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)" },
        ctaBlob: { position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: "-200px", right: "-100px" },
        footer: { background: tk.sidebarBg, padding: "28px 24px" },
        footerInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
        footerText: { fontSize: "12px", color: tk.textSecondary, margin: 0 },
        footerLinks: { display: "flex", gap: "16px" },
        footerLink: { fontSize: "12px", color: tk.textMuted, textDecoration: "none", fontWeight: 500 },
        footerLogo: { display: "flex", alignItems: "center", gap: "8px" },
    };
}
