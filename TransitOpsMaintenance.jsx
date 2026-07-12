import { useState } from "react";
import { Plus, X, Wrench, CheckCircle2, AlertCircle } from "lucide-react";

// --- Mock data (replace with real API calls once the backend exists) ---
const INITIAL_VEHICLES = [
  { id: "V-001", reg: "DL-01-AB-1234", name: "Tata Ace", status: "Available" },
  { id: "V-002", reg: "DL-02-CD-5678", name: "Ashok Leyland Dost", status: "Available" },
  { id: "V-003", reg: "DL-03-EF-9012", name: "Mahindra Bolero", status: "In Shop" },
  { id: "V-005", reg: "DL-05-IJ-7890", name: "Eicher Pro 2049", status: "On Trip" },
  { id: "V-006", reg: "DL-06-KL-2345", name: "Tata 407", status: "Retired" },
];

const INITIAL_LOGS = [
  { id: "M-201", vehicleId: "V-003", description: "Oil Change", cost: 2200, status: "Open", createdAt: "2026-07-10" },
  { id: "M-202", vehicleId: "V-006", description: "Brake pad replacement", cost: 4800, status: "Closed", createdAt: "2026-06-28" },
];

const STATUS_STYLES = {
  Open: "bg-amber-50 text-amber-700",
  Closed: "bg-emerald-50 text-emerald-700",
};

function Pill({ text, styles }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>{text}</span>;
}

const inputCls =
  "w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800";

function NewLogForm({ vehicles, onCreate, onClose }) {
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [error, setError] = useState("");

  // Guard rule: a vehicle currently On Trip cannot be sent to maintenance
  const eligibleVehicles = vehicles.filter((v) => v.status === "Available" || v.status === "In Shop" ? v.status === "Available" : v.status !== "On Trip" && v.status !== "Retired");

  function handleSubmit(e) {
    e.preventDefault();
    if (!vehicleId || !description || !cost) {
      setError("All fields are required.");
      return;
    }
    onCreate({
      id: `M-${Math.floor(200 + Math.random() * 100)}`,
      vehicleId,
      description,
      cost: Number(cost),
      status: "Open",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">New Maintenance Record</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">
              Vehicle <span className="text-slate-400">({eligibleVehicles.length} eligible)</span>
            </label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className={`mt-1 ${inputCls}`}>
              <option value="">Select vehicle…</option>
              {eligibleVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.reg} — {v.name}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Vehicles currently On Trip or Retired are excluded automatically.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className={`mt-1 ${inputCls}`} placeholder="Oil Change" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Estimated cost (₹)</label>
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className={`mt-1 ${inputCls}`} />
          </div>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Create Record</button>
        </div>
      </form>
    </div>
  );
}

export default function Maintenance() {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function vehicleFor(id) {
    return vehicles.find((v) => v.id === id);
  }

  // Create maintenance log -> vehicle status becomes In Shop
  function handleCreate(log) {
    setLogs((prev) => [log, ...prev]);
    setVehicles((prev) =>
      prev.map((v) => (v.id === log.vehicleId ? { ...v, status: "In Shop" } : v))
    );
    flash(`Maintenance record ${log.id} created. Vehicle moved to In Shop.`);
  }

  // Close maintenance log -> vehicle status restores to Available, unless Retired
  function handleClose(log) {
    setLogs((prev) =>
      prev.map((l) =>
        l.id === log.id ? { ...l, status: "Closed", closedAt: new Date().toISOString().slice(0, 10) } : l
      )
    );
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== log.vehicleId) return v;
        if (v.status === "Retired") return v; // Retired vehicles never restore
        return { ...v, status: "Available" };
      })
    );
    flash(`Maintenance record ${log.id} closed. Vehicle restored to Available.`);
  }

  const openLogs = logs.filter((l) => l.status === "Open");
  const closedLogs = logs.filter((l) => l.status === "Closed");

  return (
    <div className="min-h-full w-full bg-[#F4F5F7] p-6 font-sans text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Maintenance</h1>
          <p className="text-sm text-slate-500">Open records move vehicles to In Shop automatically</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> New Record
        </button>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          {toast}
        </div>
      )}

      {/* Vehicle status strip */}
      <div className="mb-6 flex flex-wrap gap-2">
        {vehicles.map((v) => (
          <span
            key={v.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
          >
            <Wrench className="h-3 w-3 text-slate-400" />
            {v.reg}
            <span
              className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                v.status === "In Shop" ? "bg-amber-50 text-amber-700" :
                v.status === "Available" ? "bg-emerald-50 text-emerald-700" :
                v.status === "On Trip" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {v.status}
            </span>
          </span>
        ))}
      </div>

      {/* Open records */}
      <div className="mb-6">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <AlertCircle className="h-4 w-4 text-amber-500" /> Open Records ({openLogs.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {openLogs.map((log) => {
            const vehicle = vehicleFor(log.vehicleId);
            return (
              <div key={log.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">{log.id}</span>
                  <Pill text={log.status} styles={STATUS_STYLES[log.status]} />
                </div>
                <p className="mb-1 text-sm font-medium text-slate-800">{log.description}</p>
                <p className="mb-3 text-xs text-slate-500">
                  {vehicle?.reg} — {vehicle?.name} · ₹{log.cost.toLocaleString()} · opened {log.createdAt}
                </p>
                <button
                  onClick={() => handleClose(log)}
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3 w-3" /> Close Record
                </button>
              </div>
            );
          })}
          {openLogs.length === 0 && (
            <p className="text-sm text-slate-400">No open maintenance records.</p>
          )}
        </div>
      </div>

      {/* Closed records */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Closed Records ({closedLogs.length})</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Record</th>
                <th className="px-4 py-2.5 font-medium">Vehicle</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
                <th className="px-4 py-2.5 font-medium">Cost</th>
                <th className="px-4 py-2.5 font-medium">Closed</th>
              </tr>
            </thead>
            <tbody>
              {closedLogs.map((log) => {
                const vehicle = vehicleFor(log.vehicleId);
                return (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-mono text-slate-500">{log.id}</td>
                    <td className="px-4 py-2.5 text-slate-700">{vehicle?.reg}</td>
                    <td className="px-4 py-2.5 text-slate-600">{log.description}</td>
                    <td className="px-4 py-2.5 text-slate-500">₹{log.cost.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-slate-500">{log.closedAt}</td>
                  </tr>
                );
              })}
              {closedLogs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">No closed records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <NewLogForm vehicles={vehicles} onCreate={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
