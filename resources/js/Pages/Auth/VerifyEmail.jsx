import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useAuthTheme, CardAuth, Spinner, AUTH } from '@/Components/AuthLayout';

const T = {
  fr: { title: "Vérifier l'email", heading: "Vérification d'email", desc: "Nous avons envoyé un lien de vérification à votre adresse email.", check: "Cliquez sur le lien dans l'email ou appuyez sur le bouton ci-dessous pour vérifier.", submit: "Renvoyer l'email de vérification", submitting: "Envoi en cours...", sent: "Nouvel email envoyé !", logout: "Déconnexion", dir: "ltr" },
  en: { title: "Verify Email", heading: "Email verification", desc: "A verification link has been sent to your email address.", check: "Click the link in the email or press the button below to verify.", submit: "Resend verification email", submitting: "Sending...", sent: "New email sent!", logout: "Logout", dir: "ltr" },
  ar: { title: "تحقق من البريد", heading: "التحقق من البريد الإلكتروني", desc: "تم إرسال رابط التحقق إلى بريدك الإلكتروني.", check: "انقر على الرابط في البريد أو اضغط الزر أدناه للتحقق.", submit: "إعادة إرسال البريد", submitting: "جاري الإرسال...", sent: "تم إرسال بريد جديد!", logout: "تسجيل الخروج", dir: "rtl" },
};

export default function VerifyEmail({ status }) {
  const { lang, isRTL } = useAuthTheme();
  const tr = T[lang] || T.fr;
  const [sending, setSending] = useState(false);

  const resend = () => {
    setSending(true);
    router.post(route('verification.send'), {}, {
      preserveState: true, preserveScroll: true,
      onFinish: () => setSending(false),
    });
  };

  return (
    <>
      <Head title={tr.title} />
      <CardAuth dir={isRTL ? 'rtl' : 'ltr'}>
        <h2 style={AUTH.heading}>{tr.heading}</h2>
        <p style={{ ...AUTH.desc, marginBottom: 8 }}>{tr.desc}</p>
        <p style={AUTH.desc}>{tr.check}</p>
        {status === 'verification-link-sent' && <div style={AUTH.success}>{tr.sent}</div>}
        <button onClick={resend} disabled={sending} style={{ ...AUTH.submitBtn, opacity: sending ? 0.7 : 1 }}>
          {sending ? <span style={AUTH.btnLoading}><Spinner /> {tr.submitting}</span> : tr.submit}
        </button>
        <Link href={route('logout')} method="post" as="button"
          style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--sp-textSecondary)', fontSize: 'var(--sp-text-base)', cursor: 'pointer', textDecoration: 'underline', width: '100%' }}>
          {tr.logout}
        </Link>
      </CardAuth>
    </>
  );
}
