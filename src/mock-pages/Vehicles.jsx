import React, { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHead, Table, Th, Td, Plate, Badge, Btn, Modal, Field, inputStyle } from "../components/ui";

/* ------------------------------------------------------------------ */
/* Vehicles                                                             */
/* ------------------------------------------------------------------ */
export function VehiclesPage({ vehicles, onAdd }) {
  return (
    <div>
      <SectionHead title="Vehicle Registry" subtitle={`${vehicles.length} vehicles on file`} action={<Btn variant="amber" icon={Plus} onClick={onAdd}>Add Vehicle</Btn>} />
      <Table>
        <thead><tr><Th>Reg. No.</Th><Th>Name</Th><Th>Type</Th><Th>Capacity</Th><Th>Odometer</Th><Th>Region</Th><Th>Status</Th></tr></thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <Td><Plate>{v.registrationNumber}</Plate></Td>
              <Td style={{ fontWeight: 600 }}>{v.name}</Td>
              <Td>{v.type}</Td>
              <Td>{v.maxLoadCapacity} kg</Td>
              <Td>{v.odometer.toLocaleString()} km</Td>
              <Td>{v.region}</Td>
              <Td><Badge status={v.status} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export function VehicleForm({ onClose, onSave }) {
  const [f, setF] = useState({ registrationNumber: "", name: "", type: "Van", maxLoadCapacity: "", odometer: "", acquisitionCost: "", region: "North" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); if (!f.registrationNumber || !f.name) return; onSave({ ...f, maxLoadCapacity: Number(f.maxLoadCapacity), odometer: Number(f.odometer || 0), acquisitionCost: Number(f.acquisitionCost || 0) }); onClose(); };
  return (
    <Modal title="Add Vehicle" onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <Field label="Registration Number"><input style={inputStyle} value={f.registrationNumber} onChange={set("registrationNumber")} placeholder="DL-07-VAN-11" required /></Field>
        <Field label="Name / Model"><input style={inputStyle} value={f.name} onChange={set("name")} placeholder="Van-11" required /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Type">
            <select style={inputStyle} value={f.type} onChange={set("type")}>
              <option>Van</option><option>Truck</option><option>Bike</option>
            </select>
          </Field>
          <Field label="Region">
            <select style={inputStyle} value={f.region} onChange={set("region")}>
              <option>North</option><option>South</option><option>East</option><option>West</option>
            </select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Max Load Capacity (kg)"><input type="number" style={inputStyle} value={f.maxLoadCapacity} onChange={set("maxLoadCapacity")} required /></Field>
          <Field label="Current Odometer (km)"><input type="number" style={inputStyle} value={f.odometer} onChange={set("odometer")} /></Field>
        </div>
        <Field label="Acquisition Cost (₹)"><input type="number" style={inputStyle} value={f.acquisitionCost} onChange={set("acquisitionCost")} /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="amber" type="submit">Save Vehicle</Btn>
        </div>
      </form>
    </Modal>
  );
}
