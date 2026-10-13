import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import "./index.css";

function Home() {
  return (
    <main className="hero">
      <nav><Link className="brand" to="/">TaskFlow</Link><div><Link to="/login">Login</Link><Link className="nav-button" to="/register">Get started</Link></div></nav>
      <section className="hero-content">
        <p className="eyebrow">LESS CHAOS. MORE PROGRESS.</p>
        <h1>Your work,<br />beautifully organized.</h1>
        <p>Plan your day, track your tasks, and celebrate every small win.</p>
        <Link className="primary-link" to="/register">Start managing tasks →</Link>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}