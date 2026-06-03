export function Spinner({ size = 20 }) {
  return (
    <div className="spin" style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: "2px solid var(--border)",
      borderTopColor: "var(--accent)",
      display: "inline-block",
    }} />
  );
}

export function Btn({ children, onClick, variant = "primary", disabled, style: s, icon, type = "button" }) {
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "#fff",
      fontWeight: 700,
      boxShadow: "0 10px 24px rgba(22, 121, 111, 0.18)",
    },
    ghost: {
      background: "var(--accent-dim)",
      color: "var(--accent-strong)",
      border: "1px solid #16796f2e",
      fontWeight: 700,
    },
    danger: {
      background: "#b4231810",
      color: "var(--danger)",
      border: "1px solid #b4231828",
      fontWeight: 700,
    },
    muted: {
      background: "#f6f4ef",
      color: "var(--muted)",
      border: "1px solid var(--border)",
      fontWeight: 700,
    },
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "10px 18px",
      borderRadius: 7,
      fontSize: 13,
      transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
      opacity: disabled ? 0.55 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      ...variants[variant],
      ...s,
    }}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}

export function Badge({ label, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 9px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      background: color + "14",
      color,
      border: `1px solid ${color}26`,
      letterSpacing: 0,
    }}>{label}</span>
  );
}

export function Card({ children, style: s }) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: 24,
      boxShadow: "var(--shadow)",
      ...s,
    }}>{children}</div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {label && <label style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{label}</label>}
      <input {...props} style={{
        background: "#fbfaf7",
        border: "1px solid var(--border)",
        color: "var(--text)",
        borderRadius: 7,
        padding: "11px 13px",
        fontSize: 14,
        outline: "none",
        width: "100%",
        transition: "border-color 0.2s, box-shadow 0.2s",
        ...props.style,
      }}
        onFocus={e => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.boxShadow = "0 0 0 4px #16796f14";
        }}
        onBlur={e => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export function ScoreRing({ score, size = 80, label }) {
  const safeScore = Number(score || 0);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(safeScore, 0), 100) / 100;
  const color = safeScore >= 75 ? "var(--success)" : safeScore >= 50 ? "var(--warn)" : "var(--danger)";
  const colorHex = safeScore >= 75 ? "#207344" : safeScore >= 50 ? "#a16207" : "#b42318";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ebe6dc" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={colorHex}
          fontSize={size * 0.22}
          fontWeight="800"
          fontFamily="var(--font-mono)"
          style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
        >
          {safeScore}
        </text>
      </svg>
      {label && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>{label}</span>}
    </div>
  );
}

export function MetricCard({ icon, label, value, color, sub }) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 7,
      boxShadow: "var(--shadow)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 12, fontWeight: 700 }}>
        {icon && <span style={{ color: color || "var(--accent)" }}>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || "var(--text)", fontFamily: "var(--font-mono)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}
