import { useEffect } from "react";

export function Modal({ title, onClose, children, wide }) {
    useEffect(() => {
        const k = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", k);
        return () => window.removeEventListener("keydown", k);
    }, [onClose]);
    return (
        <div className="o-scrim" onMouseDown={onClose}>
            <div className={`o-modal ${wide ? "is-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
                <div className="o-mh"><h2>{title}</h2><button className="o-x" onClick={onClose} aria-label="Close">×</button></div>
                {children}
            </div>
        </div>
    );
}
export const Field = ({ label, children }) => <label className="o-field"><span>{label}</span>{children}</label>;
export const Stat = ({ label, value, sub }) => <div className="o-card"><span className="o-num">{value}</span><span className="o-lbl">{label}</span>{sub && <small className="o-lbl">{sub}</small>}</div>;
export const Empty = ({ text }) => <p className="o-empty">{text}</p>;
export const Tag = ({ tone = "", children }) => <span className={`o-tag ${tone}`}>{children}</span>;
