import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ScoreRing, MetricCard, Spinner } from "../components/UI";

function average(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((total, value) => total + Number(value || 0), 0) / values.length);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/submissions")
      .then((response) => setSubs(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="center-state">
        <Spinner size={36} />
      </div>
    );
  }

  if (!subs.length) {
    return (
      <div className="page fade-in">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Analytics</p>
            <h1>Dashboard</h1>
            <p>Submit at least one review to see code quality trends.</p>
          </div>
        </div>
        <div className="empty-state">
          <strong>No dashboard data yet</strong>
          <span>Analyze code first, then return here for trends and averages.</span>
        </div>
      </div>
    );
  }

  const scores = subs.map((item) => item.overall_score).reverse();
  const avgScore = average(scores);
  const best = Math.max(...scores);
  const latest = subs[0];
  const trend = scores.length >= 2 ? scores[scores.length - 1] - scores[scores.length - 2] : 0;
  const lastSeven = [...subs].reverse().slice(-7);
  const languageMap = subs.reduce((acc, item) => {
    acc[item.language] = (acc[item.language] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page page-wide fade-in">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Dashboard</h1>
          <p>Quality overview across saved code reviews.</p>
        </div>
      </div>

      <section className="metric-grid">
        <MetricCard label="Total reviews" value={subs.length} color="var(--blue)" />
        <MetricCard
          label="Average score"
          value={avgScore}
          color="var(--accent)"
          sub={`${trend >= 0 ? "+" : "-"}${Math.abs(trend)} from previous review`}
        />
        <MetricCard label="Best score" value={best} color="var(--success)" />
        <MetricCard label="Latest grade" value={latest.grade} color="var(--warn)" sub={new Date(latest.created_at).toLocaleDateString()} />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>Score trend</h2>
          <div className="bar-chart">
            {lastSeven.map((item) => (
              <button key={item.id} className="bar-item" onClick={() => navigate(`/report/${item.id}`)}>
                <span>{item.overall_score}</span>
                <i style={{ height: `${Math.max(item.overall_score, 5)}%` }} />
                <small>{new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>By language</h2>
          <div className="language-list">
            {Object.entries(languageMap).map(([language, count]) => (
              <div key={language}>
                <span>
                  <strong>{language}</strong>
                  <em>{count}</em>
                </span>
                <div>
                  <i style={{ width: `${(count / subs.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Average dimension scores</h2>
        <div className="score-grid">
          <ScoreRing score={average(subs.map((item) => item.complexity_score))} label="Complexity" />
          <ScoreRing score={average(subs.map((item) => item.readability_score))} label="Readability" />
          <ScoreRing score={average(subs.map((item) => item.duplication_score))} label="Duplication" />
          <ScoreRing score={average(subs.map((item) => item.maintainability_score))} label="Maintainability" />
        </div>
      </section>
    </div>
  );
}
