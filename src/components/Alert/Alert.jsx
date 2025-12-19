import { useEffect } from "react";
import "./Alert.css";

export default function Alert({
  type = "info",
  message,
  onClose,
  duration // ⬅ optional (seconds)
}) {
  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-message">{message}</span>

      <button
        className="alert-close"
        onClick={onClose}
        aria-label="Close alert"
      >
        ×
      </button>
    </div>
  );
}
