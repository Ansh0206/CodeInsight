import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Btn, Spinner } from "../components/UI";

const LANGS = ["JavaScript", "Python", "TypeScript", "Java", "C++", "Go", "Rust", "PHP", "C#", "Ruby", "Swift", "Kotlin"];

const DEMO_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = [];
for (var i = 0; i < 10; i++) {
  result.push(fibonacci(i));
}
console.log(result);`;

const STEPS = [
  "Tokenizing code structure...",
  "Running complexity analysis...",
  "Evaluating readability patterns...",
  "Scanning for duplications...",
  "Generating quality score...",
  "Compiling actionable suggestions...",
];

export default function Submit() {
  const navigate            = useNavigate();
  const [code, setCode]     = useState(DEMO_CODE);
  const [lang, setLang]     = useState("JavaScript");
  const [loading, setLoading] = useState(false);
  const [step, setStep]     = useState(0);
  const [err, setErr]       = useState("");

  const analyze = async () => {
    if (!code.trim()) return;
    setErr(""); setLoading(true); setStep(0);
    const iv = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 900);
    try {
      const { data } = await api.post("/analyze", { code, language: lang });
      clearInterval(iv);
      navigate(`/report/${data.id}`, { state: { report: data } });
    } catch (ex) {
      clearInterval(iv);
      setErr(ex.response?.data?.error || "Analysis failed. Check your API key in backend/.env");
    }
    setLoading(false);
  };

  const selStyle = {
    background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)",
    borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none",
  };

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Submit Code for Review</h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Paste your code and receive a structured AI quality report in seconds.</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ ...selStyle }}>
          {LANGS.map(l => <option key={l}>{l}</option>)}
        </select>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          {code.split("\n").length} lines · {code.length} chars
        </span>
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <textarea
          value={code} onChange={e => setCode(e.target.value)} spellCheck={false}
          style={{
            width: "100%", height: 340, resize: "vertical", outline: "none",
            background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)",
            borderRadius: 12, padding: 20, fontFamily: "var(--font-mono)", fontSize: 13,
            lineHeight: 1.7, transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e  => e.target.style.borderColor = "var(--border)"}
          placeholder="Paste your code here..."
        />
        <div style={{
          position: "absolute", top: 12, right: 16,
          fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)",
          background: "var(--card)", padding: "2px 8px", borderRadius: 4,
        }}>{lang}</div>
      </div>

      {err && (
        <div style={{ color: "var(--danger)", fontSize: 13, background: "#f8514911", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>
          ⚠️ {err}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Btn onClick={analyze} disabled={loading || !code.trim()} icon={loading ? null : "🔍"} style={{ padding: "11px 28px", fontSize: 14 }}>
          {loading ? <><Spinner size={16} /><span style={{ marginLeft: 8 }}>Analyzing...</span></> : "Analyze Code"}
        </Btn>
        {loading && (
          <span className="pulse" style={{ fontSize: 13, color: "var(--accent)" }}>{STEPS[step]}</span>
        )}
      </div>

      {/* Feature hints */}
      <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { icon: "🎯", t: "Complexity",    d: "Cyclomatic & cognitive complexity analysis" },
          { icon: "📖", t: "Readability",   d: "Naming, structure, and comment clarity"     },
          { icon: "🔒", t: "Security",      d: "Common vulnerability and risk detection"     },
        ].map(c => (
          <div key={c.t} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c.t}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
