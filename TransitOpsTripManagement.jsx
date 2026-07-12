import { useState, useMemo } from "react";
import { Plus, X, MapPin, ArrowRight, Package, Check, Ban } from "lucide-react";

// --- Mock data (replace with real API calls once the backend exists) ---
const INITIAL_VEHICLES = [
  { id: "V-001", reg: "DL-01-AB-1234", type: "Van", status: "Available", maxLoad: 500 },
  { id: "V-002", reg: "DL-02-CD-5678", type: "Truck", status: "Available", maxLoad: 2000 },
  { id: "V-003", reg: "DL-03-EF-9012", type: "Van", status: "In Shop", maxLoad: 500 },
  { id: "V-005", reg: "DL-05-IJ-7890", type: "Truck", status: "On Trip", maxLoad: 1800 },
  { id: "V-007", reg: "DL-07-MN-6789", type: "Truck", status: "Available", maxLoad: 2200 },
];

const INITIAL_DRIVERS = [
  { id: "D-001", name: "Alex Rao", status: "Available", licenseExpiry: "2027-03-01", suspended: false },
  { id: "D-002", name: "Priya Nair", status: "Available", licenseExpiry: "2026-01-10", suspended: false }, // expired
  { id: "D-003", name: "Sameer Khan", status: "On Trip", licenseExpiry: "2027-08-20", suspended: false },
  { id: "D-004", name: "Meera Iyer", status: "Available", licenseExpiry: "2028-05-15", suspended: true }, // suspended
  { id: "D-005", name: "Karan Verma", status: "Available", licenseExpiry: "2027-11-30", suspended: false },
];

const INITIAL_TRIPS = [
  { id: "T-101", source: "Delhi Hub", destination: "Gurgaon DC", vehicleId: "V-005", driverId: "D-003", cargoWeight: 1200, plannedDistance: 32, status: "Dispatched" },
  { id: "T-102", source: "Noida Hub", destination: "Faridabad DC", vehicleId: null, driverId: null, cargoWeight: 300, plannedDistance: 45, status: "Draft" },
];

const STATUS_STYLES = {
  Draft: "bg-slate-100 text-slate-600",
  Dispatched: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-rose-50 text-rose-700",
};

const today = new Date("2026-07-12");

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function NewTripForm({ vehicles, drivers, onCreate, onClose }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");
  const [error, setError] = useState("");

  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const eligibleDrivers = drivers.filter(
    (d) => d.status === "Available" && !d.suspended && new Date(d.licenseExpiry) >= today
  );

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  function handleSubmit(e) {
    e.preventDefault();
    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
      setError("All fields are required.");
      return;
    }
    if (selectedVehicle && Number(cargoWeight) > selectedVehicle.maxLoad) {
      setError(`Cargo weight exceeds ${selectedVehicle.reg}'s max load of ${selectedVehicle.maxLoad}kg.`);
      return;
    }
    onCreate({
      id: `T-${Math.floor(100 + Math.random() * 900)}`,
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      status: "Draft",
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">New Trip</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Source</label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="Delhi Hub"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Destination</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                placeholder="Gurgaon DC"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Vehicle <span className="text-slate-400">({availableVehicles.length} available)</span>
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              <option value="">Select vehicle…</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.reg} — {v.type} (max {v.maxLoad}kg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Driver <span className="text-slate-400">({eligibleDrivers.length} eligible)</span>
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              <option value="">Select driver…</option>
              {eligibleDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Suspended drivers and expired licenses are excluded automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Cargo weight (kg)</label>
              <input
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Planned distance (km)</label>
              <input
                type="number"
                value={plannedDistance}
                onChange={(e) => setPlannedDistance(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create Trip
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TripManagement() {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function updateVehicleStatus(id, status) {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
  }
  function updateDriverStatus(id, status) {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }

  function handleCreate(trip) {
    setTrips((prev) => [...prev, trip]);
    flash(`Trip ${trip.id} created as Draft.`);
  }

  // Dispatch: Draft -> Dispatched; Vehicle & Driver -> On Trip
  function handleDispatch(trip) {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, status: "Dispatched" } : t))
    );
    updateVehicleStatus(trip.vehicleId, "On Trip");
    updateDriverStatus(trip.driverId, "On Trip");
    flash(`Trip ${trip.id} dispatched. Vehicle & driver marked On Trip.`);
  }

  // Complete: Dispatched -> Completed; Vehicle & Driver -> Available
  function handleComplete(trip) {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, status: "Completed" } : t))
    );
    updateVehicleStatus(trip.vehicleId, "Available");
    updateDriverStatus(trip.driverId, "Available");
    flash(`Trip ${trip.id} completed. Vehicle & driver restored to Available.`);
  }

  // Cancel: Draft or Dispatched -> Cancelled; if it was Dispatched, restore vehicle & driver
  function handleCancel(trip) {
    setTrips((prev) =>
      prev.map((t) => (t.id === trip.id ? { ...t, status: "Cancelled" } : t))
    );
    if (trip.status === "Dispatched") {
      updateVehicleStatus(trip.vehicleId, "Available");
      updateDriverStatus(trip.driverId, "Available");
    }
    flash(`Trip ${trip.id} cancelled.`);
  }

  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverMap = useMemo(() => Object.fromEntries(drivers.map((d) => [d.id, d])), [drivers]);

  return (
    <div className="min-h-full w-full bg-[#F4F5F7] p-6 font-sans text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trip Management</h1>
          <p className="text-sm text-slate-500">Draft → Dispatched → Completed / Cancelled</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> New Trip
        </button>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          {toast}
        </div>
      )}

      {/* Trip cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {trips.map((trip) => {
          const vehicle = trip.vehicleId ? vehicleMap[trip.vehicleId] : null;
          const driver = trip.driverId ? driverMap[trip.driverId] : null;
          return (
            <div key={trip.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{trip.id}</span>
                <StatusPill status={trip.status} />
              </div>

              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {trip.source}
                <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                {trip.destination}
              </div>

              <div className="mb-3 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3 w-3" /> {trip.cargoWeight}kg · {trip.plannedDistance}km planned
                </div>
                <div>Vehicle: {vehicle ? vehicle.reg : "—"}</div>
                <div>Driver: {driver ? driver.name : "—"}</div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 pt-3">
                {trip.status === "Draft" && (
                  <>
                    <button
                      onClick={() => handleDispatch(trip)}
                      className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <ArrowRight className="h-3 w-3" /> Dispatch
                    </button>
                    <button
                      onClick={() => handleCancel(trip)}
                      className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Ban className="h-3 w-3" /> Cancel
                    </button>
                  </>
                )}
                {trip.status === "Dispatched" && (
                  <>
                    <button
                      onClick={() => handleComplete(trip)}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3 w-3" /> Complete
                    </button>
                    <button
                      onClick={() => handleCancel(trip)}
                      className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Ban className="h-3 w-3" /> Cancel
                    </button>
                  </>
                )}
                {(trip.status === "Completed" || trip.status === "Cancelled") && (
                  <span className="text-xs text-slate-400">No further actions.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <NewTripForm
          vehicles={vehicles}
          drivers={drivers}
          onCreate={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
