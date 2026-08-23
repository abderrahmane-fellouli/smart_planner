import { Head, Link } from "@inertiajs/react";

export default function Welcome({ canLogin, canRegister }) {
    return (
        <>
            <Head title="SmartPlanner - Planifiez vos études avec l'IA" />
            <div style={s.root}>

                {/* NAVBAR */}
                <nav style={s.nav}>
                    <div style={s.navInner}>
                        <div style={s.logo}>
                            <div style={s.logoIcon}>
                                <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span style={s.logoText}>SmartPlanner</span>
                        </div>
                        <div style={s.navLinks}>
                            {canLogin && (
                                <Link href="/login" style={s.navLogin}>Se connecter</Link>
                            )}
                            {canRegister && (
                                <Link href="/register" style={s.navRegister}>Commencer gratuitement</Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO */}
                <section style={s.hero}>
                    <div style={s.heroInner}>
                        <div style={s.heroBadge}>🎓 Conçu pour les étudiants</div>
                        <h1 style={s.heroTitle}>
                            Planifiez vos études<br />
                            <span style={s.heroAccent}>intelligemment avec l'IA</span>
                        </h1>
                        <p style={s.heroSub}>
                            SmartPlanner génère automatiquement votre planning d'étude personnalisé
                            selon vos cours, vos préférences et votre rythme de travail.
                        </p>
                        <div style={s.heroBtns}>
                            {canRegister && (
                                <Link href="/register" style={s.btnPrimary}>
                                    🚀 Commencer gratuitement
                                </Link>
                            )}
                            {canLogin && (
                                <Link href="/login" style={s.btnSecondary}>
                                    Se connecter →
                                </Link>
                            )}
                        </div>

                        {/* Stats */}
                        <div style={s.heroStats}>
                            {[
                                { value: "3", label: "Types de planning" },
                                { value: "100%", label: "Personnalisé" },
                                { value: "PDF", label: "Export inclus" },
                                { value: "IA", label: "Algorithme intelligent" },
                            ].map((stat, i) => (
                                <div key={i} style={{
                                    ...s.heroStat,
                                    borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none"
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
                        <div style={s.sectionBadge}>Fonctionnalités</div>
                        <h2 style={s.sectionTitle}>Tout ce dont vous avez besoin</h2>
                        <p style={s.sectionSub}>Un outil complet pour organiser votre temps d'étude efficacement</p>

                        <div style={s.featGrid}>
                            {[
                                { icon: "🤖", title: "Génération IA", desc: "Notre algorithme analyse vos cours fixes et génère automatiquement 3 plannings adaptés à votre rythme.", color: "#4F46E5", bg: "#EEF2FF" },
                                { icon: "📅", title: "3 Types de planning", desc: "Choisissez entre Intensif (2h/session), Équilibré (1h/session) ou Léger (30min/session) selon votre énergie.", color: "#10B981", bg: "#ECFDF5" },
                                { icon: "⚙️", title: "Préférences personnalisées", desc: "Définissez vos horaires de réveil, de coucher et votre moment préféré pour étudier (matin, journée, soir).", color: "#F59E0B", bg: "#FFFBEB" },
                                { icon: "📊", title: "Tableau de bord", desc: "Suivez votre programme du jour, vos créneaux d'étude et vos statistiques hebdomadaires en un coup d'œil.", color: "#3B82F6", bg: "#EFF6FF" },
                                { icon: "📤", title: "Export PDF", desc: "Téléchargez votre planning en PDF imprimable.", color: "#EF4444", bg: "#FEF2F2" },
                                { icon: "📱", title: "Responsive", desc: "Accédez à votre planning depuis n'importe quel appareil : ordinateur, tablette ou smartphone.", color: "#8B5CF6", bg: "#F5F3FF" },
                            ].map((feat, i) => (
                                <div key={i} style={s.featCard}>
                                    <div style={{ ...s.featIcon, background: feat.bg }}>
                                        <span style={{ fontSize: "24px" }}>{feat.icon}</span>
                                    </div>
                                    <h3 style={{ ...s.featTitle, color: feat.color }}>{feat.title}</h3>
                                    <p style={s.featDesc}>{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section style={s.howSection}>
                    <div style={s.sectionInner}>
                        <div style={s.sectionBadge}>Comment ça marche</div>
                        <h2 style={s.sectionTitle}>Prêt en 3 étapes</h2>
                        <p style={s.sectionSub}>Commencez à planifier vos études en moins de 5 minutes</p>

                        <div style={s.stepsRow}>
                            {[
                                { step: "01", title: "Ajoutez vos cours", desc: "Entrez vos cours fixes avec les jours et horaires. SmartPlanner les intègre dans votre planning.", icon: "📚" },
                                { step: "02", title: "Configurez vos préférences", desc: "Indiquez vos heures de réveil, coucher et votre style d'étude préféré.", icon: "⚙️" },
                                { step: "03", title: "Générez et exportez", desc: "L'IA génère 3 plannings optimisés. Activez celui qui vous convient et exportez-le.", icon: "🚀" },
                            ].map((step, i) => (
                                <div key={i} style={s.stepCard}>
                                    <div style={s.stepNumber}>{step.step}</div>
                                    <div style={s.stepIconBox}>{step.icon}</div>
                                    <h3 style={s.stepTitle}>{step.title}</h3>
                                    <p style={s.stepDesc}>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PLANNING TYPES */}
                <section style={s.typesSection}>
                    <div style={s.sectionInner}>
                        <div style={s.sectionBadge}>Nos plannings</div>
                        <h2 style={s.sectionTitle}>3 types adaptés à chaque étudiant</h2>

                        <div style={s.typesGrid}>
                            {[
                                { icon: "🔥", type: "Intensif", color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", sessions: "2h / session", max: "4 sessions / jour", desc: "Pour les périodes d'examens ou quand vous avez besoin d'un maximum de productivité.", tags: ["Examens", "Révisions intenses", "Maximum productivité"] },
                                { icon: "⚖️", type: "Équilibré", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", sessions: "1h / session", max: "3 sessions / jour", desc: "Le planning idéal pour une semaine normale. Productif sans s'épuiser.", tags: ["Usage quotidien", "Equilibre", "Recommandé"], recommended: true },
                                { icon: "🍃", type: "Léger", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", sessions: "30min / session", max: "2 sessions / jour", desc: "Parfait pour maintenir le rythme sans surcharge. Idéal en fin de semaine.", tags: ["Révisions douces", "Week-end", "Décompression"] },
                            ].map((t, i) => (
                                <div key={i} style={{ ...s.typeCard, border: `2px solid ${t.recommended ? t.color : t.border}`, background: t.recommended ? t.bg : "#fff" }}>
                                    {t.recommended && (
                                        <div style={{ ...s.recommendedBadge, background: t.color }}>⭐ Recommandé</div>
                                    )}
                                    <div style={s.typeIcon}>{t.icon}</div>
                                    <h3 style={{ ...s.typeTitle, color: t.color }}>{t.type}</h3>
                                    <div style={s.typeStats}>
                                        <span style={{ ...s.typeStat, background: t.bg, color: t.color }}>{t.sessions}</span>
                                        <span style={{ ...s.typeStat, background: t.bg, color: t.color }}>{t.max}</span>
                                    </div>
                                    <p style={s.typeDesc}>{t.desc}</p>
                                    <div style={s.typeTags}>
                                        {t.tags.map((tag, j) => (
                                            <span key={j} style={s.typeTag}>{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={s.ctaSection}>
                    <div style={s.ctaInner}>
                        <div style={s.ctaIcon}>⚡</div>
                        <h2 style={s.ctaTitle}>Prêt à optimiser vos études ?</h2>
                        <p style={s.ctaSub}>
                            Rejoignez SmartPlanner et laissez l'IA créer votre planning d'étude parfait.
                            Gratuit, rapide et efficace.
                        </p>
                        <div style={s.ctaBtns}>
                            {canRegister && (
                                <Link href="/register" style={s.ctaBtn}>🚀 Créer mon compte gratuit</Link>
                            )}
                            {canLogin && (
                                <Link href="/login" style={s.ctaBtnSecondary}>J'ai déjà un compte</Link>
                            )}
                        </div>
                    </div>
                    <div style={s.ctaBlob} />
                </section>

                {/* FOOTER */}
                <footer style={s.footer}>
                    <div style={s.footerInner}>
                        <div style={s.footerLogo}>
                            <div style={s.logoIcon}>
                                <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span style={{ ...s.logoText, fontSize: "14px" }}>SmartPlanner</span>
                        </div>
                        <p style={s.footerText}>© 2026 SmartPlanner · Planification d'études intelligente par IA</p>
                        <div style={s.footerLinks}>
                            {canLogin && <Link href="/login" style={s.footerLink}>Connexion</Link>}
                            {canRegister && <Link href="/register" style={s.footerLink}>Inscription</Link>}
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}

const s = {
    root: { fontFamily: "'DM Sans', sans-serif", background: "#fff", minHeight: "100vh", overflowX: "hidden" },
    nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #F3F4F6" },
    navInner: { maxWidth: "1100px", margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { display: "flex", alignItems: "center", gap: "10px" },
    logoIcon: { width: "34px", height: "34px", background: "#4F46E5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    logoText: { fontSize: "16px", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" },
    navLinks: { display: "flex", alignItems: "center", gap: "12px" },
    navLogin: { fontSize: "13px", fontWeight: 600, color: "#6B7280", textDecoration: "none", padding: "8px 16px" },
    navRegister: { fontSize: "13px", fontWeight: 600, color: "#fff", background: "#4F46E5", padding: "8px 18px", borderRadius: "8px", textDecoration: "none" },
    hero: { position: "relative", background: "linear-gradient(135deg, #667eea 0%, #4F46E5 50%, #7C3AED 100%)", padding: "100px 24px 80px", overflow: "hidden" },
    heroInner: { maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 },
    heroBadge: { display: "inline-block", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, marginBottom: "24px" },
    heroTitle: { fontSize: "52px", fontWeight: 900, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 20px" },
    heroAccent: { color: "#A5B4FC" },
    heroSub: { fontSize: "18px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto 36px" },
    heroBtns: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "56px" },
    btnPrimary: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", background: "#fff", color: "#4F46E5", borderRadius: "12px", fontSize: "15px", fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" },
    btnSecondary: { display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "12px", fontSize: "15px", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)" },
    heroStats: { display: "flex", justifyContent: "center", background: "rgba(255,255,255,0.1)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)", overflow: "hidden" },
    heroStat: { flex: 1, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center" },
    heroStatVal: { fontSize: "24px", fontWeight: 900, color: "#fff" },
    heroStatLabel: { fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "2px", fontWeight: 500 },
    blob1: { position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: "-100px", right: "-100px", zIndex: 1 },
    blob2: { position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: "-80px", left: "-80px", zIndex: 1 },
    features: { padding: "80px 0", background: "#F9FAFB" },
    sectionInner: { maxWidth: "1100px", margin: "0 auto", padding: "0 24px" },
    sectionBadge: { display: "inline-block", background: "#EEF2FF", color: "#4F46E5", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" },
    sectionTitle: { fontSize: "36px", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", margin: "0 0 12px" },
    sectionSub: { fontSize: "16px", color: "#6B7280", margin: "0 0 48px", maxWidth: "500px" },
    featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
    featCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "28px 24px" },
    featIcon: { width: "52px", height: "52px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
    featTitle: { fontSize: "16px", fontWeight: 700, margin: "0 0 8px" },
    featDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: 0 },
    howSection: { padding: "80px 0", background: "#fff" },
    stepsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" },
    stepCard: { background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "32px 24px", textAlign: "center", position: "relative" },
    stepNumber: { position: "absolute", top: "16px", left: "20px", fontSize: "11px", fontWeight: 800, color: "#D1D5DB", letterSpacing: "0.05em" },
    stepIconBox: { fontSize: "36px", marginBottom: "16px" },
    stepTitle: { fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 8px" },
    stepDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: 0 },
    typesSection: { padding: "80px 0", background: "#F9FAFB" },
    typesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
    typeCard: { borderRadius: "16px", padding: "28px 24px", position: "relative" },
    recommendedBadge: { position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "20px", whiteSpace: "nowrap" },
    typeIcon: { fontSize: "36px", marginBottom: "12px" },
    typeTitle: { fontSize: "20px", fontWeight: 800, margin: "0 0 12px" },
    typeStats: { display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" },
    typeStat: { fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px" },
    typeDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 16px" },
    typeTags: { display: "flex", gap: "6px", flexWrap: "wrap" },
    typeTag: { fontSize: "11px", background: "#F3F4F6", color: "#6B7280", padding: "3px 10px", borderRadius: "20px" },
    ctaSection: { padding: "80px 24px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", textAlign: "center", position: "relative", overflow: "hidden" },
    ctaInner: { maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 2 },
    ctaIcon: { fontSize: "48px", marginBottom: "20px" },
    ctaTitle: { fontSize: "36px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: "0 0 16px" },
    ctaSub: { fontSize: "16px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: "0 0 36px" },
    ctaBtns: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
    ctaBtn: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", background: "#fff", color: "#4F46E5", borderRadius: "12px", fontSize: "15px", fontWeight: 700, textDecoration: "none" },
    ctaBtnSecondary: { display: "inline-flex", alignItems: "center", padding: "14px 28px", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "12px", fontSize: "15px", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)" },
    ctaBlob: { position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", bottom: "-200px", right: "-100px" },
    footer: { background: "#111827", padding: "28px 24px" },
    footerInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
    footerText: { fontSize: "12px", color: "#6B7280", margin: 0 },
    footerLinks: { display: "flex", gap: "16px" },
    footerLink: { fontSize: "12px", color: "#9CA3AF", textDecoration: "none", fontWeight: 500 },
    footerLogo: { display: "flex", alignItems: "center", gap: "8px" },
};
