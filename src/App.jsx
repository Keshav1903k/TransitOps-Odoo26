import React, { useState, useMemo } from "react";
import {
  Truck, Users, Wrench, Fuel, BarChart3, LayoutDashboard, MapPin, ChevronDown
} from "lucide-react";
import { FONT_IMPORT, COLORS, ROLES, STATUS_STYLES, uid, today, fmtDate } from "./theme";
import { seedVehicles, seedDrivers, seedTrips, seedMaintenance, seedFuel, seedExpense } from "./data/seed";
import { inputStyle } from "./components/ui";

import { DashboardPage } from "./mock-pages/Dashboard";
import { VehiclesPage, VehicleForm } from "./mock-pages/Vehicles";
import { DriversPage, DriverForm } from "./mock-pages/Drivers";
import { TripsPage, TripForm, CompleteTripForm } from "./mock-pages/Trips";
import { MaintenancePage, MaintenanceForm } from "./mock-pages/Maintenance";
import { FuelExpensePage, FuelForm, ExpenseForm } from "./mock-pages/FuelExpense";
import { ReportsPage } from "./mock-pages/Reports";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "vehicles", label: "Vehicles", icon: Truck },
  { key: "drivers", label: "Drivers", icon: Users },
  { key: "trips", label: "Trips", icon: MapPin },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
  { key: "fuel", label: "Fuel & Expense", icon: Fuel },
  { key: "reports", label: "Reports", icon: BarChart3 },
];

/* ------------------------------------------------------------------ */
/* Main App                                                            */
/* ------------------------------------------------------------------ */
export default function TransitOpsApp() {
  const [role, setRole] = useState("FLEET_MANAGER");
  const [tab, setTab] = useState("dashboard");
  const [vehicles, setVehicles] = useState(seedVehicles);
  const [drivers, setDrivers] = useState(seedDrivers);
  const [trips, setTrips] = useState(seedTrips);
  const [maint, setMaint] = useState(seedMaintenance);
  const [fuel, setFuel] = useState(seedFuel);
  const [expense, setExpense] = useState(seedExpense);
  const [modal, setModal] = useState(null); // { type, payload }

  const allowedTabs = ROLES[role].tabs;
  const activeTab = allowedTabs.includes(tab) ? tab : allowedTabs[0];

  const vMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, v])), [vehicles]);
  const dMap = useMemo(() => Object.fromEntries(drivers.map(d => [d.id, d])), [drivers]);

  /* ---------- CRUD ---------- */
  const addVehicle = (data) => setVehicles(v => [...v, { id: uid("V"), status: "AVAILABLE", ...data }]);
  const addDriver = (data) => setDrivers(d => [...d, { id: uid("D"), status: "AVAILABLE", ...data }]);

  /* ---------- Trip state machine ---------- */
  const dispatchTrip = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    const v = vMap[trip.vehicleId], d = dMap[trip.driverId];
    if (v.status !== "AVAILABLE") return alert(`Reject: vehicle ${v.name} is not Available (currently ${STATUS_STYLES[v.status].label}).`);
    if (d.status !== "AVAILABLE") return alert(`Reject: driver ${d.name} is not Available (currently ${STATUS_STYLES[d.status].label}).`);
    if (new Date(d.licenseExpiryDate) < today) return alert(`Reject: ${d.name}'s license expired on ${fmtDate(d.licenseExpiryDate)}.`);
    if (d.status === "SUSPENDED") return alert(`Reject: ${d.name} is suspended.`);
    if (trip.cargoWeight > v.maxLoadCapacity) return alert(`Reject: cargo ${trip.cargoWeight}kg exceeds ${v.name}'s ${v.maxLoadCapacity}kg capacity.`);
    // atomic
    setTrips(ts => ts.map(t => t.id === tripId ? { ...t, status: "DISPATCHED", dispatchedAt: new Date().toISOString() } : t));
    setVehicles(vs => vs.map(x => x.id === v.id ? { ...x, status: "ON_TRIP" } : x));
    setDrivers(ds => ds.map(x => x.id === d.id ? { ...x, status: "ON_TRIP" } : x));
  };

  const completeTrip = (tripId, actualDistance, fuelConsumed) => {
    const trip = trips.find(t => t.id === tripId);
    setTrips(ts => ts.map(t => t.id === tripId ? { ...t, status: "COMPLETED", actualDistance, fuelConsumed, completedAt: new Date().toISOString() } : t));
    setVehicles(vs => vs.map(x => x.id === trip.vehicleId ? { ...x, status: "AVAILABLE", odometer: x.odometer + Number(actualDistance) } : x));
    setDrivers(ds => ds.map(x => x.id === trip.driverId ? { ...x, status: "AVAILABLE" } : x));
    setModal(null);
  };

  const cancelTrip = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    setTrips(ts => ts.map(t => t.id === tripId ? { ...t, status: "CANCELLED" } : t));
    if (trip.status === "DISPATCHED") {
      setVehicles(vs => vs.map(x => x.id === trip.vehicleId ? { ...x, status: "AVAILABLE" } : x));
      setDrivers(ds => ds.map(x => x.id === trip.driverId ? { ...x, status: "AVAILABLE" } : x));
    }
  };

  const createTrip = (data) => setTrips(ts => [...ts, { id: uid("T"), status: "DRAFT", actualDistance: null, fuelConsumed: null, dispatchedAt: null, completedAt: null, createdAt: new Date().toISOString(), ...data }]);

  /* ---------- Maintenance state machine ---------- */
  const openMaintenance = (vehicleId, description, cost) => {
    const v = vMap[vehicleId];
    if (v.status === "ON_TRIP") return alert(`Reject: ${v.name} is currently On Trip and cannot be sent to maintenance.`);
    setMaint(m => [...m, { id: uid("M"), vehicleId, description, cost: Number(cost), status: "OPEN", createdAt: new Date().toISOString(), closedAt: null }]);
    setVehicles(vs => vs.map(x => x.id === vehicleId ? { ...x, status: "IN_SHOP" } : x));
    setModal(null);
  };
  const closeMaintenance = (logId) => {
    const log = maint.find(m => m.id === logId);
    setMaint(m => m.map(x => x.id === logId ? { ...x, status: "CLOSED", closedAt: new Date().toISOString() } : x));
    setVehicles(vs => vs.map(x => x.id === log.vehicleId ? (x.status === "RETIRED" ? x : { ...x, status: "AVAILABLE" }) : x));
  };

  const addFuel = (data) => setFuel(f => [...f, { id: uid("F"), ...data, liters: Number(data.liters), cost: Number(data.cost) }]);
  const addExpense = (data) => setExpense(e => [...e, { id: uid("E"), ...data, amount: Number(data.amount) }]);

  /* ---------- Derived metrics ---------- */
  const metrics = useMemo(() => {
    const active = vehicles.filter(v => v.status !== "RETIRED");
    const available = vehicles.filter(v => v.status === "AVAILABLE");
    const inShop = vehicles.filter(v => v.status === "IN_SHOP");
    const onTrip = vehicles.filter(v => v.status === "ON_TRIP");
    const activeTrips = trips.filter(t => t.status === "DISPATCHED");
    const pendingTrips = trips.filter(t => t.status === "DRAFT");
    const onDuty = drivers.filter(d => d.status !== "OFF_DUTY" && d.status !== "SUSPENDED");
    const utilization = active.length ? Math.round((onTrip.length / active.length) * 100) : 0;
    return { active, available, inShop, onTrip, activeTrips, pendingTrips, onDuty, utilization };
  }, [vehicles, trips, drivers]);

  const perVehicleFinance = useMemo(() => vehicles.map(v => {
    const revenue = trips.filter(t => t.vehicleId === v.id && t.status === "COMPLETED").reduce((s, t) => s + Number(t.revenue || 0), 0);
    const fuelCost = fuel.filter(f => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0);
    const maintCost = maint.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
    const expenseCost = expense.filter(e => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0);
    const opCost = fuelCost + maintCost;
    const roi = v.acquisitionCost ? (revenue - opCost) / v.acquisitionCost : 0;
    const completedTrips = trips.filter(t => t.vehicleId === v.id && t.status === "COMPLETED" && t.fuelConsumed);
    const totalDist = completedTrips.reduce((s, t) => s + Number(t.actualDistance || 0), 0);
    const totalFuel = completedTrips.reduce((s, t) => s + Number(t.fuelConsumed || 0), 0);
    const fuelEfficiency = totalFuel ? +(totalDist / totalFuel).toFixed(1) : null;
    return { ...v, revenue, fuelCost, maintCost, expenseCost, opCost, roi, fuelEfficiency };
  }), [vehicles, trips, fuel, maint, expense]);

  const exportCSV = () => {
    const header = ["Trip ID", "Source", "Destination", "Vehicle", "Driver", "Cargo(kg)", "Planned(km)", "Actual(km)", "Fuel(L)", "Revenue", "Status"];
    const rows = trips.map(t => [t.id, t.source, t.destination, vMap[t.vehicleId]?.name, dMap[t.driverId]?.name, t.cargoWeight, t.plannedDistance, t.actualDistance ?? "", t.fuelConsumed ?? "", t.revenue, t.status]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "transitops_trips.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", minHeight: 640, height: "100%", background: COLORS.paper, fontFamily: "'IBM Plex Sans', sans-serif", borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.line}` }}>
      <style>{FONT_IMPORT}</style>

      {/* Sidebar */}
      <div style={{ width: 216, background: COLORS.ink, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: COLORS.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={15} color={COLORS.ink} />
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" }}>TransitOps</span>
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Fleet Dispatch Console</div>
        </div>
        <nav style={{ padding: 10, display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV_ITEMS.filter(n => allowedTabs.includes(n.key)).map(n => {
            const Icon = n.icon;
            const active = n.key === activeTab;
            return (
              <button key={n.key} onClick={() => setTab(n.key)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 7,
                background: active ? "rgba(226,154,60,0.15)" : "transparent",
                color: active ? COLORS.amber : "rgba(255,255,255,0.75)",
                border: active ? `1px solid ${COLORS.amber}55` : "1px solid transparent",
                fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left",
              }}>
                <Icon size={15} />{n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 10.5, color: "rgba(255,255,255,0.35)" }}>
          UI prototype — in-memory data, no backend.
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${COLORS.line}`, background: "#fff" }}>
          <div style={{ fontSize: 12, color: COLORS.slate }}>
            Signed in as <strong style={{ color: COLORS.ink }}>{ROLES[role].label}</strong>
          </div>
          <div style={{ position: "relative" }}>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{
              ...inputStyle, appearance: "none", paddingRight: 30, fontWeight: 600, fontSize: 12.5, cursor: "pointer",
            }}>
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 9, top: 9, pointerEvents: "none", color: COLORS.slate }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeTab === "dashboard" && <DashboardPage metrics={metrics} vehicles={vehicles} trips={trips} finance={perVehicleFinance} />}
          {activeTab === "vehicles" && <VehiclesPage vehicles={vehicles} onAdd={() => setModal({ type: "vehicle" })} />}
          {activeTab === "drivers" && <DriversPage drivers={drivers} onAdd={() => setModal({ type: "driver" })} />}
          {activeTab === "trips" && <TripsPage trips={trips} vehicles={vehicles} drivers={drivers} vMap={vMap} dMap={dMap}
            onNew={() => setModal({ type: "trip" })}
            onDispatch={dispatchTrip}
            onComplete={(t) => setModal({ type: "complete", payload: t })}
            onCancel={cancelTrip} />}
          {activeTab === "maintenance" && <MaintenancePage logs={maint} vehicles={vehicles} vMap={vMap}
            onNew={() => setModal({ type: "maintenance" })} onClose={closeMaintenance} />}
          {activeTab === "fuel" && <FuelExpensePage fuel={fuel} expense={expense} vMap={vMap}
            onAddFuel={() => setModal({ type: "fuel" })} onAddExpense={() => setModal({ type: "expense" })} />}
          {activeTab === "reports" && <ReportsPage finance={perVehicleFinance} onExport={exportCSV} />}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "vehicle" && <VehicleForm onClose={() => setModal(null)} onSave={addVehicle} />}
      {modal?.type === "driver" && <DriverForm onClose={() => setModal(null)} onSave={addDriver} />}
      {modal?.type === "trip" && <TripForm vehicles={vehicles} drivers={drivers} onClose={() => setModal(null)} onSave={createTrip} />}
      {modal?.type === "complete" && <CompleteTripForm trip={modal.payload} onClose={() => setModal(null)} onSave={completeTrip} />}
      {modal?.type === "maintenance" && <MaintenanceForm vehicles={vehicles} onClose={() => setModal(null)} onSave={openMaintenance} />}
      {modal?.type === "fuel" && <FuelForm vehicles={vehicles} onClose={() => setModal(null)} onSave={addFuel} />}
      {modal?.type === "expense" && <ExpenseForm vehicles={vehicles} onClose={() => setModal(null)} onSave={addExpense} />}
    </div>
  );
}
