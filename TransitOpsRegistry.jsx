import { useState } from "react";
import { Plus, X, Truck, User, Search, Pencil, ShieldAlert } from "lucide-react";

// --- Mock data (replace with real API calls once the backend exists) ---
const INITIAL_VEHICLES = [
  { id: "V-001", reg: "DL-01-AB-1234", name: "Tata Ace", type: "Van", maxLoad: 500, odometer: 12500, acquisitionCost: 650000, status: "Available" },
  { id: "V-002", reg: "DL-02-CD-5678", name: "Ashok Leyland Dost", type: "Truck", maxLoad: 2000, odometer: 34210, acquisitionCost: 1450000, status: "Available" },
  { id: "V-003", reg: "DL-03-EF-9012", name: "Mahindra Bolero", type: "Van", maxLoad: 500, odometer: 8900, acquisitionCost: 720000, status: "In Shop" },
  { id: "V-005", reg: "DL-05-IJ-7890", name: "Eicher Pro 2049", type: "Truck", maxLoad: 1800, odometer: 51200, acquisitionCost: 1980000, status: "On Trip" },
  { id: "V-006", reg: "DL-06-KL-2345", name: "Tata 407", type: "Van", maxLoad: 900, odometer: 88000, acquisitionCost: 540000, status: "Retired" },
];

const INITIAL_DRIVERS = [
  { id: "D-001", name: "Alex Rao", licenseNumber: "DL-LIC-88213", licenseCategory: "LMV", licenseExpiry: "2027-03-01", contact: "+91 98100 11223", safetyScore: 92, status: "Available" },
  { id: "D-002", name: "Priya Nair", licenseNumber: "DL-LIC-45521", licenseCategory: "HMV", licenseExpiry: "2026-01-10", contact: "+91 98110 33445", safetyScore: 78, status: "Available" },
  { id: "D-003", name: "Sameer Khan", licenseNumber: "DL-LIC-77034", licenseCategory: "HMV", licenseExpiry: "2027-08-20", contact: "+91 98120 55667", safetyScore: 88, status: "On Trip" },
  { id: "D-004", name: "Meera Iyer", licenseNumber: "DL-LIC-90112", licenseCategory: "LMV", licenseExpiry: "2028-05-15", contact: "+91 98130 77889", safetyScore: 41, status: "Suspended" },
  { id: "D-005", name: "Karan Verma", licenseNumber: "DL-LIC-33298", licenseCategory: "LMV", licenseExpiry: "2027-11-30", contact: "+91 98140 99001", safetyScore: 95, status: "Off Duty" },
];

const today = new Date("2026-07-12");

const VEHICLE_STATUS_STYLES = {
  Available: "bg-emerald-50 text-emerald-700",
  "On Trip": "bg-blue-50 text-blue-700",
  "In Shop": "bg-amber-50 text-amber-700",
  Retired: "bg-slate-100 text-slate-500",
};
const DRIVER_STATUS_STYLES = {
  Available: "bg-emerald-50 text-emerald-700",
  "On Trip": "bg-blue-50 text-blue-700",
  "Off Duty": "bg-slate-100 text-slate-500",
  Suspended: "bg-rose-50 text-rose-700",
};

function Pill({ text, styles }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>{text}</span>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800";

function VehicleForm({ onSave, onClose }) {
  const [form, setForm] = useState({ reg: "", name: "", type: "Van", maxLoad: "", odometer: "", acquisitionCost: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.reg || !form.name || !form.maxLoad) {
      setError("Registration number, name, and max load are required.");
      return;
    }
    onSave({
      id: `V-${Math.floor(100 + Math.random() * 900)}`,
      ...form,
      maxLoad: Number(form.maxLoad),
      odometer: Number(form.odometer || 0),
      acquisitionCost: Number(form.acquisitionCost || 0),
      status: "Available",
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Register Vehicle</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Registration No."><input className={inputCls} value={form.reg} onChange={set("reg")} placeholder="DL-09-XY-4321" /></Field>
          <Field label="Name / Model"><input className={inputCls} value={form.name} onChange={set("name")} placeholder="Tata Ace" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className={inputCls} value={form.type} onChange={set("type")}>
              <option>Van</option><option>Truck</option><option>Bike</option>
            </select>
          </Field>
          <Field label="Max load (kg)"><input type="number" className={inputCls} value={form.maxLoad} onChange={set("maxLoad")} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Odometer (km)"><input type="number" className={inputCls} value={form.odometer} onChange={set("odometer")} /></Field>
          <Field label="Acquisition cost (₹)"><input type="number" className={inputCls} value={form.acquisitionCost} onChange={set("acquisitionCost")} /></Field>
        </div>
        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Register</button>
      </div>
    </form>
  );
}

function DriverForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", licenseNumber: "", licenseCategory: "LMV", licenseExpiry: "", contact: "", safetyScore: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.licenseNumber || !form.licenseExpiry) {
      setError("Name, license number, and expiry date are required.");
      return;
    }
    onSave({
      id: `D-${Math.floor(100 + Math.random() * 900)}`,
      ...form,
      safetyScore: Number(form.safetyScore || 70),
      status: "Available",
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Add Driver</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        <Field label="Full name"><input className={inputCls} value={form.name} onChange={set("name")} placeholder="Alex Rao" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="License number"><input className={inputCls} value={form.licenseNumber} onChange={set("licenseNumber")} /></Field>
          <Field label="Category">
            <select className={inputCls} value={form.licenseCategory} onChange={set("licenseCategory")}>
              <option>LMV</option><option>HMV</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="License expiry"><input type="date" className={inputCls} value={form.licenseExpiry} onChange={set("licenseExpiry")} /></Field>
          <Field label="Safety score (0–100)"><input type="number" className={inputCls} value={form.safetyScore} onChange={set("safetyScore")} /></Field>
        </div>
        <Field label="Contact number"><input className={inputCls} value={form.contact} onChange={set("contact")} placeholder="+91 98100 11223" /></Field>
        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Add Driver</button>
      </div>
    </form>
  );
}

export default function Registry() {
  const [tab, setTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filteredVehicles = vehicles.filter(
    (v) => v.reg.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDrivers = drivers.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full w-full bg-[#F4F5F7] p-6 font-sans text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Registry</h1>
          <p className="text-sm text-slate-500">Master list of vehicles and drivers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> {tab === "vehicles" ? "Register Vehicle" : "Add Driver"}
        </button>
      </div>

      {/* Tabs + search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setTab("vehicles")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${tab === "vehicles" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Truck className="h-3.5 w-3.5" /> Vehicles ({vehicles.length})
          </button>
          <button
            onClick={() => setTab("drivers")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${tab === "drivers" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <User className="h-3.5 w-3.5" /> Drivers ({drivers.length})
          </button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "vehicles" ? "Search by reg. no or name…" : "Search by name or license…"}
            className="w-64 rounded-md border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>
      </div>

      {/* Vehicles table */}
      {tab === "vehicles" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Registration</th>
                <th className="px-4 py-2.5 font-medium">Name / Model</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Max Load</th>
                <th className="px-4 py-2.5 font-medium">Odometer</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{v.reg}</td>
                  <td className="px-4 py-2.5 text-slate-700">{v.name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{v.type}</td>
                  <td className="px-4 py-2.5 text-slate-500">{v.maxLoad}kg</td>
                  <td className="px-4 py-2.5 text-slate-500">{v.odometer.toLocaleString()}km</td>
                  <td className="px-4 py-2.5"><Pill text={v.status} styles={VEHICLE_STATUS_STYLES[v.status]} /></td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="text-slate-400 hover:text-slate-700"><Pencil className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">No vehicles found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Drivers table */}
      {tab === "drivers" && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">License No.</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Expiry</th>
                <th className="px-4 py-2.5 font-medium">Safety Score</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => {
                const expired = new Date(d.licenseExpiry) < today;
                return (
                  <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-slate-700">{d.name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">{d.licenseNumber}</td>
                    <td className="px-4 py-2.5 text-slate-500">{d.licenseCategory}</td>
                    <td className="px-4 py-2.5">
                      <span className={expired ? "flex items-center gap-1 font-medium text-rose-600" : "text-slate-500"}>
                        {expired && <ShieldAlert className="h-3 w-3" />}
                        {d.licenseExpiry}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{d.safetyScore}</td>
                    <td className="px-4 py-2.5"><Pill text={d.status} styles={DRIVER_STATUS_STYLES[d.status]} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <button className="text-slate-400 hover:text-slate-700"><Pencil className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredDrivers.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">No drivers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
          {tab === "vehicles" ? (
            <VehicleForm onSave={(v) => setVehicles((prev) => [...prev, v])} onClose={() => setShowForm(false)} />
          ) : (
            <DriverForm onSave={(d) => setDrivers((prev) => [...prev, d])} onClose={() => setShowForm(false)} />
          )}
        </div>
      )}
    </div>
  );
}
