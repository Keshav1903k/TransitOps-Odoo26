import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { COLORS, STATUS_STYLES, fmtDate, money } from "../theme";
import { SectionHead, Table, Th, Td, Badge, Btn, Modal, Field, inputStyle, Banner } from "../components/ui";

/* ------------------------------------------------------------------ */
/* Maintenance                                                          */
/* ------------------------------------------------------------------ */
export function MaintenancePage({ logs, vMap, onNew, onClose }) {
  return (
    <div>
      <SectionHead title="Maintenance Logs" subtitle="Opening a log pulls the vehicle out of the dispatch pool" action={<Btn variant="amber" icon={Plus} onClick={onNew}>Log Maintenance</Btn>} />
      <Table>
        <thead><tr><Th>Vehicle</Th><Th>Description</Th><Th>Cost</Th><Th>Opened</Th><Th>Closed</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
        <tbody>
          {logs.map(m => (
            <tr key={m.id}>
              <Td style={{ fontWeight: 600 }}>{vMap[m.vehicleId]?.name}</Td>
              <Td>{m.description}</Td>
              <Td>{money(m.cost)}</Td>
              <Td>{fmtDate(m.createdAt)}</Td>
              <Td>{fmtDate(m.closedAt)}</Td>
              <Td><Badge status={m.status} /></Td>
              <Td>{m.status === "OPEN" ? <Btn variant="teal" icon={Check} onClick={() => onClose(m.id)}>Close Log</Btn> : <span style={{ fontSize: 12, color: COLORS.slate }}>—</span>}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export function MaintenanceForm({ vehicles, onClose, onSave }) {
  const eligible = vehicles.filter(v => v.status !== "ON_TRIP");
  const [f, setF] = useState({ vehicleId: eligible[0]?.id || "", description: "", cost: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); if (!f.vehicleId || !f.description) { setErr("Vehicle and description are required."); return; } onSave(f.vehicleId, f.description, f.cost); };
  return (
    <Modal title="Log Maintenance" onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <Banner text={err} />
        <Field label="Vehicle">
          <select style={inputStyle} value={f.vehicleId} onChange={set("vehicleId")}>
            {eligible.length === 0 && <option value="">No eligible vehicles (all On Trip)</option>}
            {eligible.map(v => <option key={v.id} value={v.id}>{v.name} — {STATUS_STYLES[v.status].label}</option>)}
          </select>
        </Field>
        <Field label="Description"><input style={inputStyle} value={f.description} onChange={set("description")} placeholder="Brake pad replacement" required /></Field>
        <Field label="Cost (₹)"><input type="number" style={inputStyle} value={f.cost} onChange={set("cost")} required /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="amber" type="submit">Open Log</Btn>
        </div>
      </form>
    </Modal>
  );
}
