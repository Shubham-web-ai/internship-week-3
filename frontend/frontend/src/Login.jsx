import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-card">
      <h1>Welcome back</h1>
      <p>Log in to manage your tasks.</p>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" required value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <label>Password</label>
        <input type="password" required minLength={8} value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
      <p>New here? <Link to="/register">Create account</Link></p>
    </main>
  );
}