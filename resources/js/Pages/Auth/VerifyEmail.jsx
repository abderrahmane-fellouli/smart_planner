import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const T = {
  fr: { title: "Vérifier l'email", heading: "Vérification d'email", desc: "Nous avons envoyé un lien de vérification à votre adresse email.", check: "Cliquez sur le lien dans l'email ou appuyez sur le bouton ci-dessous pour vérifier.", submit: "Renvoyer l'email de vérification", submitting: "Envoi en cours...", sent: "Nouvel email envoyé !", logout: "Déconnexion", dir: "ltr" },
  en: { title: "Verify Email", heading: "Email verification", desc: "A verification link has been sent to your email address.", check: "Click the link in the email or press the button below to verify.", submit: "Resend verification email", submitting: "Sending...", sent: "New email sent!", logout: "Logout", dir: "ltr" },
  ar: { title: "تحقق من البريد", heading: "التحقق من البريد الإلكتروني", desc: "تم إرسال رابط التحقق إلى بريدك الإلكتروني.", check: "انقر على الرابط في البريد أو اضغط الزر أدناه للتحقق.", submit: "إعادة إرسال البريد", submitting: "جاري الإرسال...", sent: "تم إرسال بريد جديد!", logout: "تسجيل الخروج", dir: "rtl" },
};

export default function VerifyEmail({ status }) {
    let lang = "fr";
    if (typeof window !== "undefined") lang = localStorage.getItem("smartplanner_lang") || "fr";
    const tr = T[lang] || T.fr;
    const isRTL = tr.dir === "rtl";
    const [sending, setSending] = useState(false);

    // Set document direction for RTL support
    useEffect(() => {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }, [isRTL]);

    // Use Inertia router for CSRF-safe POST instead of raw fetch()
    const resend = () => {
        setSending(true);
        router.post(route('verification.send'), {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setSending(false),
        });
    };

    return (
        <GuestShell dir={tr.dir}>
            <Head title={tr.title} />
            <h2 style={s.heading}>{tr.heading}</h2>
            <p style={s.desc}>{tr.desc}</p>
            <p style={s.check}>{tr.check}</p>
            {status === 'verification-link-sent' && <div style={s.success}>{tr.sent}</div>}
            <button onClick={resend} disabled={sending} style={{ ...s.btn, opacity: sending ? 0.7 : 1 }}>
                {sending ? (
                    <span style={s.btnLoading}><Spinner /> {tr.submitting}</span>
                ) : tr.submit}
            </button>
            <Link href={route('logout')} method="post" as="button" style={s.logout}>{tr.logout}</Link>
        </GuestShell>
    );
}

function Spinner() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: 'spin 0.8s linear infinite' }}>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
    );
}

function GuestShell({ children, dir }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', fontFamily: "'DM Sans', sans-serif", direction: dir, padding: '16px' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', textAlign: 'center' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <div style={{ width: '32px', height: '32px', background: '#4F46E5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>SmartPlanner</span>
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}

const s = {
    heading: { fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 12px' },
    desc: { fontSize: '14px', color: '#374151', margin: '0 0 8px', lineHeight: 1.5 },
    check: { fontSize: '13px', color: '#6B7280', margin: '0 0 24px', lineHeight: 1.5 },
    success: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    btn: { width: '100%', padding: '12px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
    btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    logout: { marginTop: '16px', background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' },
};
