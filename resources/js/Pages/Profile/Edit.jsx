import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Pages/AppLayout';
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
      fullName: "Nom complet",
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
      fullName: "Full name",
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
      fullName: "الاسم الكامل",
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
    },
  },
};

export default function Edit({ mustVerifyEmail, status }) {
  const { auth } = usePage().props;
  const user = auth.user;

  // Language detection
  let lang = "fr";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("smartplanner_lang") || "fr";
  }
  const tr = T[lang]?.profile || T.fr.profile;
  const isRTL = lang === "ar";

  // Status message mapping
  let displayStatus = null;
  if (status === 'profile-updated') displayStatus = tr.profileUpdated;
  if (status === 'password-updated') displayStatus = tr.passwordUpdated;

  // Profile photo state
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoRef = useRef(null);

  // Forms
  const profileForm = useForm({
    name:  user.name,
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
    profileForm.patch(route('profile.update'));
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

  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const avatarSrc = photoPreview || user.profile_photo_url || null;

  // Helper for RTL-aware styles
  const rtlStyle = (base, rtlOverrides) => isRTL ? { ...base, ...rtlOverrides } : base;

  return (
    <AppLayout>
      <Head title={tr.title} />
      <div style={{ ...s.page, direction: isRTL ? "rtl" : "ltr" }}>

        {/* Header */}
        <div style={rtlStyle(s.header, { textAlign: 'right' })}>
          <h1 style={s.title}>{tr.title}</h1>
          <p style={s.subtitle}>{tr.subtitle}</p>
        </div>

        {/* Profile card */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>{tr.profileInfo}</h2>
          <p style={s.cardSub}>{tr.profileSub}</p>

          {displayStatus === tr.profileUpdated && (
            <div style={s.successMsg}>{displayStatus}</div>
          )}

          <form onSubmit={submitProfile} style={s.form}>

            {/* Avatar */}
            <div style={rtlStyle(s.avatarSection, { flexDirection: 'row-reverse' })}>
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
              <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <p style={s.avatarName}>{user.name}</p>
                <p style={s.avatarEmail}>{user.email}</p>
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  style={s.changePhotoBtn}
                >
                  {tr.changePhoto}
                </button>
              </div>
            </div>

            {/* Fields */}
            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label} htmlFor="profile-name">{tr.fullName}</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileForm.data.name}
                  onChange={e => profileForm.setData('name', e.target.value)}
                  style={{ ...s.input, ...(profileForm.errors.name ? s.inputError : {}) }}
                />
                {profileForm.errors.name && <span style={s.error} role="alert">{profileForm.errors.name}</span>}
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
            </div>

            {mustVerifyEmail && user.email_verified_at === null && (
              <div style={s.warningMsg}>{tr.emailNotVerified}</div>
            )}

            <div style={rtlStyle(s.formFooter, { justifyContent: 'flex-start' })}>
              <button type="submit" disabled={profileForm.processing} style={s.saveBtn}>
                {profileForm.processing ? tr.saving : tr.saveChanges}
              </button>
            </div>
          </form>
        </div>

        {/* Password card */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>{tr.passwordSection}</h2>
          <p style={s.cardSub}>{tr.passwordSub}</p>

          {displayStatus === tr.passwordUpdated && (
            <div style={s.successMsg}>{displayStatus}</div>
          )}

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

            <div style={s.row2}>
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

            <div style={rtlStyle(s.formFooter, { justifyContent: 'flex-start' })}>
              <button type="submit" disabled={passwordForm.processing} style={s.saveBtn}>
                {passwordForm.processing ? tr.updating : tr.updatePassword}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div style={{ ...s.card, border: '1px solid var(--sp-dangerBorder)', background: 'var(--sp-dangerBg)' }}>
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
              <div style={{ ...s.row2, gap: '10px' }}>
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
    </AppLayout>
  );
}

// Styles (same as original, direction‑sensitive fields already handled)
const s = {
  page: { maxWidth: '720px', margin: '0 auto', padding: '32px 24px 60px', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: '20px', overflowX: 'hidden' },
  header: { marginBottom: '4px' },
  title: { fontSize: '22px', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: 'var(--sp-textSecondary)', margin: 0 },

  card: { background: 'var(--sp-card)', border: '1px solid var(--sp-cardBorder)', borderRadius: '16px', padding: '24px 28px' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 4px' },
  cardSub: { fontSize: '13px', color: 'var(--sp-textMuted)', margin: '0 0 20px' },

  successMsg: { background: 'var(--sp-successBg)', border: '1px solid var(--sp-successBorder)', color: 'var(--sp-success)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
  warningMsg: { background: 'var(--sp-warningBg)', border: '1px solid var(--sp-warningBorder)', color: 'var(--sp-warning)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' },

  // Avatar
  avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: 'var(--sp-hoverBg)', borderRadius: '12px' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatarImg: { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--sp-cardBorder)' },
  avatarFallback: { width: '72px', height: '72px', borderRadius: '50%', background: 'var(--sp-accentLight)', color: 'var(--sp-accent)', fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--sp-cardBorder)' },
  avatarEditBtn: { position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: 'var(--sp-accent)', border: '2px solid var(--sp-card)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarName: { fontSize: '15px', fontWeight: 700, color: 'var(--sp-text)', margin: '0 0 2px' },
  avatarEmail: { fontSize: '13px', color: 'var(--sp-textSecondary)', margin: '0 0 10px' },
  changePhotoBtn: { background: 'none', border: '1px solid var(--sp-cardBorder)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', color: 'var(--sp-text)', cursor: 'pointer', fontWeight: 500 },

  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--sp-text)' },
  input: { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--sp-inputBorder)', fontSize: '14px', background: 'var(--sp-inputBg)', color: 'var(--sp-text)', outline: 'none', fontFamily: "'DM Sans', sans-serif" },
  inputError: { borderColor: 'var(--sp-dangerBorder)' },
  error: { fontSize: '12px', color: 'var(--sp-danger)', fontWeight: 500 },

  formFooter: { display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' },
  saveBtn: { padding: '10px 24px', background: 'var(--sp-accent)', color: 'var(--sp-accentText)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

  deleteBtn: { padding: '10px 20px', background: 'none', border: '1px solid var(--sp-dangerBorder)', color: 'var(--sp-danger)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '10px', background: 'var(--sp-subtleBg)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--sp-text)' },
  confirmDeleteBtn: { flex: 1, padding: '10px', background: 'var(--sp-danger)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--sp-accentText)' },
};
