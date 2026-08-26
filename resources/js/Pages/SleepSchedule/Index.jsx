import React, { useState } from "react";
import { router } from "@inertiajs/react";
import AppLayout from "@/Pages/AppLayout";
import TimeInput from "@/Components/TimeInput";
import { useLang, useTheme } from "@/Pages/AppLayout";

const FRENCH_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DAY_KEYS = { fr: ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"], en: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], ar: ["\u0627\u0644\u0625\u062B\u0646\u064A\u0646","\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621","\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621","\u0627\u0644\u062E\u0645\u064A\u0633","\u0627\u0644\u062C\u0645\u0639\u0629","\u0627\u0644\u0633\u0628\u062A","\u0627\u0644\u0623\u062D\u062F"] };
const MODE_OPTIONS = ["same", "different", "except"];
const MODE_LABELS = { fr: { same: "M\u00EAme horaire", different: "Horaire diff\u00E9rent par jour", except: "Sauf quelques jours" }, en: { same: "Same time", different: "Different per day", except: "Except some days" }, ar: { same: "\u0648\u0642\u062A \u0648\u0627\u062D\u062F", different: "\u0648\u0642\u062A \u0645\u062E\u062A\u0644\u0641 \u0644\u0643\u0644 \u064A\u0648\u0645", except: "\u0639\u0645\u0627\u0646 \u0628\u0639\u0636 \u0627\u0644\u0623\u064A\u0627\u0645" } };

/* Full translations for SleepSchedule page */
const S = {
    fr: {
        title: "Horaires de sommeil",
        wake: "R\u00E9veil",
        bedtime: "Coucher",
        diff_days: "Jours avec horaire diff\u00E9rent :",
        save: "Enregistrer",
        saving: "Enregistrement...",
    },
    en: {
        title: "Sleep Schedule",
        wake: "Wake-up",
        bedtime: "Bedtime",
        diff_days: "Days with different time:",
        save: "Save",
        saving: "Saving...",
    },
    ar: {
        title: "\u062C\u062F\u0648\u0644 \u0627\u0644\u0646\u0648\u0645",
        wake: "\u0627\u0644\u0627\u0633\u062A\u064A\u0642\u0627\u0638",
        bedtime: "\u0627\u0644\u0646\u0648\u0645",
        diff_days: "\u0627\u0644\u0623\u064A\u0627\u0645 \u0628\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u062E\u062A\u0644\u0641 :",
        save: "\u062D\u0641\u0638",
        saving: "\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...",
    },
};

export default function Index({ sleepSchedule, dayTimes = [], days = FRENCH_DAYS }) {
    const { lang } = useLang();
    const { tk } = useTheme();
    const tr = S[lang] || S.fr;
    const isRTL = lang === "ar";

    const [wakeMode, setWakeMode] = useState(sleepSchedule?.wake_mode || "same");
    const [bedtimeMode, setBedtimeMode] = useState(sleepSchedule?.bedtime_mode || "same");
    const [wakeSame, setWakeSame] = useState(sleepSchedule?.wake_same_time || "07:00");
    const [bedtimeSame, setBedtimeSame] = useState(sleepSchedule?.bedtime_same_time || "22:00");
    const [wakeExceptDays, setWakeExceptDays] = useState(sleepSchedule?.wake_except_days || []);
    const [bedtimeExceptDays, setBedtimeExceptDays] = useState(sleepSchedule?.bedtime_except_days || []);
    const [wakeDayTimes, setWakeDayTimes] = useState(
        dayTimes.filter(d => d.type === "wake").reduce((acc, d) => ({ ...acc, [d.day_of_week]: d.time }), {})
    );
    const [bedtimeDayTimes, setBedtimeDayTimes] = useState(
        dayTimes.filter(d => d.type === "bedtime").reduce((acc, d) => ({ ...acc, [d.day_of_week]: d.time }), {})
    );

    const dayLabels = DAY_KEYS[lang] || DAY_KEYS.fr;

    const [saving, setSaving] = useState(false);

    function toggleExceptDay(day, isWake) {
        if (isWake) {
            setWakeExceptDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
        } else {
            setBedtimeExceptDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
        }
    }

    function setDayTime(day, time, isWake) {
        if (isWake) setWakeDayTimes(prev => ({ ...prev, [day]: time }));
        else setBedtimeDayTimes(prev => ({ ...prev, [day]: time }));
    }

    function handleSave(e) {
        e.preventDefault();
        if (saving) return;
        const wake_day_times = Object.entries(wakeDayTimes).map(([day, time]) => ({ day, time }));
        const bedtime_day_times = Object.entries(bedtimeDayTimes).map(([day, time]) => ({ day, time }));
        setSaving(true);
        router.post("/sleep-schedule", {
            wake_mode: wakeMode, bedtime_mode: bedtimeMode,
            wake_same_time: wakeSame, bedtime_same_time: bedtimeSame,
            wake_except_days: wakeMode === "except" ? wakeExceptDays : [],
            bedtime_except_days: bedtimeMode === "except" ? bedtimeExceptDays : [],
            wake_day_times: wakeMode !== "same" ? wake_day_times : [],
            bedtime_day_times: bedtimeMode !== "same" ? bedtime_day_times : [],
            lang,
        }, {
            // Re-enable the save button whether the request succeeded or failed.
            onFinish: () => setSaving(false),
        });
    }

    function renderModeSection(label, mode, setMode, isWake) {
        const exceptDays = isWake ? wakeExceptDays : bedtimeExceptDays;
        const dayTimesObj = isWake ? wakeDayTimes : bedtimeDayTimes;
        const setDay = (d, t) => setDayTime(d, t, isWake);

        return (
            <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: "var(--sp-text-sm)", fontWeight: 600, color: tk.text, margin: "0 0 10px" }}>{label}</h3>
                <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    {MODE_OPTIONS.map(m => (
                        <button key={m} type="button" onClick={() => setMode(m)}
                            style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${mode === m ? tk.accent : tk.inputBorder}`, background: mode === m ? tk.accent : tk.card, color: mode === m ? tk.accentText : tk.text, fontSize: "var(--sp-text-xs)", cursor: "pointer", fontWeight: 500 }}>
                            {MODE_LABELS[lang]?.[m] || m}
                        </button>
                    ))}
                </div>

                {mode === "same" && (
                    <TimeInput value={isWake ? wakeSame : bedtimeSame}
                        onChange={v => isWake ? setWakeSame(v) : setBedtimeSame(v)}
                        style={{ minWidth: 0, width: '100%', maxWidth: 200, boxSizing: 'border-box' }} />
                )}

                {mode === "different" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                        {days.map((day, i) => (
                            <div key={day} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <label style={{ fontSize: "var(--sp-text-xs)", color: tk.textMuted }}>{dayLabels[i]}</label>
                                <TimeInput value={dayTimesObj[day] || ""} onChange={v => setDay(day, v)}
                                    style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
                            </div>
                        ))}
                    </div>
                )}

                {mode === "except" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <TimeInput value={isWake ? wakeSame : bedtimeSame}
                            onChange={v => isWake ? setWakeSame(v) : setBedtimeSame(v)}
                            style={{ width: "fit-content", minWidth: 0, boxSizing: 'border-box' }} />
                        <p style={{ fontSize: "var(--sp-text-xs)", color: tk.textMuted }}>{tr.diff_days}</p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {days.map((day, i) => {
                                const active = exceptDays.includes(day);
                                return (
                                    <button key={day} type="button" onClick={() => toggleExceptDay(day, isWake)}
                                        style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${active ? tk.warning : tk.inputBorder}`, background: active ? tk.warningBg : tk.card, color: active ? tk.warning : tk.text, fontSize: "var(--sp-text-xs)", cursor: "pointer" }}>
                                        {dayLabels[i]}
                                    </button>
                                );
                            })}
                        </div>
                        {exceptDays.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
                                {exceptDays.map(day => {
                                    const idx = days.indexOf(day);
                                    return (
                                        <div key={day} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                            <label style={{ fontSize: "var(--sp-text-xs)", color: tk.textMuted }}>{dayLabels[idx]}</label>
                                            <TimeInput value={dayTimesObj[day] || ""} onChange={v => setDay(day, v)}
                                                style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <AppLayout>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 24px", overflowX: 'hidden' }}>
                <h1 style={{ fontSize: "var(--sp-text-xl)", fontWeight: 700, color: tk.text, margin: "0 0 24px" }}>
                    {tr.title}
                </h1>
                <form onSubmit={handleSave}>
                    <div style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 20 }}>
                        {renderModeSection(tr.wake, wakeMode, setWakeMode, true)}
                        {renderModeSection(tr.bedtime, bedtimeMode, setBedtimeMode, false)}
                    </div>
                    <button type="submit" disabled={saving} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 8, background: tk.accent, color: tk.accentText, border: "none", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, fontSize: "var(--sp-text-sm)" }}>
                        {saving ? tr.saving : tr.save}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
