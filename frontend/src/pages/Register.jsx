import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Btn, Input, Spinner } from "../components/UI";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Developer" });
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/");
    } catch (ex) {
      setErr(ex.response?.data?.error || "Registration failed");
    }
    setLoading(false);
  };

  const inp = {
    background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)",
    borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: "100%",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 70% 80%, #00d4aa0d 0%, transparent 60%), var(--bg)",
    }}>
      <div className="fade-in" style={{
        width: 420, background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 20, padding: 40,
      }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)", marginBottom: 4 }}>&lt;CodeInsight/&gt;</div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>Create your account</div>
        </div>
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Name"     value={form.name}     onChange={set("name")}     placeholder="Your name"        required />
          <Input label="Email"    type="email" value={form.email}    onChange={set("email")}    placeholder="email@example.com" required />
          <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters"  required />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>Role</label>
            <select value={form.role} onChange={set("role")} style={{ ...inp }}>
              {["Developer", "Senior Dev", "CS Student", "Tech Lead", "Freelancer"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {err && <div style={{ color: "var(--danger)", fontSize: 12, background: "#f8514911", padding: "8px 12px", borderRadius: 6 }}>{err}</div>}
          <Btn type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: "center", padding: "11px" }} icon={loading ? null : "✨"}>
            {loading ? <Spinner size={16} /> : "Create Account"}
          </Btn>
        </form>
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
