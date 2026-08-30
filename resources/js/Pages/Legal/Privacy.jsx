import { Head, Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { useTheme, useLang } from "@/Pages/AppLayout";

/* ─── Privacy Policy — public page ────────────────────────────
   Localized FR/EN/AR + RTL, mirroring the Welcome page pattern
   (renders outside AppLayout, reads the stored language).
   IMPORTANT: any wording that asserts legal compliance (GDPR,
   cookie consent, data retention obligations, etc.) MUST be
   reviewed by the product owner / legal counsel before going
   live. Those pieces are marked [TODO(legal-review)].

   TODO(legal-review): replace the descriptive placeholders below
   with authoritative privacy wording approved by product/legal.
   Until then this page is structural only and makes NO compliance
   claims. */
const PT = {
    fr: {
        headTitle: "Politique de confidentialité",
        title: "Politique de confidentialité",
        updated: "Version : à confirmer [TODO(legal-review)]",
        intro: "Cette page décrit, à titre d'information, la manière dont SmartPlanner traite les données de ses utilisateurs. [TODO(legal-review)] — finaliser le texte conformément aux règles applicables.",
        sections: [
            {
                title: "1. Données que nous collectons",
                body: "Les informations que vous nous fournissez lors de la création de votre compte (prénom, nom, adresse e-mail) et les contenus que vous créez dans l'application (cours, préférences, plannings, tâches). [TODO(legal-review)]",
            },
            {
                title: "2. Utilisation des données",
                body: "Les données sont utilisées pour fournir le service de planification, personnaliser l'expérience et vous envoyer des communications liées au service. [TODO(legal-review)]",
            },
            {
                title: "3. Partage des données",
                body: "Nous ne vendons pas vos données personnelles. [TODO(legal-review)] — préciser les sous-traitants et les destinataires éventuels.",
            },
            {
                title: "4. Durée de conservation",
                body: "Durée de conservation à définir avec l'équipe produit / le juridique. [TODO(legal-review)]",
            },
            {
                title: "5. Vos droits",
                body: "Vous disposez de droits concernant vos données personnelles (accès, rectification, suppression). [TODO(legal-review)] — détailler conformément aux règles applicables.",
            },
            {
                title: "6. Sécurité",
                body: "Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos données. [TODO(legal-review)]",
            },
            {
                title: "7. Contact",
                body: "Pour toute question relative à cette politique, contactez-nous. [TODO(legal-review)] — indiquer l'adresse de contact officielle.",
            },
        ],
        back: "← Retour à l'accueil",
    },
    en: {
        headTitle: "Privacy Policy",
        title: "Privacy Policy",
        updated: "Version: to be confirmed [TODO(legal-review)]",
        intro: "This page describes, for information purposes, how SmartPlanner processes user data. [TODO(legal-review)] — finalise the wording in accordance with applicable rules.",
        sections: [
            {
                title: "1. Data we collect",
                body: "The information you provide when creating your account (first name, last name, email address) and the content you create in the app (courses, preferences, schedules, tasks). [TODO(legal-review)]",
            },
            {
                title: "2. How we use data",
                body: "Data is used to provide the planning service, personalise the experience and send you service-related communications. [TODO(legal-review)]",
            },
            {
                title: "3. Data sharing",
                body: "We do not sell your personal data. [TODO(legal-review)] — specify processors and any recipients.",
            },
            {
                title: "4. Retention period",
                body: "Retention period to be defined with the product team / legal. [TODO(legal-review)]",
            },
            {
                title: "5. Your rights",
                body: "You have rights regarding your personal data (access, rectification, deletion). [TODO(legal-review)] — detail in accordance with applicable rules.",
            },
            {
                title: "6. Security",
                body: "We implement reasonable technical and organisational measures to protect your data. [TODO(legal-review)]",
            },
            {
                title: "7. Contact",
                body: "For any question regarding this policy, please contact us. [TODO(legal-review)] — provide the official contact address.",
            },
        ],
        back: "← Back to home",
    },
    ar: {
        headTitle: "سياسة الخصوصية",
        title: "سياسة الخصوصية",
        updated: "الإصدار: قيد التأكيد [TODO(legal-review)]",
        intro: "تصف هذه الصفحة، لأغراض إعلامية، كيفية معالجة سمارت بلانر لبيانات المستخدمين. [TODO(legal-review)] — استكمال النص وفقًا للقواعد المطبقة.",
        sections: [
            {
                title: "1. البيانات التي نجمعها",
                body: "المعلومات التي تقدمها عند إنشاء حسابك (الاسم الأول، اسم العائلة، البريد الإلكتروني) والمحتوى الذي تنشئه في التطبيق (المواد، التفضيلات، الجداول، المهام). [TODO(legal-review)]",
            },
            {
                title: "2. كيفية استخدام البيانات",
                body: "تُستخدم البيانات لتقديم خدمة التخطيط وتخصيص التجربة وإرسال اتصالات متعلقة بالخدمة. [TODO(legal-review)]",
            },
            {
                title: "3. مشاركة البيانات",
                body: "نحن لا نبيع بياناتك الشخصية. [TODO(legal-review)] — تحديد المعالجات والمستلمين المحتملين.",
            },
            {
                title: "4. مدة الاحتفاظ",
                body: "مدة الاحتفاظ تُحدد مع فريق المنتج / الجهة القانونية. [TODO(legal-review)]",
            },
            {
                title: "5. حقوقك",
                body: "لديك حقوق تتعلق ببياناتك الشخصية (الوصول، التصحيح، الحذف). [TODO(legal-review)] — التفصيل وفقًا للقواعد المطبقة.",
            },
            {
                title: "6. الأمان",
                body: "ننفذ تدابير تقنية وتنظيمية معقولة لحماية بياناتك. [TODO(legal-review)]",
            },
            {
                title: "7. الاتصال بنا",
                body: "لأي سؤال بخصوص هذه السياسة، يرجى التواصل معنا. [TODO(legal-review)] — تقديم عنوان الاتصال الرسمي.",
            },
        ],
        back: "← العودة إلى الصفحة الرئيسية",
    },
};

export default function Privacy() {
    const { tk } = useTheme();
    const { lang: ctxLang } = useLang();
    let lang = ctxLang || "fr";
    if (typeof window !== "undefined") {
        lang = localStorage.getItem("smartplanner_lang") || lang;
    }
    const tr = PT[lang] || PT.fr;
    const s = makeStyles(tk);

    return (
        <>
            <Head title={tr.headTitle} />
            <div style={s.root} dir={lang === "ar" ? "rtl" : "ltr"}>
                <nav style={s.nav}>
                    <div style={s.navInner}>
                        <Link href="/" style={s.logo}>
                            <ApplicationLogo size={30} />
                            <span style={s.logoText}>SmartPlanner</span>
                        </Link>
                    </div>
                </nav>

                <main style={s.main}>
                    <container style={s.container}>
                        <h1 style={s.title}>{tr.title}</h1>
                        <p style={s.updated}>{tr.updated}</p>
                        <p style={s.intro}>{tr.intro}</p>
                        {tr.sections.map((sec, i) => (
                            <section key={i} style={s.section}>
                                <h2 style={s.sectionTitle}>{sec.title}</h2>
                                <p style={s.sectionBody}>{sec.body}</p>
                            </section>
                        ))}
                        <Link href="/" style={s.back}>{tr.back}</Link>
                    </container>
                </main>
            </div>
        </>
    );
}

function makeStyles(tk) {
    return {
        root: { fontFamily: "'DM Sans', sans-serif", background: tk.body, color: tk.text, minHeight: "100vh" },
        nav: { position: "sticky", top: 0, zIndex: 100, background: tk.topbarBg, backdropFilter: "blur(10px)", borderBottom: `1px solid ${tk.subtleBg}` },
        navInner: { maxWidth: "800px", margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center" },
        logo: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" },
        logoText: { fontSize: "16px", fontWeight: 800, color: tk.text, letterSpacing: "-0.02em" },
        main: { padding: "40px 24px" },
        container: { maxWidth: "800px", margin: "0 auto", display: "block" },
        title: { fontSize: "30px", fontWeight: 800, margin: "0 0 8px", color: tk.text },
        updated: { fontSize: "13px", color: tk.textSecondary, margin: "0 0 16px" },
        intro: { fontSize: "15px", lineHeight: 1.6, color: tk.textSecondary, margin: "0 0 24px" },
        section: { margin: "0 0 20px" },
        sectionTitle: { fontSize: "19px", fontWeight: 700, margin: "0 0 6px", color: tk.text },
        sectionBody: { fontSize: "15px", lineHeight: 1.6, color: tk.textSecondary, margin: "0" },
        back: { display: "inline-block", marginTop: "12px", fontSize: "14px", fontWeight: 600, color: tk.accentText, textDecoration: "none", background: tk.accent, padding: "9px 16px", borderRadius: "8px" },
    };
}
