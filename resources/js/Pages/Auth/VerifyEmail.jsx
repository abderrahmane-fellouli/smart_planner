import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useAuthTheme, CardAuth, Spinner, AUTH } from '@/Components/AuthLayout';

const T = {
  fr: {
    title: "Vérifier l'email", heading: "Vérification d'email",
    desc: "Un lien de vérification a été envoyé à", check: "Cliquez sur le lien dans l'email ou appuyez sur le bouton ci-dessous pour vérifier.",
    submit: "Renvoyer l'email de vérification", submitting: "Envoi en cours...",
    sentAfterRegister: "Un email de vérification vient de vous être envoyé. Vérifiez votre boîte de réception (et vos spams).",
    error: "Impossible d'envoyer l'email pour le moment. Veuillez réessayer dans quelques instants.",
    logout: "Déconnexion",
    verifiedTitle: "Email vérifié", verifiedDesc: "Votre adresse email est déjà vérifiée. Vous pouvez accéder à votre espace.",
    goDashboard: "Aller au tableau de bord", goHome: "Retour à l'accueil",
    dir: "ltr",
  },
  en: {
    title: "Verify Email", heading: "Email verification",
    desc: "A verification link has been sent to", check: "Click the link in the email or press the button below to verify.",
    submit: "Resend verification email", submitting: "Sending...",
    sentAfterRegister: "A verification email has just been sent to you. Check your inbox (and spam).",
    error: "Unable to send the email right now. Please try again shortly.",
    logout: "Logout",
    verifiedTitle: "Email verified", verifiedDesc: "Your email address is already verified. You can access your workspace.",
    goDashboard: "Go to dashboard", goHome: "Back to home",
    dir: "ltr",
  },
  ar: {
    title: "تحقق من البريد", heading: "التحقق من البريد الإلكتروني",
    desc: "تم إرسال رابط التحقق إلى", check: "انقر على الرابط في البريد أو اضغط الزر أدناه للتحقق.",
    submit: "إعادة إرسال البريد", submitting: "جاري الإرسال...",
    sentAfterRegister: "تم إرسال بريد تحقق إليك حالاً. تحقق من صندوق الوارد (والبريد غير المرغوب فيه).",
    error: "تعذّر إرسال البريد في الوقت الحالي. حاول مرة أخرى بعد قليل.",
    logout: "تسجيل الخروج",
    verifiedTitle: "تم التحقق من البريد", verifiedDesc: "تم التحقق من بريدك الإلكتروني بالفعل. يمكنك الوصول إلى مساحتك.",
    goDashboard: "الانتقال إلى لوحة التحكم", goHome: "العودة إلى الرئيسية",
    dir: "rtl",
  },
};

export default function VerifyEmail({ status, verification_sent, verification_error, verification_resend_error }) {
  const { lang, isRTL } = useAuthTheme();
  const tr = T[lang] || T.fr;
  const [sending, setSending] = useState(false);
  const user = usePage().props.auth?.user;
  const email = user?.email || '';
  const alreadyVerified = !!user?.email_verified_at;

  const resend = () => {
    setSending(true);
    router.post(route('verification.send'), {}, {
      preserveState: true, preserveScroll: true,
      onFinish: () => setSending(false),
    });
  };

  const emailChip = email ? (
    <div style={{
      textAlign: 'center', background: 'var(--sp-successBg)', border: '1px solid var(--sp-successBorder)',
      color: 'var(--sp-success)', borderRadius: '10px', padding: '8px 14px', marginBottom: 20,
      fontWeight: 600, wordBreak: 'break-all', direction: 'ltr',
    }}>
      {email}
    </div>
  ) : null;

  return (
    <>
      <Head title={tr.title} />
      <CardAuth dir={isRTL ? 'rtl' : 'ltr'}>
        {alreadyVerified ? (
          <>
            <h2 style={AUTH.heading}>{tr.verifiedTitle}</h2>
            <p style={AUTH.desc}>{tr.verifiedDesc}</p>
            <Link href={route('dashboard')} style={AUTH.submitBtn} as="button">
              {tr.goDashboard}
            </Link>
            <Link href="/" style={AUTH.link}>{tr.goHome}</Link>
          </>
        ) : (
          <>
            <h2 style={AUTH.heading}>{tr.heading}</h2>
            <p style={{ ...AUTH.desc, marginBottom: 4 }}>{tr.desc}</p>
            {emailChip}
            <p style={AUTH.desc}>{tr.check}</p>
            {(status === 'verification-link-sent' || verification_sent) && <div style={AUTH.success}>{tr.sentAfterRegister}</div>}
            {(verification_error || verification_resend_error) && <div style={AUTH.errorBanner} role="alert"><span>{tr.error}</span></div>}
            <button onClick={resend} disabled={sending} style={{ ...AUTH.submitBtn, opacity: sending ? 0.7 : 1 }}>
              {sending ? <span style={AUTH.btnLoading}><Spinner /> {tr.submitting}</span> : tr.submit}
            </button>
            <Link href={route('logout')} method="post" as="button"
              style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--sp-textSecondary)', fontSize: 'var(--sp-text-base)', cursor: 'pointer', textDecoration: 'underline', width: '100%' }}>
              {tr.logout}
            </Link>
          </>
        )}
      </CardAuth>
    </>
  );
}
