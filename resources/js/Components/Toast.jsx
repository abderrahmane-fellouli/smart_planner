import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ─── Context ───────────────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

// ─── Provider — wrap your whole app with this ──────────────
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const add = useCallback((message, type = "success") => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => add(msg, "success"),
        error:   (msg) => add(msg, "error"),
        info:    (msg) => add(msg, "info"),
        warning: (msg) => add(msg, "warning"),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={remove} />
        </ToastContext.Provider>
    );
}

// ─── Container ─────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null;
    // RTL languages should show toasts on the left side instead of right.
    const isRTL = document.documentElement.dir === 'rtl';
    return (
        <div style={{ ...s.container, [isRTL ? 'left' : 'right']: '24px', [isRTL ? 'right' : 'left']: 'auto' }}>
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onRemove={onRemove} />
            ))}
        </div>
    );
}

// ─── Single Toast ──────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setVisible(true), 10);
        // Animate out before removal
        const timer = setTimeout(() => setVisible(false), 3600);
        return () => clearTimeout(timer);
    }, []);

    const config = {
        success: { bg: "#ECFDF5", border: "#6EE7B7", color: "#065F46", icon: "✅" },
        error:   { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B", icon: "❌" },
        info:    { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E40AF", icon: "ℹ️" },
        warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E", icon: "⚠️" },
    }[toast.type] ?? { bg: "#F9FAFB", border: "#E5E7EB", color: "#374151", icon: "💬" };

    const isRTL = document.documentElement.dir === 'rtl';
    return (
        <div
            style={{
                ...s.toast,
                background: config.bg,
                border: `1px solid ${config.border}`,
                color: config.color,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : `translateX(${isRTL ? '-' : ''}120%)`,
            }}
        >
            <span style={s.icon}>{config.icon}</span>
            <span style={s.msg}>{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} style={s.close}>✕</button>
        </div>
    );
}

// ─── Styles ────────────────────────────────────────────────
const s = {
    container: {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
    },
    toast: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        fontSize: "13px",
        fontWeight: 500,
        minWidth: "280px",
        maxWidth: "380px",
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        pointerEvents: "all",
        fontFamily: "'DM Sans', sans-serif",
    },
    icon: { fontSize: "16px", flexShrink: 0 },
    msg:  { flex: 1, lineHeight: 1.4 },
    close: {
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "12px",
        opacity: 0.5,
        padding: "0 2px",
        flexShrink: 0,
        color: "inherit",
    },
};
