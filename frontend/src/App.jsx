import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar  from "./components/Sidebar";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Submit   from "./pages/Submit";
import Report   from "./pages/Report";
import History  from "./pages/History";
import Dashboard from "./pages/Dashboard";
import { Spinner } from "./components/UI";

// Protected layout — renders sidebar + main content
function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Spinner size={40} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{
        flex: 1, minHeight: "100vh", overflowY: "auto",
        background: "radial-gradient(ellipse at 70% 0%, #00d4aa06 0%, transparent 50%), var(--bg)",
      }}>
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route element={<AppLayout />}>
        <Route path="/"             element={<Submit />} />
        <Route path="/report/:id"   element={<Report />} />
        <Route path="/history"      element={<History />} />
        <Route path="/dashboard"    element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
