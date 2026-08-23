import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

const T = {
  fr: { heading: "Mettre à jour le mot de passe", desc: "Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester sécurisé.", currentPassword: "Mot de passe actuel", newPassword: "Nouveau mot de passe", confirmPassword: "Confirmer le mot de passe", save: "Enregistrer", saved: "Enregistré." },
  en: { heading: "Update Password", desc: "Ensure your account is using a long, random password to stay secure.", currentPassword: "Current Password", newPassword: "New Password", confirmPassword: "Confirm Password", save: "Save", saved: "Saved." },
  ar: { heading: "تحديث كلمة المرور", desc: "تأكد من أن حسابك يستخدم كلمة مرور طويلة وعشوائية للبقاء آمناً.", currentPassword: "كلمة المرور الحالية", newPassword: "كلمة المرور الجديدة", confirmPassword: "تأكيد كلمة المرور", save: "حفظ", saved: "تم الحفظ." },
};

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    let lang = "fr";
    if (typeof window !== "undefined") lang = localStorage.getItem("smartplanner_lang") || "fr";
    const tr = T[lang] || T.fr;

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{tr.heading}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{tr.desc}</p>
            </header>
            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="current_password" value={tr.currentPassword} />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="password" value={tr.newPassword} />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="password_confirmation" value={tr.confirmPassword} />
                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>{tr.save}</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tr.saved}</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
