import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Truck, Users, Wrench, MapPin, Filter } from "lucide-react";

// --- Mock data (replace with real API calls once the backend exists) ---
const VEHICLES = [
  { id: "V-001", reg: "DL-01-AB-1234", type: "Van", status: "Available", region: "North" },
  { id: "V-002", reg: "DL-02-CD-5678", type: "Truck", status: "On Trip", region: "South" },
  { id: "V-003", reg: "DL-03-EF-9012", type: "Van", status: "In Shop", region: "East" },
  { id: "V-004", reg: "DL-04-GH-3456", type: "Bike", status: "Available", region: "West" },
  { id: "V-005", reg: "DL-05-IJ-7890", type: "Truck", status: "On Trip", region: "North" },
  { id: "V-006", reg: "DL-06-KL-2345", type: "Van", status: "Retired", region: "South" },
  { id: "V-007", reg: "DL-07-MN-6789", type: "Truck", status: "Available", region: "East" },
  { id: "V-008", reg: "DL-08-OP-0123", type: "Van", status: "On Trip", region: "West" },
];

const DRIVERS = [
  { id: "D-001", status: "On Trip" },
  { id: "D-002", status: "Available" },
  { id: "D-003", status: "On Trip" },
  { id: "D-004", status: "Off Duty" },
  { id: "D-005", status: "Suspended" },
];

const TRIPS = [
  { id: "T-101", status: "Dispatched" },
  { id: "T-102", status: "Draft" },
  { id: "T-103", status: "Dispatched" },
  { id: "T-104", status: "Draft" },
  { id: "T-105", status: "Completed" },
];

const STATUS_COLORS = {
  Available: "#16A34A",
  "On Trip": "#2563EB",
  "In Shop": "#F59E0B",
  Retired: "#6B7280",
};

const VEHICLE_TYPES = ["All", "Van", "Truck", "Bike"];
const VEHICLE_STATUSES = ["All", "Available", "On Trip", "In Shop", "Retired"];
const REGIONS = ["All", "North", "South", "East", "West"];

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function FlapCell({ label, value, suffix = "" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border-r border-white/10 px-4 py-6 last:border-r-0">
      <span
        className="font-mono text-4xl font-semibold tabular-nums text-amber-400 tracking-tight"
        style={{ textShadow: "0 0 18px rgba(251,191,36,0.25)" }}
      >
        {value}
        <span className="text-lg text-amber-400/70">{suffix}</span>
      </span>
      <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

export default function TransitOpsDashboard() {
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [region, setRegion] = useState("All");

  const filteredVehicles = useMemo(
    () =>
      VEHICLES.filter(
        (v) =>
          (type === "All" || v.type === type) &&
          (status === "All" || v.status === status) &&
          (region === "All" || v.region === region)
      ),
    [type, status, region]
  );

  const kpis = useMemo(() => {
    const active = filteredVehicles.filter((v) => v.status !== "Retired").length;
    const available = filteredVehicles.filter((v) => v.status === "Available").length;
    const inShop = filteredVehicles.filter((v) => v.status === "In Shop").length;
    const activeTrips = TRIPS.filter((t) => t.status === "Dispatched").length;
    const pendingTrips = TRIPS.filter((t) => t.status === "Draft").length;
    const driversOnDuty = DRIVERS.filter((d) => d.status === "On Trip" || d.status === "Available").length;
    const onTrip = filteredVehicles.filter((v) => v.status === "On Trip").length;
    const utilization = active > 0 ? Math.round((onTrip / active) * 100) : 0;
    return { active, available, inShop, activeTrips, pendingTrips, driversOnDuty, utilization };
  }, [filteredVehicles]);

  const statusBreakdown = useMemo(() => {
    const counts = {};
    filteredVehicles.forEach((v) => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredVehicles]);

  return (
    <div className="min-h-full w-full bg-[#F4F5F7] p-6 font-sans text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">TransitOps</h1>
          <p className="text-sm text-slate-500">Fleet operations, live status board</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Filter className="h-4 w-4 text-slate-400" />
          <FilterSelect label="Vehicle type" value={type} onChange={setType} options={VEHICLE_TYPES} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={VEHICLE_STATUSES} />
          <FilterSelect label="Region" value={region} onChange={setRegion} options={REGIONS} />
        </div>
      </div>

      {/* Signature element: split-flap departure-board KPI panel */}
      <div className="mb-6 overflow-hidden rounded-xl bg-[#12181F] shadow-lg">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Fleet Status Board
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          <FlapCell label="Active Vehicles" value={kpis.active} />
          <FlapCell label="Available" value={kpis.available} />
          <FlapCell label="In Maintenance" value={kpis.inShop} />
          <FlapCell label="Active Trips" value={kpis.activeTrips} />
          <FlapCell label="Pending Trips" value={kpis.pendingTrips} />
          <FlapCell label="Drivers On Duty" value={kpis.driversOnDuty} />
          <FlapCell label="Fleet Utilization" value={kpis.utilization} suffix="%" />
        </div>
      </div>

      {/* Secondary panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Status breakdown</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94A3B8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
            {statusBreakdown.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: STATUS_COLORS[s.name] || "#94A3B8" }}
                />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Fleet ({filteredVehicles.length})</h2>
          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Registration</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Region</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-slate-700">{v.reg}</td>
                    <td className="px-3 py-2 text-slate-600">{v.type}</td>
                    <td className="px-3 py-2 text-slate-600">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin className="h-3 w-3" /> {v.region}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          color: STATUS_COLORS[v.status] || "#475569",
                          background: `${STATUS_COLORS[v.status] || "#94A3B8"}1A`,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: STATUS_COLORS[v.status] || "#94A3B8" }}
                        />
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-400">
                      No vehicles match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex gap-3">
        <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
          <Truck className="h-4 w-4" /> Register Vehicle
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
          <Wrench className="h-4 w-4" /> Log Maintenance
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
          <Users className="h-4 w-4" /> Assign Trip
        </button>
      </div>
    </div>
  );
}
