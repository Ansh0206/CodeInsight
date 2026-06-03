import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Btn, Badge, Spinner } from "../components/UI";

const GRADE_COLOR = { "A+": "var(--success)", A: "var(--success)", "B+": "var(--accent)", B: "var(--accent)", "C+": "var(--warn)", C: "var(--warn)", D: "var(--danger)", F: "var(--danger)" };

export default function History() {
  const navigate = useNavigate();
  const [subs, setSubs]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/submissions")
      .then(r => setSubs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const clear = async () => {
    if (!confirm("Delete all submissions?")) return;
    await api.delete("/submissions");
    setSubs([]);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <Spinner size={36} />
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Submission History</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{subs.length} submission{subs.length !== 1 ? "s" : ""}</p>
        </div>
        {subs.length > 0 && <Btn variant="danger" onClick={clear} icon="🗑️" style={{ fontSize: 12 }}>Clear All</Btn>}
      </div>

      {!subs.length ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div>No submissions yet. Submit some code to get started!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {subs.map((r) => (
            <div key={r.id}
              onClick={() => navigate(`/report/${r.id}`)}
              style={{
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                cursor: "pointer", transition: "border-color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#00d4aa66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ fontSize: 30, fontWeight: 800, color: GRADE_COLOR[r.grade] || "var(--muted)", fontFamily: "var(--font-mono)", minWidth: 50, textAlign: "center" }}>
                {r.grade}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <Badge label={r.language} color="var(--blue)" />
                  <Badge label={`Score: ${r.overall_score}`} color="var(--accent)" />
                  <Badge label={`${r.issues?.length || 0} issues`} color="var(--warn)" />
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {new Date(r.created_at).toLocaleString()} · {r.lines_of_code} lines
                </div>
                {r.summary && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, maxWidth: 500 }}>{r.summary.slice(0, 100)}…</div>}
              </div>
              <div style={{ fontSize: 18, color: "var(--muted)" }}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
