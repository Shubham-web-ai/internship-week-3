import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "./api";

const statuses = ["pending", "in-progress", "completed"];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadTasks() {
    try {
      const { data } = await api.get("/tasks", {
        params: { search, ...(status ? { status } : {}) }
      });
      setTasks(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load tasks");
    }
  }

  useEffect(() => {
    loadTasks();
  }, [search, status]);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  async function createTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setBusy(true);
    setError("");

    try {
      let imageUrl = "";

      if (image) {
        const body = new FormData();
        body.append("image", image);
        const uploaded = await api.post("/upload", body);
        imageUrl = uploaded.data.imageUrl;
      }

      const { data } = await api.post("/tasks", { title, description });
      if (imageUrl) {
        const updated = await api.put(`/tasks/${data._id}`, { image: imageUrl });
        // The current backend only accepts title, description and status.
        // Image linking is handled below after adding image support to PUT.
        void updated;
      }

      setTitle("");
      setDescription("");
      setImage(null);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create task");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(task, nextStatus) {
    try {
      await api.put(`/tasks/${task._id}`, { status: nextStatus });
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update task");
    }
  }

  async function deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete task");
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Task Manager</h1>
          <p>Hello, {user?.name || "there"} 👋</p>
        </div>
        <button className="secondary" onClick={logout}>Log out</button>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h2>Create a task</h2>
        <form onSubmit={createTask} className="task-form">
          <label>Task title</label>
          <input required value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Finish my React project" />
          <label>Description</label>
          <textarea value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add some details..." />
          <label>Optional image (JPG, PNG, WEBP or GIF; max 5 MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={e => setImage(e.target.files?.[0] || null)} />
          {preview && <img className="preview" src={preview} alt="Selected preview" />}
          <button disabled={busy}>{busy ? "Saving..." : "Add task"}</button>
        </form>
      </section>

      <section className="panel">
        <h2>Your tasks ({tasks.length})</h2>
        <div className="filters">
          <input placeholder="Search task title..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="task-list">
          {tasks.map(task => (
            <article className="task-card" key={task._id}>
              <div className="task-heading">
                <h3>{task.title}</h3>
                <span className={`status ${task.status}`}>{task.status}</span>
              </div>
              {task.description && <p>{task.description}</p>}
              {task.image && (
                <img className="task-image"
                  src={`http://localhost:8000${task.image}`} alt={task.title} />
              )}
              <div className="task-actions">
                <select value={task.status}
                  onChange={e => updateStatus(task, e.target.value)}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="danger" onClick={() => deleteTask(task._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {tasks.length === 0 && <p className="muted">No tasks found. Create your first one.</p>}
        </div>
      </section>
    </main>
  );
}