
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import "./App.css";

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const initialForm = {
  Type: "M",
  "Air temperature [K]": 300.1,
  "Process temperature [K]": 310.0,
  "Rotational speed [rpm]": 1500,
  "Torque [Nm]": 40,
  "Tool wear [min]": 100,
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function predictFailure(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          "Air temperature [K]": Number(form["Air temperature [K]"]),
          "Process temperature [K]": Number(form["Process temperature [K]"]),
          "Rotational speed [rpm]": Number(form["Rotational speed [rpm]"]),
          "Torque [Nm]": Number(form["Torque [Nm]"]),
          "Tool wear [min]": Number(form["Tool wear [min]"]),
        }),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed (${response.status})`);
      }

      const data = await response.json();
      setResult(data);
      await loadHistory();
    } catch (err) {
      setError(
        "Cannot reach the API. Make sure your FastAPI backend is running and CORS is configured."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const response = await fetch(`${API}/history`);
      if (!response.ok) throw new Error("History request failed");
      setHistory(await response.json());
    } catch {
      setError(
        "Prediction may have succeeded, but history could not be loaded. Check your API connection."
      );
    }
  }

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  const failureCount = history.filter(
    (item) => item.machine_failure === 1
  ).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Activity size={24} /></div>
          <div>
            <h2>PredictIQ</h2>
            <span>Machine Intelligence</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <a className="nav-item active" href="#overview">
          <Gauge size={18} /> Overview
        </a>
        <a className="nav-item" href="#predict">
          <Activity size={18} /> New prediction
        </a>
        <a className="nav-item" href="#history">
          <Clock size={18} /> History
        </a>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div>
            <strong>Predictive engine</strong>
            <span>Random Forest · AI4I 2020</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div>
            <div className="eyebrow">INDUSTRIAL ANALYTICS / OVERVIEW</div>
            <h1>Predictive Maintenance</h1>
            <p>Monitor machine conditions and estimate failure risk.</p>
          </div>
          <button className="secondary-button" onClick={loadHistory}>
            <RefreshCw size={16} /> Refresh history
          </button>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-heading">
              <span>Total predictions</span>
              <div className="stat-icon blue"><Activity size={20} /></div>
            </div>
            <div className="stat-value">{history.length}</div>
            <span className="stat-note">Recorded predictions</span>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Failures detected</span>
              <div className="stat-icon red"><AlertTriangle size={20} /></div>
            </div>
            <div className="stat-value">{failureCount}</div>
            <span className="stat-note">Predicted failure cases</span>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Machine status</span>
              <div className="stat-icon green"><ShieldCheck size={20} /></div>
            </div>
            <div className="stat-value status-text">
              {result
                ? result.machine_failure === 1
                  ? "At risk"
                  : "Normal"
                : "Awaiting"}
            </div>
            <span className="stat-note">Latest prediction</span>
          </article>
        </section>

        <section className="workspace-grid">
          <article className="panel prediction-panel" id="predict">
            <div className="panel-heading">
              <div>
                <h2>Machine assessment</h2>
                <p>Enter current operating measurements.</p>
              </div>
              <Wrench size={22} className="heading-icon" />
            </div>

            <form onSubmit={predictFailure}>
              <label>
                Machine type
                <select name="Type" value={form.Type} onChange={updateField}>
                  <option value="L">L — Low</option>
                  <option value="M">M — Medium</option>
                  <option value="H">H — High</option>
                </select>
              </label>

              <div className="form-grid">
                <label>
                  Air temperature (K)
                  <input type="number" step="any" required
                    name="Air temperature [K]"
                    value={form["Air temperature [K]"]}
                    onChange={updateField} />
                </label>
                <label>
                  Process temperature (K)
                  <input type="number" step="any" required
                    name="Process temperature [K]"
                    value={form["Process temperature [K]"]}
                    onChange={updateField} />
                </label>
                <label>
                  Rotational speed (rpm)
                  <input type="number" step="any" required
                    name="Rotational speed [rpm]"
                    value={form["Rotational speed [rpm]"]}
                    onChange={updateField} />
                </label>
                <label>
                  Torque (Nm)
                  <input type="number" step="any" required
                    name="Torque [Nm]"
                    value={form["Torque [Nm]"]}
                    onChange={updateField} />
                </label>
                <label className="full-width">
                  Tool wear (minutes)
                  <input type="number" step="any" required
                    name="Tool wear [min]"
                    value={form["Tool wear [min]"]}
                    onChange={updateField} />
                </label>
              </div>

              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Analyzing machine..." : "Run failure prediction"}
              </button>
            </form>

            {error && <div className="error-message">{error}</div>}
          </article>

          <article className="panel result-panel">
            <div className="panel-heading">
              <div>
                <h2>Assessment result</h2>
                <p>Output from the trained ML model.</p>
              </div>
              <div className="result-symbol"><Gauge size={22} /></div>
            </div>

            {!result ? (
              <div className="empty-result">
                <div className="empty-icon"><Activity size={30} /></div>
                <h3>Ready for assessment</h3>
                <p>Submit machine measurements to see the model's prediction.</p>
              </div>
            ) : (
              <div className="result-content">
                <div className={`result-banner ${result.machine_failure ? "danger" : "safe"}`}>
                  {result.machine_failure
                    ? <AlertTriangle size={23} />
                    : <CheckCircle2 size={23} />}
                  <div>
                    <span>Predicted machine status</span>
                    <h3>{result.status}</h3>
                  </div>
                </div>

                <div className="probability-heading">
                  <span>Estimated failure probability</span>
                  <strong>{(result.failure_probability * 100).toFixed(1)}%</strong>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${result.machine_failure ? "danger-fill" : ""}`}
                    style={{
                      width: `${Math.min(100, Math.max(0, result.failure_probability * 100))}%`,
                    }}
                  />
                </div>
                <p className="result-footnote">
                  Prediction ID: {result.id}. This is a model estimate, not a guarantee of actual machine condition.
                </p>
              </div>
            )}
          </article>
        </section>

        <section className="panel history-panel" id="history">
          <div className="panel-heading">
            <div>
              <h2>Prediction history</h2>
              <p>Previously recorded assessments from your API.</p>
            </div>
            <button className="secondary-button" onClick={loadHistory}>
              <RefreshCw size={15} /> Load records
            </button>
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              No history loaded yet. Run a prediction or click “Load records”.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Prediction</th>
                    <th>Failure probability</th>
                    <th>Created at</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>{item.machine_type}</td>
                      <td>
                        <span className={`pill ${item.machine_failure ? "pill-danger" : "pill-safe"}`}>
                          {item.machine_failure ? "Failure risk" : "Normal"}
                        </span>
                      </td>
                      <td>{(item.failure_probability * 100).toFixed(1)}%</td>
                      <td>{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer>
          <span>PredictIQ · Predictive Maintenance System</span>
          <span>Random Forest · FastAPI · SQLite</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
