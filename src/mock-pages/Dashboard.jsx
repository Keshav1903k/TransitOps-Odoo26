import React from "react";
import { Truck, Check, Wrench, MapPin, Package, Users, Gauge } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart, Pie, Cell
} from "recharts";
import { COLORS, STATUS_STYLES } from "../theme";
import { SectionHead, Card, KPI } from "../components/ui";

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */
export function DashboardPage({ metrics, vehicles, finance }) {
  const statusData = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"].map(s => ({ name: STATUS_STYLES[s].label, value: vehicles.filter(v => v.status === s).length, fill: STATUS_STYLES[s].c }));
  const costData = finance.filter(v => v.opCost > 0).map(v => ({ name: v.name, Fuel: v.fuelCost, Maintenance: v.maintCost }));

  return (
    <div>
      <SectionHead title="Fleet Dashboard" subtitle="Live snapshot across the entire operation" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        <KPI label="Active Vehicles" value={metrics.active.length} icon={Truck} />
        <KPI label="Available" value={metrics.available.length} icon={Check} accent={COLORS.green} />
        <KPI label="In Maintenance" value={metrics.inShop.length} icon={Wrench} accent={COLORS.amberDeep} />
        <KPI label="Active Trips" value={metrics.activeTrips.length} icon={MapPin} accent={COLORS.teal} />
        <KPI label="Pending Trips" value={metrics.pendingTrips.length} icon={Package} />
        <KPI label="Drivers On Duty" value={metrics.onDuty.length} icon={Users} />
        <KPI label="Fleet Utilization" value={`${metrics.utilization}%`} icon={Gauge} accent={COLORS.teal} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Fleet status breakdown</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={3}>
                {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Operational cost by vehicle</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Fuel" stackId="a" fill={COLORS.amber} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Maintenance" stackId="a" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
