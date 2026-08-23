import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

const T = {
  fr: { heading: "Supprimer le compte", desc: "Une fois votre compte supprimé, toutes ses ressources et données seront supprimées définitivement. Avant de supprimer votre compte, veuillez télécharger les données que vous souhaitez conserver.", confirmTitle: "Êtes-vous sûr de vouloir supprimer votre compte ?", confirmDesc: "Une fois votre compte supprimé, toutes ses ressources et données seront supprimées définitivement. Veuillez entrer votre mot de passe pour confirmer.", password: "Mot de passe", cancel: "Annuler", delete: "Supprimer le compte" },
  en: { heading: "Delete Account", desc: "Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.", confirmTitle: "Are you sure you want to delete your account?", confirmDesc: "Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.", password: "Password", cancel: "Cancel", delete: "Delete Account" },
  ar: { heading: "حذف الحساب", desc: "بمجرد حذف حسابك، سيتم حذف جميع موارده وبياناته نهائياً. قبل حذف حسابك، يرجى تنزيل أي بيانات ترغب في الاحتفاظ بها.", confirmTitle: "هل أنت متأكد أنك تريد حذف حسابك؟", confirmDesc: "بمجرد حذف حسابك، سيتم حذف جميع موارده وبياناته نهائياً. يرجى إدخال كلمة المرور للتأكيد.", password: "كلمة المرور", cancel: "إلغاء", delete: "حذف الحساب" },
};

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();
    let lang = "fr";
    if (typeof window !== "undefined") lang = localStorage.getItem("smartplanner_lang") || "fr";
    const tr = T[lang] || T.fr;

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{tr.heading}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{tr.desc}</p>
            </header>
            <DangerButton onClick={confirmUserDeletion}>{tr.delete}</DangerButton>
            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{tr.confirmTitle}</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{tr.confirmDesc}</p>
                    <div className="mt-6">
                        <InputLabel htmlFor="password" value={tr.password} className="sr-only" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder={tr.password}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>{tr.cancel}</SecondaryButton>
                        <DangerButton className="ms-3" disabled={processing}>{tr.delete}</DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
