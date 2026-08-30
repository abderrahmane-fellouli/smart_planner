import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout, { useTheme, useLang, LogoutModal } from '@/Pages/AppLayout';
import { useState, useRef } from 'react';

const T = {
  fr: {
    profile: {
      title: "Mon profil",
      subtitle: "Gérez vos informations personnelles et votre sécurité",
      profileInfo: "📸 Photo & Informations",
      profileSub: "Mettez à jour votre nom, email et photo de profil",
      profileUpdated: "✅ Profil mis à jour avec succès !",
      passwordUpdated: "✅ Mot de passe mis à jour !",
      changePhoto: "Changer la photo",
      removePhoto: "Supprimer",
      removePhotoConfirm: "Supprimer la photo de profil ?",
      firstName: "Prénom",
      lastName: "Nom de famille",
      thirdName: "Troisième nom (optionnel)",
      pseudonym: "Pseudonyme (optionnel)",
      pseudonymHint: "Sera utilisé dans la salute du tableau de bord",
      email: "Adresse email",
      emailNotVerified: "⚠️ Votre adresse email n'est pas vérifiée.",
      saveChanges: "Sauvegarder les modifications",
      saving: "Sauvegarde...",
      passwordSection: "🔐 Changer le mot de passe",
      passwordSub: "Utilisez un mot de passe fort d'au moins 8 caractères",
      currentPassword: "Mot de passe actuel",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer",
      updatePassword: "Mettre à jour le mot de passe",
      updating: "Mise à jour...",
      dangerZone: "⚠️ Zone dangereuse",
      dangerSub: "La suppression de votre compte est irréversible.",
      deleteAccount: "Supprimer mon compte",
      confirmDelete: "Confirmer la suppression",
      confirmWithPassword: "Confirmez avec votre mot de passe",
      cancel: "Annuler",
      deleting: "Suppression...",
      account: "👤 Compte",
      accountSub: "Gérez l'accès à votre compte",
      logoutBtn: "Se déconnecter",
      logoutDesc: "Fermer votre session sur cet appareil",
      emailVerified: "✅ Votre adresse email est vérifiée.",
      resendVerification: "Renvoyer l'email de vérification",
      resendSent: "✅ Lien de vérification renvoyé. Vérifiez votre boîte mail.",
      resendCooldown: "Veuillez patienter avant de renvoyer.",
      resendError: "Impossible d'envoyer l'email de vérification.",
      removePhotoShort: "Retirer",
      removePhotoAsk: "Confirmer la suppression ?",
    },
  },
  en: {
    profile: {
      title: "My profile",
      subtitle: "Manage your personal information and security",
      profileInfo: "📸 Photo & Information",
      profileSub: "Update your name, email and profile picture",
      profileUpdated: "✅ Profile updated successfully!",
      passwordUpdated: "✅ Password updated!",
      changePhoto: "Change photo",
      removePhoto: "Remove",
      removePhotoConfirm: "Remove profile photo?",
      firstName: "First name",
      lastName: "Family name",
      thirdName: "Third name (optional)",
      pseudonym: "Pseudonym (optional)",
      pseudonymHint: "Used in the dashboard greeting",
      email: "Email address",
      emailNotVerified: "⚠️ Your email address is not verified.",
      saveChanges: "Save changes",
      saving: "Saving...",
      passwordSection: "🔐 Change password",
      passwordSub: "Use a strong password of at least 8 characters",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm",
      updatePassword: "Update password",
      updating: "Updating...",
      dangerZone: "⚠️ Danger zone",
      dangerSub: "Deleting your account is irreversible.",
      deleteAccount: "Delete my account",
      confirmDelete: "Confirm deletion",
      confirmWithPassword: "Confirm with your password",
      cancel: "Cancel",
      deleting: "Deleting...",
      account: "👤 Account",
      accountSub: "Manage access to your account",
      logoutBtn: "Log out",
      logoutDesc: "End your session on this device",
      emailVerified: "✅ Your email address is verified.",
      resendVerification: "Resend verification email",
      resendSent: "✅ Verification link sent. Check your inbox.",
      resendCooldown: "Please wait before resending.",
      resendError: "Unable to send the verification email.",
      removePhotoShort: "Remove",
      removePhotoAsk: "Confirm removal?",
    },
  },
  ar: {
    profile: {
      title: "ملفي الشخصي",
      subtitle: "إدارة معلوماتك الشخصية وأمانك",
      profileInfo: "📸 الصورة والمعلومات",
      profileSub: "قم بتحديث اسمك وبريدك الإلكتروني وصورة ملفك الشخصي",
      profileUpdated: "✅ تم تحديث الملف الشخصي بنجاح!",
      passwordUpdated: "✅ تم تحديث كلمة المرور!",
      changePhoto: "تغيير الصورة",
      removePhoto: "إزالة",
      removePhotoConfirm: "إزالة الصورة الشخصية؟",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      thirdName: "الاسم الثالث (اختياري)",
      pseudonym: "الاسم المستعار (اختياري)",
      pseudonymHint: "يُستخدم في تحية لوحة التحكم",
      email: "البريد الإلكتروني",
      emailNotVerified: "⚠️ بريدك الإلكتروني غير مؤكد.",
      saveChanges: "حفظ التغييرات",
      saving: "جاري الحفظ...",
      passwordSection: "🔐 تغيير كلمة المرور",
      passwordSub: "استخدم كلمة مرور قوية مكونة من 8 أحرف على الأقل",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد",
      updatePassword: "تحديث كلمة المرور",
      updating: "جاري التحديث...",
      dangerZone: "⚠️ منطقة الخطر",
      dangerSub: "حذف حسابك لا يمكن التراجع عنه.",
      deleteAccount: "حذف حسابي",
      confirmDelete: "تأكيد الحذف",
      confirmWithPassword: "تأكيد باستخدام كلمة مرورك",
      cancel: "إلغاء",
      deleting: "جاري الحذف...",
      account: "👤 الحساب",
      accountSub: "إدارة الوصول إلى حسابك",
      logoutBtn: "تسجيل الخروج",
      logoutDesc: "إنهاء جلسة العمل على هذا الجهاز",
      emailVerified: "✅ تم تأكيد بريدك الإلكتروني.",
      resendVerification: "إعادة إرسال بريد التحقق",
      resendSent: "✅ تم إرسال رابط التحقق. تحقق من بريدك.",
      resendCooldown: "يرجى الانتظار قبل إعادة الإرسال.",
      resendError: "تعذر إرسال بريد التحقق.",
      removePhotoShort: "إزالة",
      removePhotoAsk: "تأكيد الإزالة؟",
    },
  },
};

export default function Edit() {
  const { auth } = usePage().props;
  const user = auth.user;
  const { tk } = useTheme();

  // Language detection
  const { lang, tr: appTr } = useLang();
  const tr = T[lang]?.profile || T.fr.profile;
  const isRTL = lang === 'ar';

  // Profile photo state
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoRef = useRef(null);
  const [confirmRemovePhoto, setConfirmRemovePhoto] = useState(false);

  // Logout modal
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Email verification resend state + cooldown
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);
  const [resendError, setResendError] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const emailVerified = !!user.email_verified_at;

  // Forms
  const profileForm = useForm({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    third_name: user.third_name || '',
    pseudonym: user.pseudonym || '',
    email: user.email,
    photo: null,
  });

  const passwordForm = useForm({
    current_password:      '',
    password:              '',
    password_confirmation: '',
  });

  const deleteForm = useForm({ password: '' });
  const [showDelete, setShowDelete] = useState(false);

  // Handlers
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    profileForm.setData('photo', file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submitProfile = (e) => {
    e.preventDefault();
    profileForm.patch(route('profile.update'), {
      onSuccess: () => setConfirmRemovePhoto(false),
    });
  };

  const submitPassword = (e) => {
    e.preventDefault();
    passwordForm.put(route('password.update'), {
      onSuccess: () => passwordForm.reset(),
    });
  };

  const submitDelete = (e) => {
    e.preventDefault();
    deleteForm.delete(route('profile.destroy'));
  };

  const handleResendVerification = () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendError(false);
    setResendMsg(null);
    router.post(route('verification.send'), {}, {
      preserveScroll: true,
      onSuccess: () => {
        setResendMsg(true);
        setResending(false);
        setCooldown(60);
        const remaining = (n) => {
          setCooldown(n);
          if (n > 0) window.setTimeout(() => remaining(n - 1), 1000);
        };
        remaining(59);
      },
      onError: (errors) => {
        setResendError(true);
        setResendMsg('error');
        setResending(false);
      },
      onFinish: () => setResending(false),
    });
  };

  const nameForInitials = user.display_name || user.name || '';
  const initials = nameForInitials.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const avatarSrc = photoPreview || user.profile_photo_url || null;

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <h1 style={s.title}>{tr.title}</h1>
          <p style={s.subtitle}>{tr.subtitle}</p>
        </div>

        {/* Profile card */}
        <div style={s.card} className="sp-profile-card" data-tutorial-target="profile-info">
          <h2 style={s.cardTitle}>{tr.profileInfo}</h2>
          <p style={s.cardSub}>{tr.profileSub}</p>

          <form onSubmit={submitProfile} style={s.form} encType="multipart/form-data">

            {/* Avatar */}
            <div style={s.avatarSection}>
              <div style={s.avatarWrap}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" style={s.avatarImg} />
                ) : (
                  <div style={s.avatarFallback}>{initials}</div>
                )}
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  style={s.avatarEditBtn}
                  title={tr.changePhoto}
                >
                  📷
                </button>
              </div>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <div style={{ textAlign: "start" }}>
                <p style={s.avatarName}>{user.display_name || user.name}</p>
                <p style={s.avatarEmail}>{user.email}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    style={s.changePhotoBtn}
                  >
                    {tr.changePhoto}
                  </button>
                  {(photoPreview || user.profile_photo_url) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmRemovePhoto) {
                          setConfirmRemovePhoto(true);
                          return;
                        }
                        setConfirmRemovePhoto(false);
                        router.delete(route('profile.photo.destroy'), {
                          onSuccess: () => setPhotoPreview(null),
                        });
                      }}
                      style={{ ...s.changePhotoBtn, color: 'var(--sp-error)', borderColor: 'var(--sp-errorBorder)' }}
                    >
                      {confirmRemovePhoto ? tr.removePhotoAsk : tr.removePhoto}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div style={s.row2} className="sp-profile-grid-2">
              <div style={s.field}>
                <label style={s.label} htmlFor="profile-first-name">{tr.firstName}</label>
                <input
                  id="profile-first-name"
                  type="text"
                  value={profileForm.data.first_name}
                  onChange={e => profileForm.setData('first_name', e.target.value)}
                  style={{ ...s.input, ...(profileForm.errors.first_name ? s.inputError : {}) }}
                />
                {profileForm.errors.first_name && <span style={s.error} role="alert">{profileForm.errors.first_name}</span>}
              </div>
              <div style={s.field}>
                <label style={s.label} htmlFor="profile-last-name">{tr.lastName}</label>
                <input
                  id="profile-last-name"
                  type="text"
                  value={profileForm.data.last_name}
                  onChange={e => profileForm.setData('last_name', e.target.value)}
                  style={{ ...s.input, ...(profileForm.errors.last_name ? s.inputError : {}) }}
                />
                {profileForm.errors.last_name && <span style={s.error} role="alert">{profileForm.errors.last_name}</span>}
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label} htmlFor="profile-third-name">{tr.thirdName}</label>
              <input
                id="profile-third-name"
                type="text"
                value={profileForm.data.third_name}
                onChange={e => profileForm.setData('third_name', e.target.value)}
                style={{ ...s.input, ...(profileForm.errors.third_name ? s.inputError : {}) }}
              />
              {profileForm.errors.third_name && <span style={s.error} role="alert">{profileForm.errors.third_name}</span>}
            </div>

            <div style={s.field}>
              <label style={s.label} htmlFor="profile-pseudonym">{tr.pseudonym}</label>
              <input
                id="profile-pseudonym"
                type="text"
                value={profileForm.data.pseudonym}
                onChange={e => profileForm.setData('pseudonym', e.target.value)}
                style={{ ...s.input, ...(profileForm.errors.pseudonym ? s.inputError : {}) }}
              />
              {profileForm.errors.pseudonym && <span style={s.error} role="alert">{profileForm.errors.pseudonym}</span>}
              <span style={{ fontSize: 'var(--sp-text-sm)', color: 'var(--sp-textMuted)' }}>{tr.pseudonymHint}</span>
            </div>

            <div style={s.field}>
              <label style={s.label} htmlFor="profile-email">{tr.email}</label>
              <input
                id="profile-email"
                type="email"
                value={profileForm.data.email}
                onChange={e => profileForm.setData('email', e.target.value)}
                style={{ ...s.input, ...(profileForm.errors.email ? s.inputError : {}) }}
              />
              {profileForm.errors.email && <span style={s.error} role="alert">{profileForm.errors.email}</span>}
            </div>

            {emailVerified ? (
              <div style={s.successMsg}>{tr.emailVerified}</div>
            ) : (
              <div style={s.warningWrap}>
                <div style={s.warningMsg}>{tr.emailNotVerified}</div>
                <div style={s.resendRow}>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending || cooldown > 0}
                    style={s.resendBtn}
                  >
                    {cooldown > 0
                      ? `${tr.resendVerification} (${cooldown}s)`
                      : resending
                        ? '…'
                        : tr.resendVerification}
                  </button>
                  {resendMsg === true && !resendError && (
                    <span style={s.resendOk} role="status">{tr.resendSent}</span>
                  )}
                  {resendError && (
                    <span style={s.resendBad} role="alert">{tr.resendError}</span>
                  )}
                </div>
              </div>
            )}

            <div style={s.formFooter}>
              <button type="submit" disabled={profileForm.processing} style={s.saveBtn}>
                {profileForm.processing ? tr.saving : tr.saveChanges}
              </button>
            </div>
          </form>
        </div>

        {/* Password card */}
        <div style={s.card} className="sp-profile-card">
          <h2 style={s.cardTitle}>{tr.passwordSection}</h2>
          <p style={s.cardSub}>{tr.passwordSub}</p>

          <form onSubmit={submitPassword} style={s.form}>
            <div style={s.field}>
              <label style={s.label} htmlFor="current-password">{tr.currentPassword}</label>
              <input
                id="current-password"
                type="password"
                value={passwordForm.data.current_password}
                onChange={e => passwordForm.setData('current_password', e.target.value)}
                placeholder="••••••••"
                style={{ ...s.input, ...(passwordForm.errors.current_password ? s.inputError : {}) }}
              />
              {passwordForm.errors.current_password && <span style={s.error} role="alert">{passwordForm.errors.current_password}</span>}
            </div>

            <div style={s.row2} className="sp-profile-grid-2">
              <div style={s.field}>
                <label style={s.label} htmlFor="new-password">{tr.newPassword}</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordForm.data.password}
                  onChange={e => passwordForm.setData('password', e.target.value)}
                  placeholder="••••••••"
                  style={{ ...s.input, ...(passwordForm.errors.password ? s.inputError : {}) }}
                />
                {passwordForm.errors.password && <span style={s.error} role="alert">{passwordForm.errors.password}</span>}
              </div>
              <div style={s.field}>
                <label style={s.label} htmlFor="confirm-password">{tr.confirmPassword}</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.data.password_confirmation}
                  onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                  placeholder="••••••••"
                  style={{ ...s.input, ...(passwordForm.errors.password_confirmation ? s.inputError : {}) }}
                />
                {passwordForm.errors.password_confirmation && <span style={s.error} role="alert">{passwordForm.errors.password_confirmation}</span>}
              </div>
            </div>

            <div style={s.formFooter}>
              <button type="submit" disabled={passwordForm.processing} style={s.saveBtn}>
                {passwordForm.processing ? tr.updating : tr.updatePassword}
              </button>
            </div>
          </form>
        </div>

        {/* Account / logout */}
        <div style={s.card} className="sp-profile-card">
          <h2 style={s.cardTitle}>{tr.account}</h2>
          <p style={s.cardSub}>{tr.accountSub}</p>
          <button type="button" onClick={() => setLogoutModalOpen(true)} style={s.logoutBtn}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span style={{ flex: 1, textAlign: 'start' }}>{tr.logoutBtn}</span>
          </button>
          <p style={{ margin: '8px 0 0', fontSize: 'var(--sp-text-sm)', color: 'var(--sp-textMuted)' }}>{tr.logoutDesc}</p>
        </div>

        {/* Danger zone */}
        <div style={{ ...s.card, border: '1px solid var(--sp-dangerBorder)', background: 'var(--sp-dangerBg)' }} className="sp-profile-card">
          <h2 style={{ ...s.cardTitle, color: 'var(--sp-danger)' }}>{tr.dangerZone}</h2>
          <p style={s.cardSub}>{tr.dangerSub}</p>

          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} style={s.deleteBtn}>
              {tr.deleteAccount}
            </button>
          ) : (
            <form onSubmit={submitDelete} style={s.form}>
              <div style={s.field}>
                <label style={s.label} htmlFor="delete-password">{tr.confirmWithPassword}</label>
                <input
                  id="delete-password"
                  type="password"
                  value={deleteForm.data.password}
                  onChange={e => deleteForm.setData('password', e.target.value)}
                  placeholder="••••••••"
                  style={{ ...s.input, borderColor: 'var(--sp-dangerBorder)' }}
                />
                {deleteForm.errors.password && <span style={s.error} role="alert">{deleteForm.errors.password}</span>}
              </div>
              <div style={{ ...s.row2, gap: '10px' }} className="sp-profile-grid-2">
                <button type="button" onClick={() => setShowDelete(false)} style={s.cancelBtn}>
                  {tr.cancel}
                </button>
                <button type="submit" disabled={deleteForm.processing} style={s.confirmDeleteBtn}>
                  {deleteForm.processing ? tr.deleting : tr.confirmDelete}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
      {logoutModalOpen && (
        <LogoutModal
          tk={tk}
          tr={appTr}
          isRTL={isRTL}
          onConfirm={() => { setLogoutModalOpen(false); router.post('/logout'); }}
          onCancel={() => setLogoutModalOpen(false)}
        />
      )}
    </AppLayout>
  );
}

// Styles (same as original, direction‑sensitive fields already handled)
const s = {
  page: { maxWidth: '720px', margin: '0 auto', padding: '32px 24px 60px', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: '20px', overflowX: 'hidden' },
  header: { marginBottom: '4px', textAlign: 'start' },
  title: { fontSize: 'var(--sp-text-2xl)', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  subtitle: { fontSize: 'var(--sp-text-lg)', color: 'var(--sp-textSecondary)', margin: 0 },

  card: { background: 'var(--sp-card)', border: '1px solid var(--sp-cardBorder)', borderRadius: '16px', padding: '24px 28px' },
  cardTitle: { fontSize: 'var(--sp-text-xl)', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  cardSub: { fontSize: 'var(--sp-text-base)', color: 'var(--sp-textMuted)', margin: '0 0 20px' },

  successMsg: { background: 'var(--sp-successBg)', border: '1px solid var(--sp-successBorder)', color: 'var(--sp-success)', borderRadius: '10px', padding: '10px 14px', fontSize: 'var(--sp-text-base)', marginBottom: '16px' },
  warningMsg: { background: 'var(--sp-warningBg)', border: '1px solid var(--sp-warningBorder)', color: 'var(--sp-warning)', borderRadius: '10px', padding: '10px 14px', fontSize: 'var(--sp-text-base)' },
  warningWrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  resendRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  resendBtn: { background: 'none', border: '1px solid var(--sp-accent)', color: 'var(--sp-accent)', borderRadius: '8px', padding: '8px 14px', fontSize: 'var(--sp-text-sm)', fontWeight: 600, cursor: 'pointer' },
  resendOk: { fontSize: 'var(--sp-text-sm)', color: 'var(--sp-success)', fontWeight: 500 },
  resendBad: { fontSize: 'var(--sp-text-sm)', color: 'var(--sp-error)', fontWeight: 500 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', background: 'var(--sp-dangerBg)', border: '1.5px solid var(--sp-dangerBorder)', color: 'var(--sp-danger)', fontSize: 'var(--sp-text-base)', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" },

  // Avatar
  avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: 'var(--sp-hoverBg)', borderRadius: '12px', flexWrap: 'wrap' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatarImg: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--sp-cardBorder)' },
  avatarFallback: { width: '72px', height: '72px', borderRadius: '50%', background: 'var(--sp-accentLight)', color: 'var(--sp-accent)', fontSize: 'var(--sp-text-2xl)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--sp-cardBorder)' },
  avatarEditBtn: { position: 'absolute', bottom: 0, insetInlineEnd: 0, width: '24px', height: '24px', borderRadius: '50%', background: 'var(--sp-accent)', border: '2px solid var(--sp-card)', cursor: 'pointer', fontSize: 'var(--sp-text-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarName: { fontSize: 'var(--sp-text-lg)', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 2px' },
  avatarEmail: { fontSize: 'var(--sp-text-base)', color: 'var(--sp-textSecondary)', margin: '0 0 10px' },
  changePhotoBtn: { background: 'none', border: '1px solid var(--sp-cardBorder)', borderRadius: '8px', padding: '6px 14px', fontSize: 'var(--sp-text-sm)', color: 'var(--sp-text)', cursor: 'pointer', fontWeight: 500 },

  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, width: '100%', boxSizing: 'border-box' },
  label: { fontSize: 'var(--sp-text-base)', fontWeight: 600, color: 'var(--sp-text)' },
  input: { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--sp-inputBorder)', fontSize: 'var(--sp-text-lg)', background: 'var(--sp-inputBg)', color: 'var(--sp-text)', outline: 'none', fontFamily: "'DM Sans', sans-serif" },
  inputError: { borderColor: 'var(--sp-dangerBorder)' },
  error: { fontSize: 'var(--sp-text-sm)', color: 'var(--sp-danger)', fontWeight: 500 },

  formFooter: { display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' },
  saveBtn: { padding: '10px 24px', background: 'var(--sp-accent)', color: 'var(--sp-accentText)', border: 'none', borderRadius: '10px', fontSize: 'var(--sp-text-base)', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

  deleteBtn: { padding: '10px 20px', background: 'none', border: '1px solid var(--sp-dangerBorder)', color: 'var(--sp-danger)', borderRadius: '10px', fontSize: 'var(--sp-text-base)', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '10px', background: 'var(--sp-subtleBg)', border: 'none', borderRadius: '10px', fontSize: 'var(--sp-text-base)', fontWeight: 600, cursor: 'pointer', color: 'var(--sp-text)' },
  confirmDeleteBtn: { flex: 1, padding: '10px', background: 'var(--sp-danger)', border: 'none', borderRadius: '10px', fontSize: 'var(--sp-text-base)', fontWeight: 600, cursor: 'pointer', color: 'var(--sp-accentText)' },
};
