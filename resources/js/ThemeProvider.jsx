import React, { useState, useLayoutEffect, useMemo, createContext, useContext } from "react";
import { THEMES } from "@/Themes";

const TRANSLATIONS = {
    fr: { nav_section:"Navigation", dashboard:"Tableau de bord", calendar:"Calendrier", planning:"Mon planning", fixed_events:"Tâches fixes", preferences:"Préférences", statistics:"Statistiques", export:"Exporter", todos:"Tâches du jour", sleep_schedule:"Sommeil", generate_btn:"Générer le planning", profile_title:"Profil", logout:"Déconnexion", logout_title:"Se déconnecter", logout_confirm:"Êtes-vous sûr de vouloir vous déconnecter ?", yes:"Oui", cancel:"Annuler", fallback_name:"Utilisateur", dark_toggle_on:"Passer en mode clair", dark_toggle_off:"Passer en mode sombre", close_menu:"Fermer le menu", open_menu:"Ouvrir le menu", search_label:"Rechercher", close_search:"Fermer la recherche", dir:"ltr" },
    en: { nav_section:"Navigation", dashboard:"Dashboard", calendar:"Calendar", planning:"My Schedule", fixed_events:"Fixed Tasks", preferences:"Preferences", statistics:"Statistics", export:"Export", todos:"Daily Tasks", sleep_schedule:"Sleep", generate_btn:"Generate Schedule", profile_title:"Profile", logout:"Logout", logout_title:"Log out", logout_confirm:"Are you sure you want to log out?", yes:"Yes", cancel:"Cancel", fallback_name:"User", dark_toggle_on:"Switch to light mode", dark_toggle_off:"Switch to dark mode", close_menu:"Close menu", open_menu:"Open menu", search_label:"Search", close_search:"Close search", dir:"ltr" },
    ar: { nav_section:"التنقل", dashboard:"لوحة التحكم", calendar:"البرنامج", planning:"جدولي", fixed_events:"المهام الثابتة", preferences:"التفضيلات", statistics:"الإحصائيات", export:"تصدير", todos:"مهام اليوم", sleep_schedule:"النوم", generate_btn:"إنشاء الجدول", profile_title:"الملف الشخصي", logout:"تسجيل الخروج", logout_title:"تسجيل الخروج", logout_confirm:"هل أنت متأكد من أنك تريد تسجيل الخروج؟", yes:"نعم", cancel:"إلغاء", fallback_name:"مستخدم", dark_toggle_on:"التبديل إلى الوضع الفاتح", dark_toggle_off:"التبديل إلى الوضع الداكن", close_menu:"إغلاق القائمة", open_menu:"فتح القائمة", search_label:"بحث", close_search:"إغلاق البحث", dir:"rtl" },
};

export const LangContext = createContext({ lang: "fr", tr: TRANSLATIONS.fr, setLang: () => {} });
export const useLang = () => useContext(LangContext);

const ThemeContext = createContext({ dark: false, tk: THEMES.default.light, themeName: 'default', setThemeName: () => {}, toggleDark: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children, preferences }) {
    const backendTheme = preferences?.theme;

    const [dark, setDark] = useState(() => {
        try { return localStorage.getItem("smartplanner_dark") === "true"; }
        catch { return false; }
    });

    const [themeName, setThemeNameState] = useState(() => {
        try {
            if (backendTheme) return backendTheme;
            return localStorage.getItem("smartplanner_theme") || "default";
        }
        catch { return "default"; }
    });

    const [lang, setLangState] = useState(() => {
        try { return localStorage.getItem("smartplanner_lang") || "fr"; }
        catch { return "fr"; }
    });

    const tr = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    const tk = useMemo(() => (THEMES[themeName] || THEMES.default)[dark ? 'dark' : 'light'], [themeName, dark]);
    const font = useMemo(() => (THEMES[themeName] || THEMES.default).font || "'DM Sans', sans-serif", [themeName]);
    const isRTL = tr.dir === "rtl";

    const setLang = (l) => {
        setLangState(l);
        try { localStorage.setItem("smartplanner_lang", l); } catch {}

        // Best-effort server persistence so transactional emails use the same
        // language. Guarded: guests / offline simply get a no-op (fetch failure
        // is ignored) - the UI language still works from localStorage.
        const loc = window && window.location && window.location.origin;
        const csrf = document && document.head ? document.querySelector('meta[name="csrf-token"]')?.content : null;
        if (loc && csrf) {
            fetch(`${loc}/locale`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ locale: l }),
                credentials: 'same-origin',
            }).catch(() => {});
        }
    };

    const setThemeName = (name) => {
        setThemeNameState(name);
        try { localStorage.setItem("smartplanner_theme", name); } catch {}
    };

    const toggleDark = () => setDark(d => !d);

    useLayoutEffect(() => {
        try { localStorage.setItem("smartplanner_dark", dark); } catch {}
        try { localStorage.setItem("smartplanner_theme", themeName); } catch {}
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
        document.documentElement.lang = lang;
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        document.documentElement.setAttribute("data-theme-name", themeName);
        Object.entries(tk).forEach(([k, v]) => {
            document.documentElement.style.setProperty(`--sp-${k}`, v);
        });
        document.documentElement.style.setProperty('--sp-font', font);
    }, [dark, themeName, isRTL, lang, tk, font]);

    return (
        <LangContext.Provider value={{ lang, tr, setLang }}>
            <ThemeContext.Provider value={{ dark, tk, themeName, setThemeName, toggleDark }}>
                {children}
            </ThemeContext.Provider>
        </LangContext.Provider>
    );
}
