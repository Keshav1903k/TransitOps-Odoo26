import React, { useState } from "react";
import { Plus, ArrowRight, Check, Ban } from "lucide-react";
import { COLORS, today, fmtDate, money } from "../theme";
import { SectionHead, Table, Th, Td, Badge, Btn, Modal, Field, inputStyle, Banner } from "../components/ui";

/* ------------------------------------------------------------------ */
/* Trips                                                                */
/* ------------------------------------------------------------------ */
export function TripsPage({ trips, vMap, dMap, onNew, onDispatch, onComplete, onCancel }) {
  return (
    <div>
      <SectionHead title="Trip Dispatch Board" subtitle="Draft → Dispatched → Completed / Cancelled" action={<Btn variant="amber" icon={Plus} onClick={onNew}>New Trip</Btn>} />
      <Table>
        <thead><tr><Th>Route</Th><Th>Vehicle</Th><Th>Driver</Th><Th>Cargo</Th><Th>Distance</Th><Th>Revenue</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {trips.map(t => {
            const v = vMap[t.vehicleId], d = dMap[t.driverId];
            return (
              <tr key={t.id}>
                <Td>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5 }}>
                    <span>{t.source}</span><ArrowRight size={11} color={COLORS.slate} /><span>{t.destination}</span>
                  </div>
                </Td>
                <Td>{v?.name}</Td>
                <Td>{d?.name}</Td>
                <Td>{t.cargoWeight} kg</Td>
                <Td>{t.plannedDistance} km{t.actualDistance ? ` (act. ${t.actualDistance})` : ""}</Td>
                <Td>{money(t.revenue)}</Td>
                <Td><Badge status={t.status} /></Td>
                <Td>
                  <div style={{ display: "flex", gap: 6 }}>
                    {t.status === "DRAFT" && <>
                      <Btn variant="teal" onClick={() => onDispatch(t.id)}>Dispatch</Btn>
                      <Btn variant="danger" onClick={() => onCancel(t.id)}>Cancel</Btn>
                    </>}
                    {t.status === "DISPATCHED" && <>
                      <Btn variant="amber" icon={Check} onClick={() => onComplete(t)}>Complete</Btn>
                      <Btn variant="danger" icon={Ban} onClick={() => onCancel(t.id)}>Cancel</Btn>
                    </>}
                    {(t.status === "COMPLETED" || t.status === "CANCELLED") && <span style={{ fontSize: 12, color: COLORS.slate }}>—</span>}
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export function TripForm({ vehicles, drivers, onClose, onSave }) {
  const availableVehicles = vehicles.filter(v => v.status === "AVAILABLE");
  const availableDrivers = drivers.filter(d => d.status === "AVAILABLE" && d.status !== "SUSPENDED" && new Date(d.licenseExpiryDate) >= today);
  const [f, setF] = useState({ source: "", destination: "", vehicleId: availableVehicles[0]?.id || "", driverId: availableDrivers[0]?.id || "", cargoWeight: "", plannedDistance: "", revenue: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const chosenVehicle = vehicles.find(v => v.id === f.vehicleId);

  const submit = (e) => {
    e.preventDefault();
    if (!f.source || !f.destination || !f.vehicleId || !f.driverId) { setErr("All fields are required."); return; }
    if (chosenVehicle && Number(f.cargoWeight) > chosenVehicle.maxLoadCapacity) { setErr(`Cargo weight exceeds ${chosenVehicle.name}'s ${chosenVehicle.maxLoadCapacity}kg capacity.`); return; }
    onSave({ source: f.source, destination: f.destination, vehicleId: f.vehicleId, driverId: f.driverId, cargoWeight: Number(f.cargoWeight), plannedDistance: Number(f.plannedDistance), revenue: Number(f.revenue || 0) });
    onClose();
  };

  return (
    <Modal title="New Trip" onClose={onClose} wide>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <Banner text={err} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Source"><input style={inputStyle} value={f.source} onChange={set("source")} placeholder="Delhi Hub" required /></Field>
          <Field label="Destination"><input style={inputStyle} value={f.destination} onChange={set("destination")} placeholder="Gurugram DC" required /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label={`Vehicle (${availableVehicles.length} available)`}>
            <select style={inputStyle} value={f.vehicleId} onChange={set("vehicleId")} required>
              {availableVehicles.length === 0 && <option value="">No available vehicles</option>}
              {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} — {v.maxLoadCapacity}kg cap.</option>)}
            </select>
          </Field>
          <Field label={`Driver (${availableDrivers.length} available)`}>
            <select style={inputStyle} value={f.driverId} onChange={set("driverId")} required>
              {availableDrivers.length === 0 && <option value="">No available drivers</option>}
              {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} — lic. exp. {fmtDate(d.licenseExpiryDate)}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Field label="Cargo Weight (kg)"><input type="number" style={inputStyle} value={f.cargoWeight} onChange={set("cargoWeight")} required /></Field>
          <Field label="Planned Distance (km)"><input type="number" style={inputStyle} value={f.plannedDistance} onChange={set("plannedDistance")} required /></Field>
          <Field label="Revenue (₹)"><input type="number" style={inputStyle} value={f.revenue} onChange={set("revenue")} /></Field>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="amber" type="submit">Create Draft Trip</Btn>
        </div>
      </form>
    </Modal>
  );
}

export function CompleteTripForm({ trip, onClose, onSave }) {
  const [actualDistance, setAD] = useState(trip.plannedDistance);
  const [fuelConsumed, setFC] = useState("");
  const submit = (e) => { e.preventDefault(); if (!actualDistance || !fuelConsumed) return; onSave(trip.id, actualDistance, fuelConsumed); };
  return (
    <Modal title={`Complete Trip ${trip.id}`} onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <p style={{ fontSize: 12.5, color: COLORS.slate, margin: 0 }}>{trip.source} <ArrowRight size={11} style={{ verticalAlign: -1 }} /> {trip.destination}</p>
        <Field label="Actual Distance Travelled (km)"><input type="number" style={inputStyle} value={actualDistance} onChange={(e) => setAD(e.target.value)} required /></Field>
        <Field label="Fuel Consumed (L)"><input type="number" style={inputStyle} value={fuelConsumed} onChange={(e) => setFC(e.target.value)} required /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="amber" type="submit" icon={Check}>Mark Completed</Btn>
        </div>
      </form>
    </Modal>
  );
}
