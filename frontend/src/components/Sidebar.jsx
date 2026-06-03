import { Link, useLocation } from "react-router-dom";

const NAV = [
  { path: "/", index: "01", label: "Review" },
  { path: "/history", index: "02", label: "History" },
  { path: "/dashboard", index: "03", label: "Dashboard" },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">CI</div>
        <div>
          <div className="brand-title">CodeInsight</div>
          <div className="brand-subtitle">AI-assisted code quality review</div>
        </div>
      </div>

      <nav className="nav-list">
        {NAV.map((item) => {
          const active = pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`nav-item ${active ? "active" : ""}`}>
              <span className="nav-index">{item.index}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-pill">Demo ready</div>
        <p>
          Authentication removed for submission. Reviews are saved locally and can run with or without an AI API key.
        </p>
      </div>
    </aside>
  );
}
