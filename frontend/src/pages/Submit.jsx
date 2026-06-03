import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Btn, Spinner } from "../components/UI";

const LANGS = ["Java", "Python"];

const SAMPLES = {
  Java: `import java.util.Scanner;

public class LoginChecker {
  public String password = "admin123";

  public boolean isAdmin(String role) {
    if (role == "admin") {
      System.out.println("Admin login");
      return true;
    }
    return false;
  }

  public void readUser() throws Exception {
    Scanner scanner = new Scanner(System.in);
    String name = scanner.nextLine();
    System.out.println(name);
  }
}`,
  Python: `import subprocess

def add_item(item, items=[]):
    items.append(item)
    return items

def run_command(command):
    try:
        subprocess.run(command, shell=True)
    except:
        print("failed")
`,
};

const STEPS = [
  "Reading code structure",
  "Calculating complexity",
  "Checking duplication",
  "Scanning maintainability risks",
  "Preparing review report",
];

export default function Submit() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("Java");
  const [code, setCode] = useState(SAMPLES.Java);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");

  const lineCount = code ? code.split(/\r?\n/).length : 0;

  const analyze = async () => {
    if (!code.trim()) return;
    setErr("");
    setLoading(true);
    setStep(0);

    const interval = setInterval(() => setStep((current) => (current + 1) % STEPS.length), 850);
    try {
      const { data } = await api.post("/analyze", { code, language: lang });
      clearInterval(interval);
      navigate(`/report/${data.id}`, { state: { report: data } });
    } catch (ex) {
      clearInterval(interval);
      setErr(ex.response?.data?.error || "Analysis failed. Make sure the backend server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-wide fade-in">
      <section className="review-hero">
        <div>
          <p className="eyebrow">Working demo</p>
          <h1>Review code instantly, without login friction.</h1>
          <p>
            Paste code, choose a language, and get scored feedback for complexity, readability,
            duplication, maintainability, and practical fixes.
          </p>
        </div>
        <div className="hero-stats">
          <div>
            <strong>{lineCount}</strong>
            <span>Lines</span>
          </div>
          <div>
            <strong>{code.length}</strong>
            <span>Chars</span>
          </div>
          <div>
            <strong>{lang}</strong>
            <span>Language</span>
          </div>
        </div>
      </section>

      <section className="editor-layout">
        <div className="editor-panel">
          <div className="toolbar">
            <select
              value={lang}
              onChange={(event) => {
                setLang(event.target.value);
                setCode(SAMPLES[event.target.value]);
              }}
              aria-label="Language"
            >
              {LANGS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <Btn variant="muted" onClick={() => setCode(SAMPLES[lang])}>Load sample</Btn>
            <Btn variant="muted" onClick={() => setCode("")}>Clear</Btn>
          </div>

          <textarea
            className="code-editor"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            placeholder="Paste your code here..."
          />

          {err && <div className="error-box">{err}</div>}

          <div className="action-row">
            <Btn onClick={analyze} disabled={loading || !code.trim()} style={{ minWidth: 170 }}>
              {loading ? <><Spinner size={16} /> Analyzing</> : "Analyze code"}
            </Btn>
            {loading && <span className="analysis-step">{STEPS[step]}</span>}
          </div>
        </div>

        <aside className="insight-panel">
          <h2>What the reviewer checks</h2>
          <div className="check-list">
            <div>
              <strong>Quality score</strong>
              <span>Weighted score across core code quality dimensions.</span>
            </div>
            <div>
              <strong>Issues</strong>
              <span>Security risks, complexity warnings, and readability notes.</span>
            </div>
            <div>
              <strong>Fix guidance</strong>
              <span>Actionable suggestions that explain what to change next.</span>
            </div>
            <div>
              <strong>History</strong>
              <span>Each review is saved for the dashboard and report view.</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
