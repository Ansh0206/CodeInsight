import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { ScoreRing, MetricCard, Spinner } from "../components/UI";

export default function Dashboard() {
  const { user }             = useAuth();
  const navigate             = useNavigate();
  const [subs, setSubs]      = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/submissions").then(r => setSubs(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><Spinner size={36} /></div>
  );

  if (!subs.length) return (
    <div className="fade-in" style={{ padding: 32 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Performance Dashboard</h1>
      <div style={{ textAlign: "center", padding: 80, color: "var(--muted)" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div>Submit at least one review to see your dashboard.</div>
      </div>
    </div>
  );

  const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const scores  = subs.map(s => s.overall_score).reverse();
  const avgScore = avg(scores);
  const best     = Math.max(...scores);
  const latest   = subs[0];
  const trend    = scores.length >= 2 ? scores[scores.length-1] - scores[scores.length-2] : 0;
  const last7    = [...subs].reverse().slice(-7);

  const langMap = subs.reduce((acc, s) => { acc[s.language] = (acc[s.language] || 0) + 1; return acc; }, {});

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 960 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Performance Dashboard</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Welcome back, {user?.name}. Here's your code quality overview.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <MetricCard icon="📊" label="Total Reviews"  value={subs.length}  color="var(--blue)" />
        <MetricCard icon="🎯" label="Average Score"  value={avgScore}     color="var(--accent)" sub={`${trend >= 0 ? "▲" : "▼"} ${Math.abs(trend)} from previous`} />
        <MetricCard icon="🏆" label="Best Score"     value={best}         color="var(--success)" />
        <MetricCard icon="📅" label="Latest Grade"   value={latest.grade} color="var(--warn)" sub={new Date(latest.created_at).toLocaleDateString()} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Bar chart */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>📈 Score Trend (last {last7.length})</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
            {last7.map((s, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>{s.overall_score}</div>
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0", minHeight: 4,
                  height: `${s.overall_score}%`,
                  background: "linear-gradient(180deg, var(--accent), #00d4aa44)",
                  transition: "height 0.8s ease",
                  cursor: "pointer",
                }} onClick={() => navigate(`/report/${s.id}`)} />
                <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
                  {new Date(s.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language breakdown */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🗂️ By Language</h3>
          {Object.entries(langMap).map(([lang, cnt]) => (
            <div key={lang} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span>{lang}</span><span style={{ color: "var(--muted)" }}>{cnt}</span>
              </div>
              <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${(cnt / subs.length) * 100}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dimension averages */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>🔬 Average Dimension Scores (all time)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Complexity",      key: "complexity_score"     },
            { label: "Readability",     key: "readability_score"    },
            { label: "Duplication",     key: "duplication_score"    },
            { label: "Maintainability", key: "maintainability_score"},
          ].map(d => (
            <div key={d.key} style={{ textAlign: "center" }}>
              <ScoreRing score={avg(subs.map(s => s[d.key] || 0))} label={d.label} size={80} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
