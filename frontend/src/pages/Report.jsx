import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Btn, Badge, ScoreRing, MetricCard, Spinner } from "../components/UI";

const SEV_COLOR = { critical: "var(--danger)", warning: "var(--warn)", info: "var(--blue)" };
const CAT_COLOR = {
  Performance: "var(--warn)",
  Readability: "var(--blue)",
  Security: "var(--danger)",
  Maintainability: "var(--accent)",
  "Best Practice": "var(--success)",
};

function metric(report, camel, snake) {
  return report[camel] ?? report[snake] ?? 0;
}

function gradeColor(grade) {
  return {
    "A+": "var(--success)",
    A: "var(--success)",
    "B+": "var(--accent)",
    B: "var(--accent)",
    "C+": "var(--warn)",
    C: "var(--warn)",
  }[grade] || "var(--danger)";
}

export default function Report() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(state?.report || null);
  const [loading, setLoading] = useState(!state?.report);

  useEffect(() => {
    if (!report && id) {
      api.get(`/submissions/${id}`)
        .then((response) => setReport(response.data))
        .catch(() => navigate("/history"))
        .finally(() => setLoading(false));
    }
  }, [id, navigate, report]);

  if (loading) {
    return (
      <div className="center-state">
        <Spinner size={40} />
      </div>
    );
  }

  if (!report) return null;

  const createdAt = report.created_at ? new Date(report.created_at).toLocaleString() : "Just now";
  const complexity = metric(report, "cyclomaticComplexity", "cyclomatic_complexity");

  return (
    <div className="page page-wide fade-in">
      <div className="report-header">
        <div>
          <div className="header-actions">
            <Btn variant="muted" onClick={() => navigate(-1)}>Back</Btn>
            <Badge label={report.language || "Code"} color="var(--blue)" />
            <Badge label={createdAt} color="var(--muted)" />
          </div>
          <h1>Code review report</h1>
          <p>{report.summary}</p>
        </div>
        <div className="grade-block" style={{ color: gradeColor(report.grade) }}>
          <strong>{report.grade}</strong>
          <span>Overall grade</span>
        </div>
      </div>

      <section className="score-panel">
        <ScoreRing score={metric(report, "overallScore", "overall_score")} label="Overall" size={96} />
        <ScoreRing score={metric(report, "complexityScore", "complexity_score")} label="Complexity" />
        <ScoreRing score={metric(report, "readabilityScore", "readability_score")} label="Readability" />
        <ScoreRing score={metric(report, "duplicationScore", "duplication_score")} label="Duplication" />
        <ScoreRing score={metric(report, "maintainabilityScore", "maintainability_score")} label="Maintainability" />
      </section>

      <section className="metric-grid">
        <MetricCard label="Lines of code" value={metric(report, "linesOfCode", "lines_of_code")} color="var(--blue)" />
        <MetricCard
          label="Cyclomatic complexity"
          value={complexity}
          color={complexity > 10 ? "var(--danger)" : "var(--success)"}
          sub={complexity > 10 ? "Refactor recommended" : "Comfortable range"}
        />
        <MetricCard label="Issues found" value={report.issues?.length || 0} color="var(--warn)" />
        <MetricCard label="Suggestions" value={report.suggestions?.length || 0} color="var(--accent)" />
      </section>

      <section className="two-column">
        <div className="panel">
          <h2>Issues detected</h2>
          {report.issues?.length ? report.issues.map((issue, index) => (
            <div className="issue-row" key={`${issue.message}-${index}`}>
              <Badge label={issue.severity} color={SEV_COLOR[issue.severity] || "var(--muted)"} />
              <div>
                <p>{issue.message}</p>
                {issue.line > 0 && <span>Line {issue.line}</span>}
              </div>
            </div>
          )) : <p className="success-note">No major issues detected.</p>}
        </div>

        <div className="panel">
          <h2>Strengths</h2>
          {(report.strengths || []).map((item, index) => (
            <div className="strength-row" key={`${item}-${index}`}>{item}</div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Actionable suggestions</h2>
        <div className="suggestion-grid">
          {(report.suggestions || []).map((suggestion, index) => (
            <div className="suggestion-card" key={`${suggestion.title}-${index}`}>
              <Badge label={suggestion.category} color={CAT_COLOR[suggestion.category] || "var(--accent)"} />
              <h3>{suggestion.title}</h3>
              <p>{suggestion.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
