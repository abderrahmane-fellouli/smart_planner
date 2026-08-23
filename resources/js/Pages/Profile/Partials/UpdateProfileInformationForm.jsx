import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

const T = {
  fr: { heading: "Informations du profil", desc: "Mettez à jour les informations de votre compte et votre adresse email.", name: "Nom", email: "Email", unverified: "Votre adresse email n'est pas vérifiée.", resend: "Cliquez ici pour renvoyer l'email de vérification.", sent: "Un nouveau lien de vérification a été envoyé.", save: "Enregistrer", saved: "Enregistré." },
  en: { heading: "Profile Information", desc: "Update your account's profile information and email address.", name: "Name", email: "Email", unverified: "Your email address is unverified.", resend: "Click here to re-send the verification email.", sent: "A new verification link has been sent to your email address.", save: "Save", saved: "Saved." },
  ar: { heading: "معلومات الملف الشخصي", desc: "حدّث معلومات حسابك وعنوان بريدك الإلكتروني.", name: "الاسم", email: "البريد الإلكتروني", unverified: "بريدك الإلكتروني غير موثّق.", resend: "انقر هنا لإعادة إرسال رسالة التحقق.", sent: "تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني.", save: "حفظ", saved: "تم الحفظ." },
};

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    let lang = "fr";
    if (typeof window !== "undefined") lang = localStorage.getItem("smartplanner_lang") || "fr";
    const tr = T[lang] || T.fr;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {tr.heading}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {tr.desc}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value={tr.name} />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value={tr.email} />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            {tr.unverified}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {tr.resend}
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                {tr.sent}
                            </div>
                        )}
                    </div>
                )}

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
