import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAuthTheme, CardAuth, Spinner, AUTH } from '@/Components/AuthLayout';

const T = {
  fr: { title: "Confirmer le mot de passe", heading: "Confirmez votre identité", desc: "Veuillez confirmer votre mot de passe pour accéder à cette page.", password: "Mot de passe", submit: "Confirmer", submitting: "Confirmation...", dir: "ltr", showPassword: "Afficher le mot de passe", hidePassword: "Masquer le mot de passe" },
  en: { title: "Confirm Password", heading: "Confirm your identity", desc: "Please confirm your password to access this page.", password: "Password", submit: "Confirm", submitting: "Confirming...", dir: "ltr", showPassword: "Show password", hidePassword: "Hide password" },
  ar: { title: "تأكيد كلمة المرور", heading: "تأكيد هويتك", desc: "يرجى تأكيد كلمة المرور للوصول إلى هذه الصفحة.", password: "كلمة المرور", submit: "تأكيد", submitting: "جاري التأكيد...", dir: "rtl", showPassword: "إظهار كلمة المرور", hidePassword: "إخفاء كلمة المرور" },
};

export default function ConfirmPassword() {
  const { lang, isRTL } = useAuthTheme();
  const tr = T[lang] || T.fr;

  const { data, setData, post, processing, errors, reset } = useForm({ password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    post(route('password.confirm'), { onFinish: () => reset('password') });
  };

  return (
    <>
      <Head title={tr.title} />
      <CardAuth dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 style={AUTH.heading}>{tr.heading}</h2>
        <p style={AUTH.desc}>{tr.desc}</p>
        <form onSubmit={submit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="confirm-password" style={{ display: 'block', ...AUTH.label, marginBottom: 6 }}>{tr.password}</label>
            <div style={AUTH.passwordWrap}>
              <input id="confirm-password" type={showPassword ? 'text' : 'password'} value={data.password}
                onChange={e => setData('password', e.target.value)}
                style={{ ...AUTH.input, ...(errors.password ? AUTH.inputErr : {}), paddingInlineEnd: '42px' }}
                autoFocus autoComplete="current-password" required />
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
            {errors.password && <span style={{ ...AUTH.error, marginTop: 4, display: 'block' }}>{Array.isArray(errors.password) ? errors.password[0] : errors.password}</span>}
          </div>
          <button type="submit" disabled={processing} style={{ ...AUTH.submitBtn, opacity: processing ? 0.7 : 1 }}>
            {processing ? <span style={AUTH.btnLoading}><Spinner /> {tr.submitting}</span> : tr.submit}
          </button>
        </form>
      </CardAuth>
    </>
  );
}
