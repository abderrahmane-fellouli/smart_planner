import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAuthTheme, TwoPanelAuth, Spinner, AUTH } from '@/Components/AuthLayout';

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
    firstName: "Prénom",
    firstNamePlaceholder: "Jean",
    lastName: "Nom de famille",
    lastNamePlaceholder: "Dupont",
    thirdName: "Troisième nom (optionnel)",
    thirdNamePlaceholder: "Facultatif",
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
    firstName: "First name",
    firstNamePlaceholder: "John",
    lastName: "Family name",
    lastNamePlaceholder: "Smith",
    thirdName: "Third name (optional)",
    thirdNamePlaceholder: "Optional",
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
    firstName: "الاسم الأول",
    firstNamePlaceholder: "أحمد",
    lastName: "اسم العائلة",
    lastNamePlaceholder: "بن علي",
    thirdName: "الاسم الثالث (اختياري)",
    thirdNamePlaceholder: "اختياري",
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
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
  },
};

export default function Register() {
  const { lang, isRTL } = useAuthTheme();
  const tr = T[lang] || T.fr;

  const { data, setData, post, processing, errors } = useForm({
    first_name: '',
    last_name: '',
    third_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [bannerError, setBannerError] = useState('');

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) setBannerError(tr.errorGeneric);
    else setBannerError('');
  }, [errors, tr]);

  const submit = (e) => { e.preventDefault(); setBannerError(''); post(route('register')); };
  const getFieldError = (key) => errors[key] ? (Array.isArray(errors[key]) ? errors[key][0] : errors[key]) : null;

  return (
    <>
      <Head title={tr.title} />
      <TwoPanelAuth dir={isRTL ? 'rtl' : 'ltr'}
        left={<>
          <div className="sp-left-title" style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 'var(--sp-text-3xl)', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              {tr.brandTitle}
            </h1>
            <p className="sp-left-sub" style={{ fontSize: 'var(--sp-text-lg)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 40px' }}>
              {tr.brandSub}
            </p>
          </div>
          <div className="sp-left-features" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tr.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexDirection: 'row' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 'var(--sp-text-xs)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step.num}
                </div>
                <div style={{ textAlign: 'start' }}>
                  <div style={{ fontSize: 'var(--sp-text-lg)', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 'var(--sp-text-sm)', color: 'rgba(255,255,255,0.65)' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </>}>

        {/* ── Right panel: form ── */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={AUTH.formTitle}>{tr.formTitle}</h2>
          <p style={AUTH.formSub}>{tr.formSub}</p>
        </div>

        {bannerError && (
          <div style={AUTH.errorBanner} role="alert">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" fill="var(--sp-dangerBg)" stroke="var(--sp-danger)" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="var(--sp-danger)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={AUTH.errorBannerText}>{bannerError}</span>
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={AUTH.field}>
              <label htmlFor="reg-first-name" style={AUTH.label}>{tr.firstName}</label>
              <input id="reg-first-name" type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)}
                placeholder={tr.firstNamePlaceholder} style={{ ...AUTH.input, ...(getFieldError('first_name') ? AUTH.inputErr : {}) }}
                autoFocus autoComplete="given-name" required />
              {getFieldError('first_name') && <span style={AUTH.error}>{getFieldError('first_name')}</span>}
            </div>
            <div style={AUTH.field}>
              <label htmlFor="reg-last-name" style={AUTH.label}>{tr.lastName}</label>
              <input id="reg-last-name" type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)}
                placeholder={tr.lastNamePlaceholder} style={{ ...AUTH.input, ...(getFieldError('last_name') ? AUTH.inputErr : {}) }}
                autoComplete="family-name" required />
              {getFieldError('last_name') && <span style={AUTH.error}>{getFieldError('last_name')}</span>}
            </div>
          </div>

          <div style={AUTH.field}>
            <label htmlFor="reg-third-name" style={AUTH.label}>{tr.thirdName}</label>
            <input id="reg-third-name" type="text" value={data.third_name} onChange={e => setData('third_name', e.target.value)}
              placeholder={tr.thirdNamePlaceholder} style={{ ...AUTH.input, ...(getFieldError('third_name') ? AUTH.inputErr : {}) }}
              autoComplete="additional-name" />
            {getFieldError('third_name') && <span style={AUTH.error}>{getFieldError('third_name')}</span>}
          </div>

          <div style={AUTH.field}>
            <label htmlFor="reg-email" style={AUTH.label}>{tr.email}</label>
            <input id="reg-email" type="email" value={data.email} onChange={e => setData('email', e.target.value)}
              placeholder={tr.emailPlaceholder} style={{ ...AUTH.input, ...(getFieldError('email') ? AUTH.inputErr : {}) }}
              autoComplete="email" required />
            {getFieldError('email') && <span style={AUTH.error}>{getFieldError('email')}</span>}
          </div>

          <div style={AUTH.field}>
            <label htmlFor="reg-password" style={AUTH.label}>{tr.password}</label>
            <div style={AUTH.passwordWrap}>
              <input id="reg-password" type={showPassword ? 'text' : 'password'} value={data.password}
                onChange={e => setData('password', e.target.value)} placeholder={tr.passwordPlaceholder}
                style={{ ...AUTH.input, ...(getFieldError('password') ? AUTH.inputErr : {}), paddingInlineEnd: '42px' }}
                autoComplete="new-password" required />
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
            {getFieldError('password') && <span style={AUTH.error}>{getFieldError('password')}</span>}
          </div>

          <div style={AUTH.field}>
            <label htmlFor="reg-confirm" style={AUTH.label}>{tr.confirmPassword}</label>
            <input id="reg-confirm" type={showPassword ? 'text' : 'password'} value={data.password_confirmation}
              onChange={e => setData('password_confirmation', e.target.value)} placeholder={tr.confirmPassword}
              style={{ ...AUTH.input, ...(getFieldError('password_confirmation') ? AUTH.inputErr : {}) }}
              autoComplete="new-password" required />
            {getFieldError('password_confirmation') && <span style={AUTH.error}>{getFieldError('password_confirmation')}</span>}
          </div>

          <button type="submit" disabled={processing} style={{ ...AUTH.submitBtn, opacity: processing ? 0.7 : 1, marginTop: 4 }}>
            {processing ? <span style={AUTH.btnLoading}><Spinner /> {tr.submitting}</span> : tr.submit}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--sp-text-base)', color: 'var(--sp-textSecondary)', marginTop: 20, lineHeight: 1.6 }}>
          {tr.hasAccount}{' '}
          <Link href={route('login')} style={{ color: 'var(--sp-accent)', fontWeight: 600, textDecoration: 'none' }}>
            {tr.loginLink}
          </Link>
        </p>

      </TwoPanelAuth>
    </>
  );
}
