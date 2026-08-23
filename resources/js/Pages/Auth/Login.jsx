import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const T = {
  fr: {
    title: "Connexion - SmartPlanner",
    brandTitle: "Planifiez vos études intelligemment",
    brandSub: "L'IA génère votre planning personnalisé selon vos cours et préférences.",
    features: [
      { icon: '🤖', text: "Génération IA automatique" },
      { icon: '📊', text: "Statistiques détaillées" },
      { icon: '📤', text: "Export PDF" },
      { icon: '🌙', text: "Mode sombre inclus" },
    ],
    formTitle: "Bon retour ! 👋",
    formSub: "Connectez-vous à votre compte SmartPlanner",
    email: "Adresse email",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    remember: "Se souvenir de moi",
    submit: "Se connecter",
    submitting: "Connexion en cours...",
    noAccount: "Pas encore de compte ?",
    registerLink: "Créer un compte gratuit",
    dir: "ltr",
    errorBanner: "Adresse e-mail ou mot de passe incorrect. Veuillez réessayer.",
    rateLimited: "Trop de tentatives. Veuillez réessayer plus tard.",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
  },
  en: {
    title: "Login - SmartPlanner",
    brandTitle: "Plan your studies intelligently",
    brandSub: "AI generates your personalised schedule based on your courses and preferences.",
    features: [
      { icon: '🤖', text: "Automatic AI generation" },
      { icon: '📊', text: "Detailed statistics" },
      { icon: '📤', text: "PDF export" },
      { icon: '🌙', text: "Dark mode included" },
    ],
    formTitle: "Welcome back! 👋",
    formSub: "Sign in to your SmartPlanner account",
    email: "Email address",
    password: "Password",
    forgotPassword: "Forgot password?",
    remember: "Remember me",
    submit: "Sign in",
    submitting: "Signing in...",
    noAccount: "Don't have an account?",
    registerLink: "Create free account",
    dir: "ltr",
    errorBanner: "Incorrect email address or password. Please try again.",
    rateLimited: "Too many attempts. Please try again later.",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  ar: {
    title: "تسجيل الدخول - SmartPlanner",
    brandTitle: "خطط لدراستك بذكاء",
    brandSub: "الذكاء الاصطناعي ينشئ جدولك الشخصي بناءً على دروسك وتفضيلاتك.",
    features: [
      { icon: '🤖', text: "إنشاء تلقائي بالذكاء الاصطناعي" },
      { icon: '📊', text: "إحصائيات تفصيلية" },
      { icon: '📤', text: "تصدير PDF" },
      { icon: '🌙', text: "وضع مظلم مضمون" },
    ],
    formTitle: "!مرحباً بعودتك 👋",
    formSub: "سجّل الدخول إلى حسابك في SmartPlanner",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    remember: "تذكرني",
    submit: "تسجيل الدخول",
    submitting: "جاري تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    registerLink: "إنشاء حساب مجاني",
    dir: "rtl",
    errorBanner: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
    rateLimited: "محاولات كثيرة جداً. يرجى المحاولة لاحقاً.",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
  },
};

export default function Login({ status, canResetPassword }) {
    let lang = "fr";
    if (typeof window !== "undefined") {
        lang = localStorage.getItem("smartplanner_lang") || "fr";
    }
    const tr = T[lang] || T.fr;
    const isRTL = tr.dir === "rtl";

    useEffect(() => {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }, [isRTL]);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [bannerError, setBannerError] = useState('');

    // Build a single user-friendly error banner from server errors
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const firstKey = Object.keys(errors)[0];
            const firstMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
            // Detect rate-limit message across languages: FR "secondes", EN "seconds", AR "ثانية"
            if (firstMsg && (firstMsg.includes('secondes') || firstMsg.includes('seconds') || firstMsg.includes('ثانية'))) {
                setBannerError(tr.rateLimited);
            } else {
                setBannerError(tr.errorBanner);
            }
        } else {
            setBannerError('');
        }
    }, [errors, tr]);

    // Also check flash errors from shared props
    const page = usePage();
    const flashError = page.props?.flash?.error;
    useEffect(() => {
        if (flashError && !bannerError) {
            setBannerError(flashError);
        }
    }, [flashError]);

    const submit = (e) => {
        e.preventDefault();
        setBannerError('');
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title={tr.title} />
            <style>{`
                @media (max-width: 768px) {
                    .sp-auth-root { flex-direction: column !important; }
                    .sp-auth-left { width: 100% !important; min-height: auto !important; padding: 32px 24px !important; }
                    .sp-auth-left > div:nth-child(2), .sp-auth-left > div:nth-child(3) { display: none !important; }
                    .sp-auth-left .features, .sp-auth-left [style*="flexDirection: column"] { display: none !important; }
                    .sp-auth-right { padding: 24px 16px !important; }
                }
            `}</style>
            <div style={{ ...s.root, direction: isRTL ? "rtl" : "ltr" }} className="sp-auth-root">

                {/* Left panel — branding */}
                <div style={s.left} className="sp-auth-left">
                    <div style={s.leftInner}>
                        <div style={s.brand}>
                            <div style={s.brandIcon}>
                                <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <span style={s.brandName}>SmartPlanner</span>
                        </div>

                        <h1 style={s.leftTitle}>{tr.brandTitle}</h1>
                        <p style={s.leftSub}>{tr.brandSub}</p>

                        <div style={s.features}>
                            {tr.features.map((f, i) => (
                                <div key={i} style={s.feature}>
                                    <span style={s.featureIcon}>{f.icon}</span>
                                    <span style={s.featureText}>{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={s.leftBlob1} />
                    <div style={s.leftBlob2} />
                </div>

                {/* Right panel — form */}
                <div style={s.right}>
                    <div style={s.formBox}>

                        <div style={s.formHeader}>
                            <h2 style={s.formTitle}>{tr.formTitle}</h2>
                            <p style={s.formSub}>{tr.formSub}</p>
                        </div>

                        {/* Success message (e.g. after password reset) */}
                        {status && (
                            <div style={s.successMsg}>{status}</div>
                        )}

                        {/* Error banner — prominent, always visible */}
                        {bannerError && (
                            <div style={s.errorBanner} role="alert">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{flexShrink: 0}}>
                                    <circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1.5"/>
                                    <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span style={s.errorBannerText}>{bannerError}</span>
                            </div>
                        )}

                        <form onSubmit={submit} style={s.form} noValidate>

                            <div style={s.field}>
                                <label htmlFor="login-email" style={s.label}>{tr.email}</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="votre@email.com"
                                    style={{ ...s.input, ...(errors.email ? s.inputError : {}) }}
                                    autoFocus
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div style={s.field}>
                                <div style={s.labelRow}>
                                    <label htmlFor="login-password" style={s.label}>{tr.password}</label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')} style={s.forgotLink}>
                                            {tr.forgotPassword}
                                        </Link>
                                    )}
                                </div>
                                <div style={s.passwordWrap}>
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        style={{ ...s.input, ...(errors.password ? s.inputError : {}), paddingRight: '42px' }}
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
                            </div>

                            <label style={s.checkRow}>
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    style={s.checkbox}
                                />
                                <span style={s.checkLabel}>{tr.remember}</span>
                            </label>

                            <button type="submit" disabled={processing} style={{ ...s.submitBtn, opacity: processing ? 0.7 : 1 }}>
                                {processing ? (
                                    <span style={s.btnLoading}>
                                        <Spinner /> {tr.submitting}
                                    </span>
                                ) : tr.submit}
                            </button>

                        </form>

                        <p style={s.switchText}>
                            {tr.noAccount}{' '}
                            <Link href={route('register')} style={s.switchLink}>
                                {tr.registerLink}
                            </Link>
                        </p>

                    </div>
                </div>
            </div>
        </>
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

const s = {
    root: { display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
    left: { width: '45%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    leftInner: { padding: '48px', position: 'relative', zIndex: 2, maxWidth: '400px' },
    brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
    brandIcon: { width: '42px', height: '42px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    brandName: { fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
    leftTitle: { fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' },
    leftSub: { fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 40px' },
    features: { display: 'flex', flexDirection: 'column', gap: '14px' },
    feature: { display: 'flex', alignItems: 'center', gap: '12px' },
    featureIcon: { fontSize: '20px', width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    featureText: { fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 },
    leftBlob1: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '-80px', right: '-80px' },
    leftBlob2: { position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: '-60px', left: '-40px' },
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: '32px' },
    formBox: { width: '100%', maxWidth: '400px' },
    formHeader: { marginBottom: '24px' },
    formTitle: { fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' },
    formSub: { fontSize: '14px', color: '#6B7280', margin: 0 },
    successMsg: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
    errorBanner: {
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        color: '#991B1B',
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '13px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        lineHeight: 1.5,
    },
    errorBannerText: { flex: 1, fontWeight: 500 },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
    forgotLink: { fontSize: '12px', color: '#4F46E5', textDecoration: 'none', fontWeight: 500, cursor: 'pointer' },
    passwordWrap: { position: 'relative' },
    eyeBtn: {
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    input: {
        padding: '11px 14px', borderRadius: '10px',
        border: '1.5px solid #E5E7EB', fontSize: '14px',
        background: '#fff', color: '#111827',
        outline: 'none', transition: 'border-color 0.15s',
        fontFamily: "'DM Sans', sans-serif",
        width: '100%', boxSizing: 'border-box',
    },
    inputError: { borderColor: '#EF4444' },
    error: { fontSize: '12px', color: '#EF4444', fontWeight: 500 },
    checkRow: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    checkbox: { width: '16px', height: '16px', accentColor: '#4F46E5', cursor: 'pointer' },
    checkLabel: { fontSize: '13px', color: '#6B7280' },
    submitBtn: {
        padding: '13px', background: '#4F46E5', color: '#fff',
        border: 'none', borderRadius: '12px', fontSize: '14px',
        fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: "'DM Sans', sans-serif",
        width: '100%',
    },
    btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    switchText: { textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '24px', lineHeight: 1.6 },
    switchLink: { color: '#4F46E5', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' },
};
