import React, { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import { COLORS, today, fmtDate, daysFromNow } from "../theme";
import { SectionHead, Table, Th, Td, Plate, Badge, Btn, Modal, Field, inputStyle } from "../components/ui";

/* ------------------------------------------------------------------ */
/* Drivers                                                              */
/* ------------------------------------------------------------------ */
export function DriversPage({ drivers, onAdd }) {
  return (
    <div>
      <SectionHead title="Driver Registry" subtitle={`${drivers.length} drivers on file`} action={<Btn variant="amber" icon={Plus} onClick={onAdd}>Add Driver</Btn>} />
      <Table>
        <thead><tr><Th>Name</Th><Th>License No.</Th><Th>Category</Th><Th>Expiry</Th><Th>Safety Score</Th><Th>Status</Th></tr></thead>
        <tbody>
          {drivers.map(d => {
            const expired = new Date(d.licenseExpiryDate) < today;
            return (
              <tr key={d.id}>
                <Td style={{ fontWeight: 600 }}>{d.name}</Td>
                <Td><Plate>{d.licenseNumber}</Plate></Td>
                <Td>{d.licenseCategory}</Td>
                <Td style={{ color: expired ? COLORS.red : COLORS.ink, fontWeight: expired ? 700 : 400 }}>
                  {fmtDate(d.licenseExpiryDate)}{expired && <ShieldAlert size={12} style={{ marginLeft: 4, display: "inline", verticalAlign: -2 }} />}
                </Td>
                <Td>{d.safetyScore}/100</Td>
                <Td><Badge status={d.status} /></Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export function DriverForm({ onClose, onSave }) {
  const [f, setF] = useState({ name: "", licenseNumber: "", licenseCategory: "LMV", licenseExpiryDate: daysFromNow(365), contactNumber: "", safetyScore: 80 });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); if (!f.name || !f.licenseNumber) return; onSave({ ...f, safetyScore: Number(f.safetyScore) }); onClose(); };
  return (
    <Modal title="Add Driver" onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <Field label="Full Name"><input style={inputStyle} value={f.name} onChange={set("name")} required /></Field>
        <Field label="License Number"><input style={inputStyle} value={f.licenseNumber} onChange={set("licenseNumber")} required /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Category">
            <select style={inputStyle} value={f.licenseCategory} onChange={set("licenseCategory")}>
              <option>LMV</option><option>HMV</option>
            </select>
          </Field>
          <Field label="License Expiry"><input type="date" style={inputStyle} value={f.licenseExpiryDate} onChange={set("licenseExpiryDate")} /></Field>
        </div>
        <Field label="Contact Number"><input style={inputStyle} value={f.contactNumber} onChange={set("contactNumber")} /></Field>
        <Field label="Safety Score (0–100)"><input type="number" min={0} max={100} style={inputStyle} value={f.safetyScore} onChange={set("safetyScore")} /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="amber" type="submit">Save Driver</Btn>
        </div>
      </form>
    </Modal>
  );
}
