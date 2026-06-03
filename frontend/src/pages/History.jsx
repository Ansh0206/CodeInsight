import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Btn, Badge, Spinner } from "../components/UI";

const GRADE_COLOR = {
  "A+": "var(--success)",
  A: "var(--success)",
  "B+": "var(--accent)",
  B: "var(--accent)",
  "C+": "var(--warn)",
  C: "var(--warn)",
  D: "var(--danger)",
  F: "var(--danger)",
};

export default function History() {
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/submissions")
      .then((response) => setSubs(response.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const clear = async () => {
    if (!confirm("Delete all saved reviews?")) return;
    await api.delete("/submissions");
    setSubs([]);
  };

  if (loading) {
    return (
      <div className="center-state">
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Saved reviews</p>
          <h1>History</h1>
          <p>{subs.length} saved review{subs.length !== 1 ? "s" : ""}</p>
        </div>
        {subs.length > 0 && <Btn variant="danger" onClick={clear}>Clear all</Btn>}
      </div>

      {!subs.length ? (
        <div className="empty-state">
          <strong>No reviews yet</strong>
          <span>Submit code from the Review page and the report will appear here.</span>
        </div>
      ) : (
        <div className="history-list">
          {subs.map((report) => (
            <button key={report.id} className="history-row" onClick={() => navigate(`/report/${report.id}`)}>
              <span className="history-grade" style={{ color: GRADE_COLOR[report.grade] || "var(--muted)" }}>
                {report.grade}
              </span>
              <span className="history-body">
                <span className="history-badges">
                  <Badge label={report.language} color="var(--blue)" />
                  <Badge label={`Score ${report.overall_score}`} color="var(--accent)" />
                  <Badge label={`${report.issues?.length || 0} issues`} color="var(--warn)" />
                </span>
                <span className="history-meta">
                  {new Date(report.created_at).toLocaleString()} - {report.lines_of_code} lines
                </span>
                {report.summary && <span className="history-summary">{report.summary.slice(0, 130)}...</span>}
              </span>
              <span className="history-arrow">View</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
