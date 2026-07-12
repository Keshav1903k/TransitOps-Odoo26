import { useState, useMemo } from "react";
import { Plus, X, Fuel, Receipt, Download, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

// --- Mock data (replace with real API calls once the backend exists) ---
const VEHICLES = [
  { id: "V-001", reg: "DL-01-AB-1234", name: "Tata Ace", acquisitionCost: 650000 },
  { id: "V-002", reg: "DL-02-CD-5678", name: "Ashok Leyland Dost", acquisitionCost: 1450000 },
  { id: "V-005", reg: "DL-05-IJ-7890", name: "Eicher Pro 2049", acquisitionCost: 1980000 },
];

const INITIAL_FUEL_LOGS = [
  { id: "F-301", vehicleId: "V-001", liters: 32, cost: 3040, date: "2026-07-08" },
  { id: "F-302", vehicleId: "V-002", liters: 58, cost: 5510, date: "2026-07-09" },
  { id: "F-303", vehicleId: "V-005", liters: 74, cost: 7030, date: "2026-07-10" },
  { id: "F-304", vehicleId: "V-001", liters: 29, cost: 2755, date: "2026-07-11" },
];

const INITIAL_EXPENSES = [
  { id: "E-401", vehicleId: "V-001", type: "Toll", amount: 340, date: "2026-07-08" },
  { id: "E-402", vehicleId: "V-002", type: "Parking", amount: 150, date: "2026-07-09" },
  { id: "E-403", vehicleId: "V-005", type: "Toll", amount: 520, date: "2026-07-10" },
];

// Maintenance cost + trip revenue pulled in for the cost/ROI rollup (see Phase 0 spec, Section 4)
const MAINTENANCE_COST = { "V-001": 2200, "V-002": 0, "V-005": 0 };
const TRIP_REVENUE = { "V-001": 18500, "V-002": 42000, "V-005": 61000 };
const DISTANCE_TRAVELLED = { "V-001": 610, "V-002": 940, "V-005": 1120 }; // km, from completed trips

const inputCls =
  "w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function FuelForm({ vehicles, onSave, onClose }) {
  const [form, setForm] = useState({ vehicleId: "", liters: "", cost: "", date: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.vehicleId || !form.liters || !form.cost || !form.date) {
      setError("All fields are required.");
      return;
    }
    onSave({ id: `F-${Math.floor(300 + Math.random() * 100)}`, ...form, liters: Number(form.liters), cost: Number(form.cost) });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Log Fuel</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        <Field label="Vehicle">
          <select className={inputCls} value={form.vehicleId} onChange={set("vehicleId")}>
            <option value="">Select vehicle…</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.reg}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Liters"><input type="number" className={inputCls} value={form.liters} onChange={set("liters")} /></Field>
          <Field label="Cost (₹)"><input type="number" className={inputCls} value={form.cost} onChange={set("cost")} /></Field>
        </div>
        <Field label="Date"><input type="date" className={inputCls} value={form.date} onChange={set("date")} /></Field>
        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Save</button>
      </div>
    </form>
  );
}

function ExpenseForm({ vehicles, onSave, onClose }) {
  const [form, setForm] = useState({ vehicleId: "", type: "Toll", amount: "", date: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.vehicleId || !form.amount || !form.date) {
      setError("All fields are required.");
      return;
    }
    onSave({ id: `E-${Math.floor(400 + Math.random() * 100)}`, ...form, amount: Number(form.amount) });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Log Expense</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        <Field label="Vehicle">
          <select className={inputCls} value={form.vehicleId} onChange={set("vehicleId")}>
            <option value="">Select vehicle…</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.reg}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={set("type")}>
              <option>Toll</option><option>Parking</option><option>Misc</option>
            </select>
          </Field>
          <Field label="Amount (₹)"><input type="number" className={inputCls} value={form.amount} onChange={set("amount")} /></Field>
        </div>
        <Field label="Date"><input type="date" className={inputCls} value={form.date} onChange={set("date")} /></Field>
        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Save</button>
      </div>
    </form>
  );
}

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach((r) => lines.push(headers.map((h) => r[h]).join(",")));
  return lines.join("\n");
}

function downloadCSV(rows, filename) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FuelExpenseReports() {
  const [tab, setTab] = useState("fuel");
  const [fuelLogs, setFuelLogs] = useState(INITIAL_FUEL_LOGS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const report = useMemo(() => {
    return VEHICLES.map((v) => {
      const fuelTotal = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0);
      const fuelLiters = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.liters, 0);
      const expenseTotal = expenses.filter((e) => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0);
      const maintenanceCost = MAINTENANCE_COST[v.id] || 0;
      const operationalCost = fuelTotal + maintenanceCost;
      const revenue = TRIP_REVENUE[v.id] || 0;
      const distance = DISTANCE_TRAVELLED[v.id] || 0;
      const fuelEfficiency = fuelLiters > 0 ? (distance / fuelLiters).toFixed(2) : "—";
      const roi = v.acquisitionCost > 0 ? (((revenue - operationalCost) / v.acquisitionCost) * 100).toFixed(1) : "—";
      return {
        id: v.id, reg: v.reg, name: v.name,
        fuelTotal, expenseTotal, maintenanceCost, operationalCost, revenue, fuelEfficiency, roi,
      };
    });
  }, [fuelLogs, expenses]);

  return (
    <div className="min-h-full w-full bg-[#F4F5F7] p-6 font-sans text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fuel, Expenses & Reports</h1>
          <p className="text-sm text-slate-500">Operational cost, fuel efficiency, and ROI per vehicle</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFuelForm(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Fuel className="h-4 w-4" /> Log Fuel
          </button>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Receipt className="h-4 w-4" /> Log Expense
          </button>
          <button
            onClick={() => downloadCSV(report, "transitops_cost_report.csv")}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Operational cost chart */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <TrendingUp className="h-4 w-4 text-slate-400" /> Operational Cost by Vehicle
        </h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" />
              <XAxis dataKey="reg" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip />
              <Bar dataKey="fuelTotal" name="Fuel" stackId="cost" fill="#2563EB" radius={[0, 0, 0, 0]} />
              <Bar dataKey="maintenanceCost" name="Maintenance" stackId="cost" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report table */}
      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5 font-medium">Vehicle</th>
              <th className="px-4 py-2.5 font-medium">Fuel Cost</th>
              <th className="px-4 py-2.5 font-medium">Maintenance</th>
              <th className="px-4 py-2.5 font-medium">Total Op. Cost</th>
              <th className="px-4 py-2.5 font-medium">Fuel Efficiency</th>
              <th className="px-4 py-2.5 font-medium">ROI</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-mono text-slate-700">{r.reg}</td>
                <td className="px-4 py-2.5 text-slate-600">₹{r.fuelTotal.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-slate-600">₹{r.maintenanceCost.toLocaleString()}</td>
                <td className="px-4 py-2.5 font-medium text-slate-800">₹{r.operationalCost.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.fuelEfficiency} km/L</td>
                <td className="px-4 py-2.5">
                  <span className={Number(r.roi) >= 0 ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>
                    {r.roi}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fuel / Expense log tabs */}
      <div className="mb-3 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => setTab("fuel")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === "fuel" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
        >
          Fuel Logs ({fuelLogs.length})
        </button>
        <button
          onClick={() => setTab("expenses")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === "expenses" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
        >
          Expenses ({expenses.length})
        </button>
      </div>

      {tab === "fuel" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Vehicle</th>
                <th className="px-4 py-2.5 font-medium">Liters</th>
                <th className="px-4 py-2.5 font-medium">Cost</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {fuelLogs.map((f) => (
                <tr key={f.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{VEHICLES.find((v) => v.id === f.vehicleId)?.reg}</td>
                  <td className="px-4 py-2.5 text-slate-600">{f.liters} L</td>
                  <td className="px-4 py-2.5 text-slate-600">₹{f.cost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-500">{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "expenses" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Vehicle</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{VEHICLES.find((v) => v.id === e.vehicleId)?.reg}</td>
                  <td className="px-4 py-2.5 text-slate-600">{e.type}</td>
                  <td className="px-4 py-2.5 text-slate-600">₹{e.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-500">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showFuelForm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
          <FuelForm vehicles={VEHICLES} onSave={(f) => setFuelLogs((prev) => [...prev, f])} onClose={() => setShowFuelForm(false)} />
        </div>
      )}
      {showExpenseForm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
          <ExpenseForm vehicles={VEHICLES} onSave={(e) => setExpenses((prev) => [...prev, e])} onClose={() => setShowExpenseForm(false)} />
        </div>
      )}
    </div>
  );
}
