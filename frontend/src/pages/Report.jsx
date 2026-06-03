import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Btn, Badge, ScoreRing, MetricCard, Spinner } from "../components/UI";

const SEV_COLOR = { critical: "var(--danger)", warning: "var(--warn)", info: "var(--blue)" };
const CAT_COLOR = {
  Performance: "var(--warn)", Readability: "var(--blue)", Security: "var(--danger)",
  Maintainability: "var(--accent)", "Best Practice": "var(--success)",
};

export default function Report() {
  const { id }         = useParams();
  const { state }      = useLocation();
  const navigate       = useNavigate();
  const [report, setReport] = useState(state?.report || null);
  const [loading, setLoading] = useState(!state?.report);

  useEffect(() => {
    if (!report && id) {
      api.get(`/submissions/${id}`)
        .then(r => setReport({ ...r.data, language: r.data.language }))
        .catch(() => navigate("/history"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <Spinner size={40} />
    </div>
  );
  if (!report) return null;

  const gradeColor = g => ({ "A+": "var(--success)", A: "var(--success)", "B+": "var(--accent)", B: "var(--accent)", "C+": "var(--warn)", C: "var(--warn)" }[g] || "var(--danger)");

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Btn variant="muted" onClick={() => navigate(-1)} icon="←" style={{ padding: "6px 14px", fontSize: 12 }}>Back</Btn>
            <Badge label={report.language || report.lang} color="var(--blue)" />
            <Badge label={new Date(report.created_at || report.timestamp).toLocaleString()} color="var(--muted)" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Code Review Report</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, maxWidth: 600, lineHeight: 1.6 }}>{report.summary}</p>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: gradeColor(report.grade), fontFamily: "var(--font-mono)", lineHeight: 1 }}>
            {report.grade}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Overall Grade</div>
        </div>
      </div>

      {/* Score rings */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
        padding: "24px 32px", marginBottom: 24,
        display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 20,
      }}>
        <ScoreRing score={report.overallScore          || report.overall_score}          label="Overall"         size={90} />
        <ScoreRing score={report.complexityScore       || report.complexity_score}       label="Complexity"      size={80} />
        <ScoreRing score={report.readabilityScore      || report.readability_score}      label="Readability"     size={80} />
        <ScoreRing score={report.duplicationScore      || report.duplication_score}      label="Duplication"     size={80} />
        <ScoreRing score={report.maintainabilityScore  || report.maintainability_score}  label="Maintainability" size={80} />
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <MetricCard icon="📏" label="Lines of Code"        value={report.linesOfCode         || report.lines_of_code}        color="var(--blue)" />
        <MetricCard icon="🔄" label="Cyclomatic Complexity" value={report.cyclomaticComplexity || report.cyclomatic_complexity}
          color={(report.cyclomaticComplexity || report.cyclomatic_complexity) > 10 ? "var(--danger)" : "var(--success)"}
          sub={(report.cyclomaticComplexity || report.cyclomatic_complexity) > 10 ? "High — refactor" : "Good structure"} />
        <MetricCard icon="🐛" label="Issues Found"         value={report.issues?.length || 0}      color="var(--warn)" />
        <MetricCard icon="💡" label="Suggestions"          value={report.suggestions?.length || 0} color="var(--accent)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Issues */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>⚠️ Issues Detected</h3>
          {report.issues?.length ? report.issues.map((iss, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #21262d44", alignItems: "flex-start" }}>
              <Badge label={iss.severity} color={SEV_COLOR[iss.severity] || "var(--muted)"} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{iss.message}</div>
                {iss.line > 0 && <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>line {iss.line}</div>}
              </div>
            </div>
          )) : <div style={{ color: "var(--success)", fontSize: 13 }}>✅ No issues detected!</div>}
        </div>

        {/* Strengths */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>✅ Strengths</h3>
          {report.strengths?.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #21262d44", fontSize: 13, alignItems: "flex-start" }}>
              <span style={{ color: "var(--success)", marginTop: 1 }}>▸</span><span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: 15 }}>💡 Actionable Suggestions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {report.suggestions?.map((sug, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Badge label={sug.category} color={CAT_COLOR[sug.category] || "var(--accent)"} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{sug.title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{sug.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
