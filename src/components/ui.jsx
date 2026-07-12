import React from "react";
import { X, AlertTriangle } from "lucide-react";
import { COLORS, STATUS_STYLES } from "../theme";

/* ------------------------------------------------------------------ */
/* Small UI primitives                                                */
/* ------------------------------------------------------------------ */
export function Badge({ status }) {
  const s = STATUS_STYLES[status] || { c: COLORS.slate, label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", textTransform: "uppercase",
      padding: "3px 9px 3px 7px", borderRadius: 999,
      border: `1px solid ${s.c}55`, background: `${s.c}17`, color: s.c,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.c, boxShadow: `0 0 6px ${s.c}` }} />
      {s.label}
    </span>
  );
}

export function Plate({ children }) {
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
      padding: "3px 8px", borderRadius: 4, border: `1.5px solid ${COLORS.ink}`,
      background: "#fff", color: COLORS.ink, letterSpacing: "0.03em",
    }}>{children}</span>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 10,
      padding: 18, ...style,
    }}>{children}</div>
  );
}

export function Btn({ children, onClick, variant = "default", disabled, icon: Icon, style, type = "button" }) {
  const variants = {
    default: { bg: COLORS.ink, fg: "#fff", border: COLORS.ink },
    amber: { bg: COLORS.amber, fg: COLORS.ink, border: COLORS.amberDeep },
    ghost: { bg: "transparent", fg: COLORS.ink, border: COLORS.line },
    danger: { bg: "#fff", fg: COLORS.red, border: COLORS.red },
    teal: { bg: COLORS.teal, fg: "#fff", border: COLORS.teal },
  };
  const v = variants[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600,
        padding: "8px 13px", borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer",
        background: v.bg, color: v.fg, border: `1.5px solid ${v.border}`,
        opacity: disabled ? 0.4 : 1, transition: "transform .1s", ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {Icon && <Icon size={14} />}{children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5, fontWeight: 600, color: COLORS.ink70, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {label}
      {children}
    </label>
  );
}

export const inputStyle = {
  border: `1.5px solid ${COLORS.line}`, borderRadius: 6, padding: "8px 10px",
  fontSize: 13.5, fontFamily: "'IBM Plex Sans', sans-serif", background: "#fff", color: COLORS.ink,
  outline: "none",
};

export function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(18,22,31,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.paper, borderRadius: 12, border: `1px solid ${COLORS.line}`,
        width: "100%", maxWidth: wide ? 620 : 440, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${COLORS.line}` }}>
          <h3 style={{ margin: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 700, letterSpacing: "0.02em" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.slate }}><X size={18} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export function Banner({ text, kind = "error" }) {
  if (!text) return null;
  const c = kind === "error" ? COLORS.red : COLORS.teal;
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "flex-start", background: `${c}12`, border: `1px solid ${c}55`,
      color: c, borderRadius: 7, padding: "9px 11px", fontSize: 12.5, marginBottom: 12, fontWeight: 500,
    }}>
      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{text}
    </div>
  );
}

export function SectionHead({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700, color: COLORS.ink }}>{title}</h2>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: COLORS.slate }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Th({ children }) {
  return <th style={{ textAlign: "left", padding: "9px 12px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.slate, borderBottom: `1.5px solid ${COLORS.ink}` }}>{children}</th>;
}
export function Td({ children, style }) {
  return <td style={{ padding: "10px 12px", fontSize: 13, color: COLORS.ink, borderBottom: `1px solid ${COLORS.line}`, ...style }}>{children}</td>;
}
export function Table({ children }) {
  return <div style={{ overflowX: "auto", border: `1px solid ${COLORS.line}`, borderRadius: 10, background: "#fff" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'IBM Plex Sans', sans-serif" }}>{children}</table>
  </div>;
}

export function KPI({ label, value, icon: Icon, accent }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.slate }}>{label}</span>
        <Icon size={15} color={accent || COLORS.amberDeep} />
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 700, color: COLORS.ink }}>{value}</span>
    </Card>
  );
}
