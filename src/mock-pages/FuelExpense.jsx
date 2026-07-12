import React, { useState } from "react";
import { Plus } from "lucide-react";
import { fmtDate, money, daysFromNow } from "../theme";
import { SectionHead, Table, Th, Td, Btn, Modal, Field, inputStyle } from "../components/ui";

/* ------------------------------------------------------------------ */
/* Fuel & Expense                                                       */
/* ------------------------------------------------------------------ */
export function FuelExpensePage({ fuel, expense, vMap, onAddFuel, onAddExpense }) {
  return (
    <div>
      <SectionHead title="Fuel & Expense Logs" subtitle="Per-vehicle running costs" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Fuel Log</h4>
            <Btn variant="ghost" icon={Plus} onClick={onAddFuel}>Add</Btn>
          </div>
          <Table>
            <thead><tr><Th>Vehicle</Th><Th>Liters</Th><Th>Cost</Th><Th>Date</Th></tr></thead>
            <tbody>{fuel.map(f => (
              <tr key={f.id}><Td style={{ fontWeight: 600 }}>{vMap[f.vehicleId]?.name}</Td><Td>{f.liters} L</Td><Td>{money(f.cost)}</Td><Td>{fmtDate(f.date)}</Td></tr>
            ))}</tbody>
          </Table>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Expense Log</h4>
            <Btn variant="ghost" icon={Plus} onClick={onAddExpense}>Add</Btn>
          </div>
          <Table>
            <thead><tr><Th>Vehicle</Th><Th>Type</Th><Th>Amount</Th><Th>Date</Th></tr></thead>
            <tbody>{expense.map(e => (
              <tr key={e.id}><Td style={{ fontWeight: 600 }}>{vMap[e.vehicleId]?.name}</Td><Td>{e.type}</Td><Td>{money(e.amount)}</Td><Td>{fmtDate(e.date)}</Td></tr>
            ))}</tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export function FuelForm({ vehicles, onClose, onSave }) {
  const [f, setF] = useState({ vehicleId: vehicles[0]?.id || "", liters: "", cost: "", date: daysFromNow(0) });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); if (!f.liters || !f.cost) return; onSave(f); onClose(); };
  return (
    <Modal title="Add Fuel Log" onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <Field label="Vehicle"><select style={inputStyle} value={f.vehicleId} onChange={set("vehicleId")}>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Liters"><input type="number" style={inputStyle} value={f.liters} onChange={set("liters")} required /></Field>
          <Field label="Cost (₹)"><input type="number" style={inputStyle} value={f.cost} onChange={set("cost")} required /></Field>
        </div>
        <Field label="Date"><input type="date" style={inputStyle} value={f.date} onChange={set("date")} /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="amber" type="submit">Save</Btn>
        </div>
      </form>
    </Modal>
  );
}

export function ExpenseForm({ vehicles, onClose, onSave }) {
  const [f, setF] = useState({ vehicleId: vehicles[0]?.id || "", type: "Toll", amount: "", date: daysFromNow(0) });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); if (!f.amount) return; onSave(f); onClose(); };
  return (
    <Modal title="Add Expense" onClose={onClose}>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <Field label="Vehicle"><select style={inputStyle} value={f.vehicleId} onChange={set("vehicleId")}>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
        <Field label="Type">
          <select style={inputStyle} value={f.type} onChange={set("type")}><option>Toll</option><option>Misc</option><option>Parking</option><option>Fine</option></select>
        </Field>
        <Field label="Amount (₹)"><input type="number" style={inputStyle} value={f.amount} onChange={set("amount")} required /></Field>
        <Field label="Date"><input type="date" style={inputStyle} value={f.date} onChange={set("date")} /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="amber" type="submit">Save</Btn>
        </div>
      </form>
    </Modal>
  );
}
