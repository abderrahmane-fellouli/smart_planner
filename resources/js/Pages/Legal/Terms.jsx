import { Head, Link } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { useTheme, useLang } from "@/Pages/AppLayout";

/* ─── Terms of Service — public page ──────────────────────────
   Localized FR/EN/AR + RTL, mirroring the Welcome page pattern.
   IMPORTANT: any wording that asserts legal terms, liabilities,
   or jurisdiction MUST be reviewed by the product owner / legal
   counsel before going live. Those pieces are marked
   [TODO(legal-review)].

   TODO(legal-review): replace the descriptive placeholders below
   with authoritative terms approved by product/legal. Until then
   this page is structural only and makes NO legal commitments. */
const TT = {
    fr: {
        headTitle: "Conditions d'utilisation",
        title: "Conditions d'utilisation",
        updated: "Version : à confirmer [TODO(legal-review)]",
        intro: "Cette page décrit, à titre d'information, les conditions générales applicables à l'utilisation du service SmartPlanner. [TODO(legal-review)] — finaliser le texte conformément aux règles applicables.",
        sections: [
            {
                title: "1. Acceptation des conditions",
                body: "En utilisant SmartPlanner, vous acceptez les présentes conditions. [TODO(legal-review)]",
            },
            {
                title: "2. Utilisation du service",
                body: "Vous vous engagez à utiliser le service conformément à sa finalité et aux lois applicables. [TODO(legal-review)]",
            },
            {
                title: "3. Compte et responsabilité",
                body: "Vous êtes responsable de la confidentialité de vos identifiants et des activités réalisées depuis votre compte. [TODO(legal-review)]",
            },
            {
                title: "4. Contenu utilisateur",
                body: "Vous conservez la propriété de vos contenus tout en nous accordant les droits nécessaires au fonctionnement du service. [TODO(legal-review)]",
            },
            {
                title: "5. Disponibilité et interruptions",
                body: "Le service peut être temporairement indisponible pour maintenance ou incident. [TODO(legal-review)]",
            },
            {
                title: "6. Limitation de responsabilité",
                body: "La responsabilité de SmartPlanner est limitée dans les conditions prévues par les règles applicables. [TODO(legal-review)]",
            },
            {
                title: "7. Droit applicable",
                body: "Droit applicable et juridiction compétente à préciser. [TODO(legal-review)]",
            },
            {
                title: "8. Contact",
                body: "Pour toute question relative à ces conditions, contactez-nous. [TODO(legal-review)] — indiquer l'adresse de contact officielle.",
            },
        ],
        back: "← Retour à l'accueil",
    },
    en: {
        headTitle: "Terms of Service",
        title: "Terms of Service",
        updated: "Version: to be confirmed [TODO(legal-review)]",
        intro: "This page describes, for information purposes, the general terms applicable to the use of the SmartPlanner service. [TODO(legal-review)] — finalise the wording in accordance with applicable rules.",
        sections: [
            {
                title: "1. Acceptance of terms",
                body: "By using SmartPlanner, you agree to these terms. [TODO(legal-review)]",
            },
            {
                title: "2. Use of the service",
                body: "You agree to use the service in accordance with its purpose and applicable law. [TODO(legal-review)]",
            },
            {
                title: "3. Account and responsibility",
                body: "You are responsible for keeping your credentials confidential and for activity on your account. [TODO(legal-review)]",
            },
            {
                title: "4. User content",
                body: "You retain ownership of your content while granting us the rights needed to operate the service. [TODO(legal-review)]",
            },
            {
                title: "5. Availability and interruptions",
                body: "The service may be temporarily unavailable for maintenance or incident. [TODO(legal-review)]",
            },
            {
                title: "6. Limitation of liability",
                body: "SmartPlanner's liability is limited in the manner provided by applicable rules. [TODO(legal-review)]",
            },
            {
                title: "7. Governing law",
                body: "Governing law and competent jurisdiction to be specified. [TODO(legal-review)]",
            },
            {
                title: "8. Contact",
                body: "For any question regarding these terms, please contact us. [TODO(legal-review)] — provide the official contact address.",
            },
        ],
        back: "← Back to home",
    },
    ar: {
        headTitle: "شروط الاستخدام",
        title: "شروط الاستخدام",
        updated: "الإصدار: قيد التأكيد [TODO(legal-review)]",
        intro: "تصف هذه الصفحة، لأغراض إعلامية، الشروط العامة المطبقة على استخدام خدمة سمارت بلانر. [TODO(legal-review)] — استكمال النص وفقًا للقواعد المطبقة.",
        sections: [
            {
                title: "1. قبول الشروط",
                body: "باستخدامك سمارت بلانر، فأنت توافق على هذه الشروط. [TODO(legal-review)]",
            },
            {
                title: "2. استخدام الخدمة",
                body: "تلتزم باستخدام الخدمة وفقًا لغرضها والقوانين المطبقة. [TODO(legal-review)]",
            },
            {
                title: "3. الحساب والمسؤولية",
                body: "أنت مسؤول عن الحفاظ على سرية بيانات الدخول وعن الأنشطة المنفذة من حسابك. [TODO(legal-review)]",
            },
            {
                title: "4. محتوى المستخدم",
                body: "تحتفظ بملكية المحتوى الخاص بك مع منحنا الحقوق اللازمة لتشغيل الخدمة. [TODO(legal-review)]",
            },
            {
                title: "5. التوفر والانقطاعات",
                body: "قد تكون الخدمة غير متاحة مؤقتًا للصيانة أو خلل. [TODO(legal-review)]",
            },
            {
                title: "6. حدود المسؤولية",
                body: "مسؤولية سمارت بلانر محدودة بالشكل المنصوص عليه في القواعد المطبقة. [TODO(legal-review)]",
            },
            {
                title: "7. القانون المطبق",
                body: "القانون المطبق والجهة القضائية المختصة يحددان لاحقًا. [TODO(legal-review)]",
            },
            {
                title: "8. الاتصال بنا",
                body: "لأي سؤال بخصوص هذه الشروط، يرجى التواصل معنا. [TODO(legal-review)] — تقديم عنوان الاتصال الرسمي.",
            },
        ],
        back: "← العودة إلى الصفحة الرئيسية",
    },
};

export default function Terms() {
    const { tk } = useTheme();
    const { lang: ctxLang } = useLang();
    let lang = ctxLang || "fr";
    if (typeof window !== "undefined") {
        lang = localStorage.getItem("smartplanner_lang") || lang;
    }
    const tr = TT[lang] || TT.fr;
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
