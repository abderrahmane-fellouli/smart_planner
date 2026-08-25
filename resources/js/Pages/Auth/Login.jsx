import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAuthTheme, TwoPanelAuth, Spinner, AUTH } from '@/Components/AuthLayout';

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
  const { lang, isRTL } = useAuthTheme();
  const tr = T[lang] || T.fr;

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [bannerError, setBannerError] = useState('');

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const firstMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
      if (firstMsg && (firstMsg.includes('secondes') || firstMsg.includes('seconds') || firstMsg.includes('ثانية'))) {
        setBannerError(tr.rateLimited);
      } else {
        setBannerError(tr.errorBanner);
      }
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
    post(route('login'), { onFinish: () => reset('password') });
  };

  return (
    <>
      <Head title={tr.title} />
      <TwoPanelAuth dir={isRTL ? 'rtl' : 'ltr'}
        left={<>
          <div className="sp-left-title" style={{ marginBottom: '48px' }}>
            <h1 style={{ fontSize: 'var(--sp-text-3xl)', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              {tr.brandTitle}
            </h1>
            <p className="sp-left-sub" style={{ fontSize: 'var(--sp-text-lg)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 40px' }}>
              {tr.brandSub}
            </p>
          </div>
          <div className="sp-left-features" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tr.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: 'var(--sp-text-2xl)', width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: 'var(--sp-text-lg)', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </>}>

        {/* ── Right panel: form ── */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={AUTH.formTitle}>{tr.formTitle}</h2>
          <p style={AUTH.formSub}>{tr.formSub}</p>
        </div>

        {status && <div style={AUTH.success}>{status}</div>}

        {bannerError && (
          <div style={AUTH.errorBanner} role="alert">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" fill="var(--sp-dangerBg)" stroke="var(--sp-danger)" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="var(--sp-danger)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={AUTH.errorBannerText}>{bannerError}</span>
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
          <div style={AUTH.field}>
            <label htmlFor="login-email" style={AUTH.label}>{tr.email}</label>
            <input id="login-email" type="email" value={data.email}
              onChange={e => setData('email', e.target.value)}
              placeholder="votre@email.com"
              style={{ ...AUTH.input, ...(errors.email ? AUTH.inputErr : {}) }}
              autoFocus autoComplete="email" required />
          </div>

          <div style={AUTH.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-password" style={AUTH.label}>{tr.password}</label>
              {canResetPassword && (
                <Link href={route('password.request')} style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--sp-accent)', textDecoration: 'none', fontWeight: 500 }}>
                  {tr.forgotPassword}
                </Link>
              )}
            </div>
            <div style={AUTH.passwordWrap}>
              <input id="login-password" type={showPassword ? 'text' : 'password'}
                value={data.password} onChange={e => setData('password', e.target.value)}
                placeholder="••••••••"
                style={{ ...AUTH.input, ...(errors.password ? AUTH.inputErr : {}), paddingInlineEnd: '42px' }}
                autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ ...AUTH.eyeBtn, insetInlineEnd: '12px' }}
                aria-label={showPassword ? tr.hidePassword : tr.showPassword}>
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

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={data.remember}
              onChange={e => setData('remember', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--sp-accent)', cursor: 'pointer' }} />
            <span style={{ fontSize: 'var(--sp-text-base)', color: 'var(--sp-textSecondary)' }}>{tr.remember}</span>
          </label>

          <button type="submit" disabled={processing} style={{ ...AUTH.submitBtn, opacity: processing ? 0.7 : 1 }}>
            {processing ? <span style={AUTH.btnLoading}><Spinner /> {tr.submitting}</span> : tr.submit}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--sp-text-base)', color: 'var(--sp-textSecondary)', marginTop: 24, lineHeight: 1.6 }}>
          {tr.noAccount}{' '}
          <Link href={route('register')} style={{ color: 'var(--sp-accent)', fontWeight: 600, textDecoration: 'none' }}>
            {tr.registerLink}
          </Link>
        </p>

      </TwoPanelAuth>
    </>
  );
}
