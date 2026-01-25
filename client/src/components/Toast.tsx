import { useEffect, useState } from "react";
import "../styles/Toast.css";

type ToastProps = {
    message: string;
    type: "success" | "info" | "warning" | "error";
    duration?: number;
    onClose?: () => void;
};

export default function Toast({
    message,
    type,
    duration = 4000,
    onClose,
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-content">
                {type === "success" && <span className="toast-icon">✓</span>}
                {type === "error" && <span className="toast-icon">✕</span>}
                {type === "info" && <span className="toast-icon">ℹ</span>}
                {type === "warning" && <span className="toast-icon">⚠</span>}
                <span className="toast-message">{message}</span>
            </div>
            <div className={`toast-progress toast-progress-${type}`}></div>
        </div>
    );
}
