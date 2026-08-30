import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAuthTheme, CardAuth, Spinner, AUTH } from '@/Components/AuthLayout';

const T = {
  fr: { title: "Réinitialiser le mot de passe", heading: "Nouveau mot de passe", email: "Adresse email", password: "Nouveau mot de passe", confirm: "Confirmer le mot de passe", submit: "Réinitialiser", submitting: "Réinitialisation...", back: "Retour à la connexion", dir: "ltr", showPassword: "Afficher le mot de passe", hidePassword: "Masquer le mot de passe" },
  en: { title: "Reset Password", heading: "New password", email: "Email address", password: "New password", confirm: "Confirm password", submit: "Reset password", submitting: "Resetting...", back: "Back to login", dir: "ltr", showPassword: "Show password", hidePassword: "Hide password" },
  ar: { title: "إعادة تعيين كلمة المرور", heading: "كلمة مرور جديدة", email: "البريد الإلكتروني", password: "كلمة المرور الجديدة", confirm: "تأكيد كلمة المرور", submit: "إعادة التعيين", submitting: "جاري إعادة التعيين...", back: "العودة لتسجيل الدخول", dir: "rtl", showPassword: "إظهار كلمة المرور", hidePassword: "إخفاء كلمة المرور" },
};

function PasswordEye({ show, isRTL, tr, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ ...AUTH.eyeBtn, insetInlineEnd: '12px' }}
      aria-label={show ? tr.hidePassword : tr.showPassword}>
      {show ? (
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
  );
}

export default function ResetPassword({ token, email }) {
  const { lang, isRTL } = useAuthTheme();
  const tr = T[lang] || T.fr;

  const { data, setData, post, processing, errors } = useForm({
    token, email, password: '', password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e) => { e.preventDefault(); post(route('password.store')); };

  return (
    <>
      <Head title={tr.title} />
      <CardAuth dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 style={AUTH.heading}>{tr.heading}</h2>
        <form onSubmit={submit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="reset-email" style={{ display: 'block', ...AUTH.label, marginBottom: 6 }}>{tr.email}</label>
            <input id="reset-email" type="email" value={data.email} onChange={e => setData('email', e.target.value)}
              style={{ ...AUTH.input, ...(errors.email ? AUTH.inputErr : {}) }} autoComplete="email" required />
            {errors.email && <span style={{ ...AUTH.error, marginTop: 4, display: 'block' }}>{Array.isArray(errors.email) ? errors.email[0] : errors.email}</span>}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="reset-password" style={{ display: 'block', ...AUTH.label, marginBottom: 6 }}>{tr.password}</label>
            <div style={AUTH.passwordWrap}>
              <input id="reset-password" type={showPassword ? 'text' : 'password'} value={data.password}
                onChange={e => setData('password', e.target.value)}
                style={{ ...AUTH.input, ...(errors.password ? AUTH.inputErr : {}), paddingInlineEnd: '42px' }}
                autoComplete="new-password" required />
              <PasswordEye show={showPassword} isRTL={isRTL} tr={tr} onClick={() => setShowPassword(!showPassword)} />
            </div>
            {errors.password && <span style={{ ...AUTH.error, marginTop: 4, display: 'block' }}>{Array.isArray(errors.password) ? errors.password[0] : errors.password}</span>}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="reset-confirm" style={{ display: 'block', ...AUTH.label, marginBottom: 6 }}>{tr.confirm}</label>
            <div style={AUTH.passwordWrap}>
              <input id="reset-confirm" type={showPassword ? 'text' : 'password'} value={data.password_confirmation}
                onChange={e => setData('password_confirmation', e.target.value)}
                style={{ ...AUTH.input, paddingInlineEnd: '42px' }}
                autoComplete="new-password" required />
              <PasswordEye show={showPassword} isRTL={isRTL} tr={tr} onClick={() => setShowPassword(!showPassword)} />
            </div>
          </div>
          <button type="submit" disabled={processing} style={{ ...AUTH.submitBtn, opacity: processing ? 0.7 : 1 }}>
            {processing ? <span style={AUTH.btnLoading}><Spinner /> {tr.submitting}</span> : tr.submit}
          </button>
        </form>
        <Link href={route('login')} style={AUTH.link}>{tr.back}</Link>
      </CardAuth>
    </>
  );
}
