import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Btn, Input, Spinner } from "../components/UI";

export default function Login() {
  const { login }      = useAuth();
  const navigate       = useNavigate();
  const [email, setEmail]   = useState("dev@codeinsight.io");
  const [pass, setPass]     = useState("demo1234");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await login(email, pass);
      navigate("/");
    } catch (ex) {
      setErr(ex.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 30% 20%, #00d4aa11 0%, transparent 60%), var(--bg)",
    }}>
      <div className="fade-in" style={{
        width: 420, background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 20, padding: 40, boxShadow: "0 0 60px #00d4aa11",
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", letterSpacing: -1, marginBottom: 4 }}>
            &lt;CodeInsight/&gt;
          </div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>AI-powered code review platform</div>
        </div>

        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
          <Input label="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
          {err && (
            <div style={{ color: "var(--danger)", fontSize: 12, background: "#f8514911", padding: "8px 12px", borderRadius: 6 }}>
              {err}
            </div>
          )}
          <Btn type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: "center", padding: "11px" }} icon={loading ? null : "🔐"}>
            {loading ? <Spinner size={16} /> : "Sign In"}
          </Btn>
        </form>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "var(--accent)" }}>Create one</Link>
        </div>

        <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--surface)", borderRadius: 8, fontSize: 12, color: "var(--muted)" }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Demo accounts</div>
          <div>dev@codeinsight.io / demo1234</div>
          <div>student@uni.edu / learn123</div>
        </div>
      </div>
    </div>
  );
}
