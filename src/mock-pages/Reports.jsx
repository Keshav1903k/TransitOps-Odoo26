import React from "react";
import { Download, CircleDollarSign } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { COLORS, money } from "../theme";
import { SectionHead, Card, Table, Th, Td, Btn } from "../components/ui";

/* ------------------------------------------------------------------ */
/* Reports                                                              */
/* ------------------------------------------------------------------ */
export function ReportsPage({ finance, onExport }) {
  const effData = finance.filter(v => v.fuelEfficiency).map(v => ({ name: v.name, "km/L": v.fuelEfficiency }));
  return (
    <div>
      <SectionHead title="Reports & Analytics" subtitle="Fuel efficiency, cost and ROI per vehicle" action={<Btn variant="amber" icon={Download} onClick={onExport}>Export Trips CSV</Btn>} />

      <Card style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700 }}>Fuel efficiency (km per liter)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={effData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="km/L" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Table>
        <thead><tr><Th>Vehicle</Th><Th>Revenue</Th><Th>Fuel Cost</Th><Th>Maint. Cost</Th><Th>Op. Cost</Th><Th>Acq. Cost</Th><Th>ROI</Th></tr></thead>
        <tbody>
          {finance.map(v => (
            <tr key={v.id}>
              <Td style={{ fontWeight: 600 }}>{v.name}</Td>
              <Td>{money(v.revenue)}</Td>
              <Td>{money(v.fuelCost)}</Td>
              <Td>{money(v.maintCost)}</Td>
              <Td>{money(v.opCost)}</Td>
              <Td>{money(v.acquisitionCost)}</Td>
              <Td style={{ fontWeight: 700, color: v.roi >= 0 ? COLORS.green : COLORS.red }}>
                {(v.roi * 100).toFixed(1)}%
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p style={{ fontSize: 11.5, color: COLORS.slate, marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
        <CircleDollarSign size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        ROI = (Σ revenue of completed trips − (Σ fuel cost + Σ maintenance cost)) ÷ acquisition cost. Revenue is entered per trip at creation, per the spec's ambiguity resolution.
      </p>
    </div>
  );
}
