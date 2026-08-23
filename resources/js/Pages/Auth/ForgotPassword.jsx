import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const T = {
  fr: { title: "Mot de passe oublié", heading: "Mot de passe oublié ?", desc: "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.", email: "Adresse email", submit: "Envoyer le lien", sending: "Envoi en cours...", back: "Retour à la connexion", errorGeneric: "Une erreur est survenue. Veuillez réessayer.", dir: "ltr" },
  en: { title: "Forgot Password", heading: "Forgot your password?", desc: "Enter your email address and we'll send you a password reset link.", email: "Email address", submit: "Send reset link", sending: "Sending...", back: "Back to login", errorGeneric: "Something went wrong. Please try again.", dir: "ltr" },
  ar: { title: "نسيان كلمة المرور", heading: "نسيت كلمة المرور؟", desc: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.", email: "البريد الإلكتروني", submit: "إرسال الرابط", sending: "جاري الإرسال...", back: "العودة لتسجيل الدخول", errorGeneric: "حدث خطأ ما. يرجى المحاولة مرة أخرى.", dir: "rtl" },
};

export default function ForgotPassword({ status }) {
    let lang = "fr";
    if (typeof window !== "undefined") lang = localStorage.getItem("smartplanner_lang") || "fr";
    const tr = T[lang] || T.fr;
    const isRTL = tr.dir === "rtl";

    useEffect(() => {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }, [isRTL]);

    const { data, setData, post, processing, errors } = useForm({ email: '' });
    const [bannerError, setBannerError] = useState('');

    // Build error banner from server errors
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const firstKey = Object.keys(errors)[0];
            const firstMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
            setBannerError(firstMsg || tr.errorGeneric);
        } else {
            setBannerError('');
        }
    }, [errors, tr]);

    const page = usePage();
    const flashError = page.props?.flash?.error;
    useEffect(() => {
        if (flashError && !bannerError) setBannerError(flashError);
    }, [flashError]);

    const submit = (e) => {
        e.preventDefault();
        setBannerError('');
        post(route('password.email'));
    };

    return (
        <GuestShell dir={tr.dir}>
            <Head title={tr.title} />
            <h2 style={s.heading}>{tr.heading}</h2>
            <p style={s.desc}>{tr.desc}</p>

            {/* Success message after password reset link sent */}
            {status && <div style={s.success}>{status}</div>}

            {/* Error banner */}
            {bannerError && (
                <div style={s.errorBanner} role="alert">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{flexShrink: 0}}>
                        <circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5"/>
                        <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span style={s.errorBannerText}>{bannerError}</span>
                </div>
            )}

            <form onSubmit={submit} noValidate>
                <div style={s.field}>
                    <label htmlFor="forgot-email" style={s.label}>{tr.email}</label>
                    <input
                        id="forgot-email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        placeholder="votre@email.com"
                        style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
                        autoFocus
                        autoComplete="email"
                        required
                    />
                </div>
                <button type="submit" disabled={processing} style={{ ...s.btn, opacity: processing ? 0.7 : 1 }}>
                    {processing ? (
                        <span style={s.btnLoading}><Spinner /> {tr.sending}</span>
                    ) : tr.submit}
                </button>
            </form>
            <Link href={route('login')} style={s.link}>{tr.back}</Link>
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
            <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
    heading: { fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px', textAlign: 'center' },
    desc: { fontSize: '13px', color: '#6B7280', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.5 },
    success: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
    errorBanner: {
        background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B',
        borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '10px', lineHeight: 1.5,
    },
    errorBannerText: { flex: 1, fontWeight: 500 },
    field: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '14px', background: '#fff', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
    inputErr: { borderColor: '#EF4444' },
    btn: { width: '100%', padding: '12px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
    btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    link: { display: 'block', textAlign: 'center', fontSize: '13px', color: '#4F46E5', textDecoration: 'none', marginTop: '16px', fontWeight: 500 },
};
