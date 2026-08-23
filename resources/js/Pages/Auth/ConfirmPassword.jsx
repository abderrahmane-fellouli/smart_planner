import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const T = {
  fr: { title: "Confirmer le mot de passe", heading: "Confirmez votre identité", desc: "Veuillez confirmer votre mot de passe pour accéder à cette page.", password: "Mot de passe", submit: "Confirmer", submitting: "Confirmation...", dir: "ltr", showPassword: "Afficher le mot de passe", hidePassword: "Masquer le mot de passe" },
  en: { title: "Confirm Password", heading: "Confirm your identity", desc: "Please confirm your password to access this page.", password: "Password", submit: "Confirm", submitting: "Confirming...", dir: "ltr", showPassword: "Show password", hidePassword: "Hide password" },
  ar: { title: "تأكيد كلمة المرور", heading: "تأكيد هويتك", desc: "يرجى تأكيد كلمة المرور للوصول إلى هذه الصفحة.", password: "كلمة المرور", submit: "تأكيد", submitting: "جاري التأكيد...", dir: "rtl", showPassword: "إظهار كلمة المرور", hidePassword: "إخفاء كلمة المرور" },
};

export default function ConfirmPassword() {
    let lang = "fr";
    if (typeof window !== "undefined") lang = localStorage.getItem("smartplanner_lang") || "fr";
    const tr = T[lang] || T.fr;
    const isRTL = tr.dir === "rtl";

    useEffect(() => {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }, [isRTL]);

    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestShell dir={tr.dir}>
            <Head title={tr.title} />
            <h2 style={s.heading}>{tr.heading}</h2>
            <p style={s.desc}>{tr.desc}</p>
            <form onSubmit={submit} noValidate>
                <div style={s.field}>
                    <label htmlFor="confirm-password" style={s.label}>{tr.password}</label>
                    <div style={s.passwordWrap}>
                        <input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            style={{ ...s.input, ...(errors.password ? s.inputErr : {}), paddingRight: '42px' }}
                            autoFocus
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={s.eyeBtn}
                            aria-label={showPassword ? tr.hidePassword : tr.showPassword}
                        >
                            {showPassword ? (
                                <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                                    <line x1="1" y1="1" x2="23" y2="23" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round"/>
                                </svg>
                            ) : (
                                <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <span style={s.error}>{Array.isArray(errors.password) ? errors.password[0] : errors.password}</span>}
                </div>
                <button type="submit" disabled={processing} style={{ ...s.btn, opacity: processing ? 0.7 : 1 }}>
                    {processing ? (
                        <span style={s.btnLoading}><Spinner /> {tr.submitting}</span>
                    ) : tr.submit}
                </button>
            </form>
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
    field: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
    passwordWrap: { position: 'relative' },
    eyeBtn: {
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '14px', background: '#fff', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" },
    inputErr: { borderColor: '#EF4444' },
    error: { fontSize: '12px', color: '#EF4444', fontWeight: 500, marginTop: '4px', display: 'block' },
    btn: { width: '100%', padding: '12px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
    btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
};
