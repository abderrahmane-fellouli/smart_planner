import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const T = {
  fr: {
    title: "Inscription - SmartPlanner",
    brandTitle: "Commencez à planifier gratuitement",
    brandSub: "Créez votre compte et laissez l'IA optimiser votre temps d'étude dès aujourd'hui.",
    steps: [
      { num: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes' },
      { num: '02', title: 'Ajoutez vos cours', desc: 'Entrez vos cours fixes et horaires' },
      { num: '03', title: 'Générez votre planning', desc: "L'IA crée 3 plannings personnalisés" },
    ],
    formTitle: "Créer un compte 🎓",
    formSub: "Rejoignez SmartPlanner — c'est gratuit !",
    name: "Nom complet",
    namePlaceholder: "Jean Dupont",
    email: "Adresse email",
    emailPlaceholder: "votre@email.com",
    password: "Mot de passe",
    passwordPlaceholder: "8 caractères minimum",
    confirmPassword: "Confirmer le mot de passe",
    submit: "Créer mon compte",
    submitting: "Création du compte...",
    hasAccount: "Déjà un compte ?",
    loginLink: "Se connecter",
    dir: "ltr",
    errorGeneric: "Veuillez corriger les erreurs ci-dessous.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
  },
  en: {
    title: "Register - SmartPlanner",
    brandTitle: "Start planning for free",
    brandSub: "Create your account and let AI optimise your study time from today.",
    steps: [
      { num: '01', title: 'Create your account', desc: 'Free signup in 30 seconds' },
      { num: '02', title: 'Add your courses', desc: 'Enter your fixed courses and times' },
      { num: '03', title: 'Generate your schedule', desc: 'AI creates 3 personalised schedules' },
    ],
    formTitle: "Create an account 🎓",
    formSub: "Join SmartPlanner — it's free!",
    name: "Full name",
    namePlaceholder: "John Smith",
    email: "Email address",
    emailPlaceholder: "your@email.com",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmPassword: "Confirm password",
    submit: "Create free account",
    submitting: "Creating account...",
    hasAccount: "Already have an account?",
    loginLink: "Sign in",
    dir: "ltr",
    errorGeneric: "Please correct the errors below.",
    passwordMismatch: "Passwords do not match.",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  ar: {
    title: "التسجيل - SmartPlanner",
    brandTitle: "ابدأ التخطيط مجاناً",
    brandSub: "أنشئ حسابك ودع الذكاء الاصطناعي يحسّن وقتك للدراسة من اليوم.",
    steps: [
      { num: '01', title: 'أنشئ حسابك', desc: 'تسجيل مجاني في 30 ثانية' },
      { num: '02', title: 'أضف دروسك', desc: 'أدخل دروسك الثابتة والأوقات' },
      { num: '03', title: 'أنشئ جدولك', desc: 'الذكاء الاصطناعي ينشئ 3 جداول مخصصة' },
    ],
    formTitle: "إنشاء حساب 🎓",
    formSub: "انضم إلى SmartPlanner — مجاني!",
    name: "الاسم الكامل",
    namePlaceholder: "أحمد بن علي",
    email: "البريد الإلكتروني",
    emailPlaceholder: "بريدك@الإلكتروني.com",
    password: "كلمة المرور",
    passwordPlaceholder: "8 أحرف على الأقل",
    confirmPassword: "تأكيد كلمة المرور",
    submit: "إنشاء حساب مجاني",
    submitting: "جاري إنشاء الحساب...",
    hasAccount: "لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
    dir: "rtl",
    errorGeneric: "يرجى تصحيح الأخطاء أدناه.",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
  },
};

export default function Register() {
    let lang = "fr";
    if (typeof window !== "undefined") {
        lang = localStorage.getItem("smartplanner_lang") || "fr";
    }
    const tr = T[lang] || T.fr;
    const isRTL = tr.dir === "rtl";

    useEffect(() => {
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }, [isRTL]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [bannerError, setBannerError] = useState('');

    // Build a user-friendly error banner
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            setBannerError(tr.errorGeneric);
        } else {
            setBannerError('');
        }
    }, [errors, tr]);

    const submit = (e) => {
        e.preventDefault();
        setBannerError('');
        post(route('register'));
    };

    const getFieldError = (key) => {
        if (!errors[key]) return null;
        return Array.isArray(errors[key]) ? errors[key][0] : errors[key];
    };

    return (
        <>
            <Head title={tr.title} />
            <style>{`
                @media (max-width: 768px) {
                    .sp-auth-root { flex-direction: column !important; }
                    .sp-auth-left { width: 100% !important; min-height: auto !important; padding: 32px 24px !important; }
                    .sp-auth-left > div:nth-child(2), .sp-auth-left > div:nth-child(3) { display: none !important; }
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

                        <div style={s.steps}>
                            {tr.steps.map((step, i) => (
                                <div key={i} style={{ ...s.step, flexDirection: isRTL ? "row-reverse" : "row" }}>
                                    <div style={s.stepNum}>{step.num}</div>
                                    <div style={{ textAlign: isRTL ? "right" : "left" }}>
                                        <div style={s.stepTitle}>{step.title}</div>
                                        <div style={s.stepDesc}>{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={s.leftBlob1} />
                    <div style={s.leftBlob2} />
                </div>

                {/* Right panel — form */}
                <div style={s.right} className="sp-auth-right">
                    <div style={s.formBox}>

                        <div style={s.formHeader}>
                            <h2 style={s.formTitle}>{tr.formTitle}</h2>
                            <p style={s.formSub}>{tr.formSub}</p>
                        </div>

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

                        <form onSubmit={submit} style={s.form} noValidate>

                            <div style={s.field}>
                                <label htmlFor="reg-name" style={s.label}>{tr.name}</label>
                                <input
                                    id="reg-name"
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder={tr.namePlaceholder}
                                    style={{ ...s.input, ...(getFieldError('name') ? s.inputError : {}) }}
                                    autoFocus
                                    autoComplete="name"
                                    required
                                />
                                {getFieldError('name') && <span style={s.error}>{getFieldError('name')}</span>}
                            </div>

                            <div style={s.field}>
                                <label htmlFor="reg-email" style={s.label}>{tr.email}</label>
                                <input
                                    id="reg-email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder={tr.emailPlaceholder}
                                    style={{ ...s.input, ...(getFieldError('email') ? s.inputError : {}) }}
                                    autoComplete="email"
                                    required
                                />
                                {getFieldError('email') && <span style={s.error}>{getFieldError('email')}</span>}
                            </div>

                            <div style={s.field}>
                                <label htmlFor="reg-password" style={s.label}>{tr.password}</label>
                                <div style={s.passwordWrap}>
                                    <input
                                        id="reg-password"
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder={tr.passwordPlaceholder}
                                        style={{ ...s.input, ...(getFieldError('password') ? s.inputError : {}), paddingRight: '42px' }}
                                        autoComplete="new-password"
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
                                {getFieldError('password') && <span style={s.error}>{getFieldError('password')}</span>}
                            </div>

                            <div style={s.field}>
                                <label htmlFor="reg-confirm" style={s.label}>{tr.confirmPassword}</label>
                                <input
                                    id="reg-confirm"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    placeholder={tr.confirmPassword}
                                    style={{ ...s.input, ...(getFieldError('password_confirmation') ? s.inputError : {}) }}
                                    autoComplete="new-password"
                                    required
                                />
                                {getFieldError('password_confirmation') && <span style={s.error}>{getFieldError('password_confirmation')}</span>}
                            </div>

                            <button type="submit" disabled={processing} style={{ ...s.submitBtn, opacity: processing ? 0.7 : 1 }}>
                                {processing ? (
                                    <span style={s.btnLoading}><Spinner /> {tr.submitting}</span>
                                ) : tr.submit}
                            </button>

                        </form>

                        <p style={s.switchText}>
                            {tr.hasAccount}{' '}
                            <Link href={route('login')} style={s.switchLink}>
                                {tr.loginLink}
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
    steps: { display: 'flex', flexDirection: 'column', gap: '20px' },
    step: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
    stepNum: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    stepTitle: { fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '2px' },
    stepDesc: { fontSize: '12px', color: 'rgba(255,255,255,0.65)' },
    leftBlob1: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: '-80px', right: '-80px' },
    leftBlob2: { position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: '-60px', left: '-40px' },
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: '32px' },
    formBox: { width: '100%', maxWidth: '440px' },
    formHeader: { marginBottom: '24px' },
    formTitle: { fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' },
    formSub: { fontSize: '14px', color: '#6B7280', margin: 0 },
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
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
    passwordWrap: { position: 'relative' },
    eyeBtn: {
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    input: {
        padding: '11px 14px', borderRadius: '10px',
        border: '1.5px solid #E5E7EB', fontSize: '14px',
        background: '#fff', color: '#111827', outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        width: '100%', boxSizing: 'border-box',
    },
    inputError: { borderColor: '#EF4444' },
    error: { fontSize: '12px', color: '#EF4444', fontWeight: 500 },
    submitBtn: {
        padding: '13px', background: '#4F46E5', color: '#fff',
        border: 'none', borderRadius: '12px', fontSize: '14px',
        fontWeight: 700, cursor: 'pointer', marginTop: '4px',
        fontFamily: "'DM Sans', sans-serif",
        width: '100%',
    },
    btnLoading: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    switchText: { textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '20px', lineHeight: 1.6 },
    switchLink: { color: '#4F46E5', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' },
};
