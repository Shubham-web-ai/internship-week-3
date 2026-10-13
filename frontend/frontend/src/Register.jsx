import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-card">
      <h1>Create account</h1>
      <p>Start organizing your work.</p>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input required value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />
        <label>Email</label>
        <input type="email" required value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} />
        <label>Password (minimum 8 characters)</label>
        <input type="password" required minLength={8} value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>{loading ? "Creating..." : "Register"}</button>
      </form>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </main>
  );
}