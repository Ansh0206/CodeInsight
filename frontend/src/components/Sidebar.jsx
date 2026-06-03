import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Btn } from "./UI";

const NAV = [
  { path: "/", icon: "01", label: "Review" },
  { path: "/history", icon: "02", label: "History" },
  { path: "/dashboard", icon: "03", label: "Dashboard" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <aside style={{
      width: 238,
      background: "#fbfaf7",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      padding: "24px 14px",
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{ padding: "0 8px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 20, fontWeight: 850, color: "var(--text)", letterSpacing: -0.4 }}>
          CodeInsight
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5, lineHeight: 1.5 }}>
          Thoughtful code reviews for everyday work.
        </div>
      </div>

      <nav style={{ flex: 1, padding: "18px 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {NAV.map((n) => {
          const active = pathname === n.path;
          return (
            <Link key={n.path} to={n.path} style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 12px",
              borderRadius: 8,
              background: active ? "var(--accent-dim)" : "transparent",
              color: active ? "var(--accent-strong)" : "var(--muted)",
              fontSize: 14,
              fontWeight: active ? 750 : 650,
              border: active ? "1px solid #16796f24" : "1px solid transparent",
              transition: "all 0.2s",
            }}>
              <span style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: active ? "#16796f18" : "#ede8dd",
                color: active ? "var(--accent-strong)" : "var(--muted)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
              }}>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 8px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: "var(--accent-dim)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "var(--accent-strong)",
            fontWeight: 800,
          }}>{user?.name?.[0] || "U"}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{user?.role}</div>
          </div>
        </div>
        <Btn variant="ghost" onClick={logout} style={{ width: "100%", fontSize: 12 }} icon="<">
          Sign out
        </Btn>
      </div>
    </aside>
  );
}
