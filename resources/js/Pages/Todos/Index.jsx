import React, { useState, useMemo, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";
import AppLayout from "@/Pages/AppLayout";
import { useLang, useTheme } from "@/Pages/AppLayout";
import { useToast } from "@/Components/Toast";

/* ── Translations ─────────────────────────────────────────────────── */
const T = {
    fr: {
        title: "T\u00E2ches du jour",
        placeholder: "Nouvelle t\u00E2che...",
        all: "Toutes",
        pending: "\u00C0 faire",
        done: "Termin\u00E9es",
        completed_count: "{{n}} termin\u00E9(e)s",
        remaining: "{{n}} restant(e)s",
        no_tasks: "Aucune t\u00E2che. Ajoutez-en une !",
        difficulty: "Difficult\u00E9",
        d1: "1 \u2014 Tr\u00E8s facile",
        d2: "2 \u2014 Facile",
        d3: "3 \u2014 Mod\u00E9r\u00E9",
        d4: "4 \u2014 Difficile",
        d5: "5 \u2014 Tr\u00E8s difficile",
        add: "Ajouter",
        schedule: "Ajouter au planning",
        day: "Jour",
        time: "Heure",
        duration: "Dur\u00E9e (min)",
        daily_task: "T\u00E2che du jour",
        delete: "Supprimer",
        progress: "Progression",
        of: "sur",
        descPlaceholder: "Description (optionnel)",
        descLabel: "Description",
        timeHour: "Heure",
        timeMinute: "Min",
        errorTitle: "Entrez un nom de t\u00E2che",
        saveError: "Erreur lors de l'ajout de la t\u00E2che.",
        vEasy: "Tr\u00E8s facile",
        easy: "Facile",
        moderate: "Mod\u00E9r\u00E9",
        hard: "Difficile",
        vHard: "Tr\u00E8s difficile",
    },
    en: {
        title: "Daily Tasks",
        placeholder: "New task...",
        all: "All",
        pending: "Pending",
        done: "Done",
        completed_count: "{{n}} completed",
        remaining: "{{n}} remaining",
        no_tasks: "No tasks yet. Add one!",
        difficulty: "Difficulty",
        d1: "1 \u2014 Very easy",
        d2: "2 \u2014 Easy",
        d3: "3 \u2014 Moderate",
        d4: "4 \u2014 Difficult",
        d5: "5 \u2014 Very difficult",
        add: "Add",
        schedule: "Add to schedule",
        day: "Day",
        time: "Time",
        duration: "Duration (min)",
        daily_task: "Daily Task",
        delete: "Delete",
        progress: "Progress",
        of: "of",
        descPlaceholder: "Description (optional)",
        descLabel: "Description",
        timeHour: "Hour",
        timeMinute: "Min",
        errorTitle: "Enter a task name",
        saveError: "Failed to add the task.",
        vEasy: "Very easy",
        easy: "Easy",
        moderate: "Moderate",
        hard: "Difficult",
        vHard: "Very difficult",
        deleteConfirm: "Delete this task?",
    },
    ar: {
        title: "\u0645\u0647\u0627\u0645 \u0627\u0644\u064A\u0648\u0645",
        placeholder: "\u0645\u0647\u0645\u0629 \u062C\u062F\u064A\u062F\u0629...",
        all: "\u0627\u0644\u0643\u0644",
        pending: "\u0642\u064A\u062F \u0627\u0644\u0625\u0646\u062C\u0627\u0632",
        done: "\u0645\u0646\u062C\u0632\u0629",
        completed_count: "{{n}} \u0645\u0646\u062C\u0632\u0629",
        remaining: "{{n}} \u0645\u062A\u0628\u0642\u064A\u0629",
        no_tasks: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0647\u0627\u0645. \u0623\u0636\u0641 \u0648\u0627\u062D\u062F\u0627\u064B!",
        difficulty: "\u0627\u0644\u0635\u0639\u0648\u0628\u0629",
        d1: "1 \u2014 \u0633\u0647\u0644\u0629 \u062C\u062F\u0627\u064B",
        d2: "2 \u2014 \u0633\u0647\u0644\u0629",
        d3: "3 \u2014 \u0645\u062A\u0648\u0633\u0637\u0629",
        d4: "4 \u2014 \u0635\u0639\u0628\u0629",
        d5: "5 \u2014 \u0635\u0639\u0648\u0628\u0629 \u062C\u062F\u0627\u064B",
        add: "\u0625\u0636\u0627\u0641\u0629",
        schedule: "\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u062C\u062F\u0648\u0644",
        day: "\u0627\u0644\u064A\u0648\u0645",
        time: "\u0627\u0644\u0648\u0642\u062A",
        duration: "\u0627\u0644\u0645\u062F\u0629 (\u062F\u0642\u0627\u0626\u0642)",
        daily_task: "\u0645\u0647\u0645\u0629 \u064A\u0648\u0645\u064A\u0629",
        delete: "\u062D\u0630\u0641",
        progress: "\u0627\u0644\u062A\u0642\u062F\u0645",
        of: "\u0645\u0646",
        descPlaceholder: "\u0627\u0644\u0648\u0635\u0641 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
        descLabel: "\u0627\u0644\u0648\u0635\u0641",
        timeHour: "\u0627\u0644\u0633\u0627\u0639\u0629",
        timeMinute: "\u0627\u0644\u062F\u0642\u064A\u0642\u0629",
        errorTitle: "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u0647\u0645\u0629",
        saveError: "\u0641\u0634\u0644 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0647\u0645\u0629.",
        vEasy: "\u0633\u0647\u0644\u0629 \u062C\u062F\u0627\u064B",
        easy: "\u0633\u0647\u0644\u0629",
        moderate: "\u0645\u062A\u0648\u0633\u0637\u0629",
        hard: "\u0635\u0639\u0628\u0629",
        vHard: "\u0635\u0639\u0648\u0628\u0629 \u062C\u062F\u0627\u064B",
        deleteConfirm: "\u0647\u0644 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0645\u0629\u061F",
    },
};

const DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_AR = ["\u0627\u0644\u0625\u062B\u0646\u064A\u0646", "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621", "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621", "\u0627\u0644\u062E\u0645\u064A\u0633", "\u0627\u0644\u062C\u0645\u0639\u0629", "\u0627\u0644\u0633\u0628\u062A", "\u0627\u0644\u0623\u062D\u062F"];

const DIFF_LABELS_KEYS = ["", "vEasy", "easy", "moderate", "hard", "vHard"];

/* ── Star Icon ────────────────────────────────────────────────────── */
function StarIcon({ filled, size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    );
}

/* ── Close Icon ───────────────────────────────────────────────────── */
function CloseIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

/* ── Circular Progress Ring ──────────────────────────────────────── */
function ProgressRing({ percent, size = 80, stroke = 6, tk }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={tk.subtleBg} strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={tk.accent} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.4s ease" }} />
        </svg>
    );
}

/* ── Difficulty Filter Options ────────────────────────────────────── */
const diffFilterOptions = [
    { value: "", labelKey: "all" },
    { value: "1", stars: 1 },
    { value: "2", stars: 2 },
    { value: "3", stars: 3 },
    { value: "4", stars: 4 },
    { value: "5", stars: 5 },
];

/* ── Main Component ──────────────────────────────────────────────── */
export default function Index({ todos = [] }) {
    const { lang } = useLang();
    const { tk } = useTheme();
    const tr = T[lang] || T.fr;
    const isRTL = lang === "ar";

    // Ref keeps the latest toast API available inside stable callbacks
    // without re-creating them on every render.
    const toast = useToast();
    const toastRef = useRef(toast);
    toastRef.current = toast;

    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newDifficulty, setNewDifficulty] = useState(3);
    const [newIsScheduled, setNewIsScheduled] = useState(false);
    const [newDay, setNewDay] = useState("");
    const [newHour, setNewHour] = useState("18");
    const [newMinute, setNewMinute] = useState("00");
    const [newDuration, setNewDuration] = useState(30);
    const [filter, setFilter] = useState("pending");
    const [diffFilter, setDiffFilter] = useState("");
    const [titleError, setTitleError] = useState("");

    const days = lang === "ar" ? DAYS_AR : lang === "en" ? DAYS_EN : DAYS_FR;
    const dayValues = DAYS_FR;

    const sorted = useMemo(() => {
        const list = [...todos];
        list.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return (b.priority || 3) - (a.priority || 3);
        });
        return list;
    }, [todos]);

    const filtered = useMemo(() => {
        let list = sorted;
        if (filter === "pending") list = list.filter(t => !t.completed);
        else if (filter === "done") list = list.filter(t => t.completed);
        if (diffFilter) list = list.filter(t => String(t.priority) === diffFilter);
        return list;
    }, [sorted, filter, diffFilter]);

    const pendingCount = todos.filter(t => !t.completed).length;
    const doneCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;
    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const handleAdd = useCallback((e) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            setTitleError(tr.errorTitle);
            return;
        }
        const timeStr = `${newHour}:${newMinute}`;
        router.post("/todos", {
            title: newTitle.trim(),
            description: newDescription.trim() || null,
            priority: newDifficulty,
            is_scheduled: newIsScheduled,
            scheduled_day: newIsScheduled ? (newDay || dayValues[0]) : null,
            scheduled_time: newIsScheduled ? timeStr : null,
            scheduled_duration: newIsScheduled ? newDuration : null,
            lang,
        }, {
            preserveState: true,
            // Clear the form only after the task was actually created —
            // if the server rejects it, keep what the user typed.
            onSuccess: () => {
                setNewTitle("");
                setNewDescription("");
                setNewDifficulty(3);
                setNewIsScheduled(false);
                setNewDay("");
                setNewHour("18");
                setNewMinute("00");
                setNewDuration(30);
                setTitleError("");
            },
            onError: () => toastRef.current?.error(tr.saveError),
        });
    }, [newTitle, newDescription, newDifficulty, newIsScheduled, newDay, newHour, newMinute, newDuration, lang, dayValues, tr]);

    const handleToggle = useCallback((id) => {
        router.post(`/todos/${id}/toggle`, {}, { preserveState: true });
    }, []);

    const handleDelete = useCallback((id) => {
        if (!confirm(tr.deleteConfirm)) return;
        router.delete(`/todos/${id}`, { preserveState: true });
    }, [tr.deleteConfirm]);

    const diffColor = (d) => {
        const colors = [tk.textMuted, tk.success, tk.accent, tk.warning, tk.danger];
        return colors[Math.min(Math.max(d || 3, 1), 5) - 1] || tk.textMuted;
    };

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), []);
    const minutes = useMemo(() => ["00", "15", "30", "45"], []);

    const tabs = [
        { key: "all", label: tr.all, count: totalCount },
        { key: "pending", label: tr.pending, count: pendingCount },
        { key: "done", label: tr.done, count: doneCount },
    ];

    const selectStyle = {
        padding: "5px 8px",
        borderRadius: 6,
        border: `1px solid ${tk.inputBorder}`,
        background: tk.inputBg,
        color: tk.text,
        fontSize: 11,
        cursor: "pointer",
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 60px" }}>
                {/* Header + Progress Ring */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <ProgressRing percent={percent} tk={tk} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "var(--sp-text-lg)", fontWeight: 700, color: tk.text, lineHeight: 1 }}>{percent}%</span>
                        </div>
                    </div>
                    <div>
                        <h1 style={{ fontSize: "var(--sp-text-2xl)", fontWeight: 700, color: tk.text, margin: "0 0 4px" }}>{tr.title}</h1>
                        <p style={{ fontSize: "var(--sp-text-sm)", color: tk.textSecondary, margin: 0 }}>
                            {doneCount}/{totalCount}
                        </p>
                    </div>
                </div>

                {/* Add form */}
                <form onSubmit={handleAdd} style={{ background: tk.card, border: `1px solid ${tk.cardBorder}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                    <input
                        type="text"
                        value={newTitle}
                        onChange={e => { setNewTitle(e.target.value); if (titleError) setTitleError(""); }}
                        placeholder={tr.placeholder}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${titleError ? tk.danger : tk.inputBorder}`, background: tk.inputBg, color: tk.text, fontSize: "var(--sp-text-sm)", boxSizing: "border-box" }}
                    />
                    {titleError && (
                        <p style={{ color: tk.danger, fontSize: 11, margin: "4px 0 6px", fontWeight: 600 }}>{titleError}</p>
                    )}
                    <textarea
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        placeholder={tr.descPlaceholder}
                        rows={2}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${tk.inputBorder}`, background: tk.inputBg, color: tk.text, fontSize: "var(--sp-text-xs)", boxSizing: "border-box", resize: "vertical", marginBottom: 10, fontFamily: "inherit" }}
                    />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {/* Star difficulty selector */}
                        <div style={{ display: "flex", gap: 2 }}>
                            {[1, 2, 3, 4, 5].map(d => (
                                <button key={d} type="button" onClick={() => setNewDifficulty(d)}
                                    title={tr[DIFF_LABELS_KEYS[d]]}
                                    style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        color: d <= newDifficulty ? tk.accent : tk.textMuted,
                                        padding: 2, display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                    <StarIcon filled={d <= newDifficulty} size={18} />
                                </button>
                            ))}
                        </div>
                        {/* Schedule toggle */}
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: tk.textSecondary, cursor: "pointer" }}>
                            <input type="checkbox" checked={newIsScheduled} onChange={e => setNewIsScheduled(e.target.checked)}
                                style={{ accentColor: tk.accent }} />
                            {tr.schedule}
                        </label>
                        <button type="submit" style={{ marginInlineStart: "auto", padding: "6px 14px", borderRadius: 8, background: tk.accent, color: tk.accentText, border: "none", fontWeight: 600, cursor: "pointer", fontSize: "var(--sp-text-sm)" }}>
                            {tr.add}
                        </button>
                    </div>
                    {/* Schedule fields */}
                    {newIsScheduled && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                            <select value={newDay} onChange={e => setNewDay(e.target.value)} style={selectStyle}>
                                {days.map((d, i) => <option key={i} value={dayValues[i]}>{d}</option>)}
                            </select>
                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                <select value={newHour} onChange={e => setNewHour(e.target.value)} style={selectStyle}>
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <span style={{ color: tk.textMuted, fontSize: 11 }}>:</span>
                                <select value={newMinute} onChange={e => setNewMinute(e.target.value)} style={selectStyle}>
                                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <select value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} style={selectStyle}>
                                {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m}>{m} min</option>)}
                            </select>
                        </div>
                    )}
                </form>

                {/* Filter tabs + difficulty filter */}
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setFilter(tab.key)}
                            style={{
                                padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: filter === tab.key ? 700 : 500,
                                cursor: "pointer", border: "none",
                                background: filter === tab.key ? tk.accent : tk.subtleBg,
                                color: filter === tab.key ? tk.accentText : tk.textSecondary,
                            }}>
                            {tab.label} {tab.count > 0 ? `(${tab.count})` : ""}
                        </button>
                    ))}
                    <div style={{ display: "flex", gap: 2, marginInlineStart: 6 }}>
                        {diffFilterOptions.map(opt => (
                            <button key={opt.value} type="button" onClick={() => setDiffFilter(opt.value)}
                                style={{
                                    padding: "3px 6px", borderRadius: 6, cursor: "pointer", border: "none",
                                    background: diffFilter === opt.value ? tk.accent : "transparent",
                                    color: diffFilter === opt.value ? tk.accentText : tk.textMuted,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                {opt.stars ? (
                                    <div style={{ display: "flex", gap: 1 }}>
                                        {Array.from({ length: opt.stars }, (_, i) => (
                                            <StarIcon key={i} filled size={10} />
                                        ))}
                                    </div>
                                ) : (
                                    <span style={{ fontSize: 11, fontWeight: 600 }}>{opt.labelKey ? tr[opt.labelKey] : ""}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task list */}
                {filtered.length === 0 && (
                    <p style={{ color: tk.textMuted, textAlign: "center", padding: "40px 0", fontSize: "var(--sp-text-sm)" }}>
                        {tr.no_tasks}
                    </p>
                )}

                {filtered.map(todo => (
                    <div key={todo.id}
                        style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                            borderRadius: 8, marginBottom: 6,
                            background: todo.completed ? tk.subtleBg : tk.card,
                            border: `1px solid ${tk.cardBorder}`,
                            opacity: todo.completed ? 0.65 : 1,
                        }}>
                        {/* Checkbox */}
                        <button onClick={() => handleToggle(todo.id)}
                            style={{
                                 width: 22, height: 22, minWidth: 28, minHeight: 28, borderRadius: 6, cursor: "pointer", flexShrink: 0,
                                border: todo.completed ? "none" : `2px solid ${diffColor(todo.priority)}`,
                                background: todo.completed ? tk.success : "transparent",
                                color: todo.completed ? tk.accentText : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                            }}
                            aria-label="Toggle">
                            {todo.completed ? "\u2713" : ""}
                        </button>
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                                fontSize: "var(--sp-text-sm)",
                                color: todo.completed ? tk.textMuted : tk.text,
                                textDecoration: todo.completed ? "line-through" : "none",
                                display: "block",
                            }}>
                                {todo.title}
                            </span>
                            {todo.description && (
                                <span style={{
                                    display: "block",
                                    fontSize: "var(--sp-text-xs)",
                                    color: tk.textMuted,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    marginTop: 2,
                                }}>
                                    {todo.description}
                                </span>
                            )}
                            <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                                {todo.is_scheduled && (
                                    <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, background: `${tk.accent}18`, color: tk.accent, fontWeight: 600 }}>
                                        {tr.daily_task} {todo.scheduled_time && `\u2022 ${todo.scheduled_time}`}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Difficulty stars */}
                        {!todo.completed && (
                            <div title={tr[DIFF_LABELS_KEYS[todo.priority || 3]]}
                                style={{
                                    display: "flex", gap: 1, flexShrink: 0,
                                    color: diffColor(todo.priority),
                                }}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <StarIcon key={i} filled={i < (todo.priority || 3)} size={10} />
                                ))}
                            </div>
                        )}
                        {/* Delete */}
                        <button onClick={() => handleDelete(todo.id)}
                            style={{ background: "none", border: "none", color: tk.danger, cursor: "pointer", flexShrink: 0, padding: "2px 4px", minWidth: 28, minHeight: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CloseIcon size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
