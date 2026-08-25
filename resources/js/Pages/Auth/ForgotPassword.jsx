import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAuthTheme, CardAuth, Spinner, AUTH } from '@/Components/AuthLayout';

const T = {
  fr: { title: "Mot de passe oublié", heading: "Mot de passe oublié ?", desc: "Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.", email: "Adresse email", submit: "Envoyer le lien", sending: "Envoi en cours...", back: "Retour à la connexion", errorGeneric: "Une erreur est survenue. Veuillez réessayer.", dir: "ltr" },
  en: { title: "Forgot Password", heading: "Forgot your password?", desc: "Enter your email address and we'll send you a password reset link.", email: "Email address", submit: "Send reset link", sending: "Sending...", back: "Back to login", errorGeneric: "Something went wrong. Please try again.", dir: "ltr" },
  ar: { title: "نسيان كلمة المرور", heading: "نسيت كلمة المرور؟", desc: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.", email: "البريد الإلكتروني", submit: "إرسال الرابط", sending: "جاري الإرسال...", back: "العودة لتسجيل الدخول", errorGeneric: "حدث خطأ ما. يرجى المحاولة مرة أخرى.", dir: "rtl" },
};

export default function ForgotPassword({ status }) {
  const { lang, isRTL } = useAuthTheme();
  const tr = T[lang] || T.fr;

  const { data, setData, post, processing, errors } = useForm({ email: '' });
  const [bannerError, setBannerError] = useState('');

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const firstMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
      setBannerError(firstMsg || tr.errorGeneric);
    } else { setBannerError(''); }
  }, [errors, tr]);

  const page = usePage();
  const flashError = page.props?.flash?.error;
  useEffect(() => { if (flashError && !bannerError) setBannerError(flashError); }, [flashError]);

  const submit = (e) => { e.preventDefault(); setBannerError(''); post(route('password.email')); };

  return (
    <>
      <Head title={tr.title} />
      <CardAuth dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 style={AUTH.heading}>{tr.heading}</h2>
        <p style={AUTH.desc}>{tr.desc}</p>

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

        <form onSubmit={submit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="forgot-email" style={{ display: 'block', ...AUTH.label, marginBottom: 6 }}>{tr.email}</label>
            <input id="forgot-email" type="email" value={data.email} onChange={e => setData('email', e.target.value)}
              placeholder="votre@email.com" style={{ ...AUTH.input, ...(errors.email ? AUTH.inputErr : {}) }}
              autoFocus autoComplete="email" required />
          </div>
          <button type="submit" disabled={processing} style={{ ...AUTH.submitBtn, opacity: processing ? 0.7 : 1 }}>
            {processing ? <span style={AUTH.btnLoading}><Spinner /> {tr.sending}</span> : tr.submit}
          </button>
        </form>
        <Link href={route('login')} style={AUTH.link}>{tr.back}</Link>
      </CardAuth>
    </>
  );
}
