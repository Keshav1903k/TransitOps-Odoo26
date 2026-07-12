'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface FinancialChartsProps {
  vehicles: any[];
  trips: any[];
  expenses: any[];
  fuelLogs: any[];
}

export function FinancialCharts({
  vehicles,
  trips,
  expenses,
  fuelLogs,
}: FinancialChartsProps) {
  // 1. Fleet Utilization Data (Vehicles by type: Total vs Active)
  const utilizationMap: { [key: string]: { type: string; Total: number; Active: number } } = {};
  vehicles.forEach((v) => {
    if (!utilizationMap[v.type]) {
      utilizationMap[v.type] = { type: v.type, Total: 0, Active: 0 };
    }
    utilizationMap[v.type].Total += 1;
    if (v.status === 'ON_TRIP') {
      utilizationMap[v.type].Active += 1;
    }
  });
  const utilizationData = Object.values(utilizationMap);

  // 2. Fuel Efficiency Data (Completed trips: average km / L per vehicle name)
  const completedTrips = trips.filter(
    (t) => t.status === 'COMPLETED' && t.actualDistance && t.fuelConsumed
  );
  const efficiencyMap: { [key: string]: { name: string; sumDistance: number; sumFuel: number; count: number } } = {};
  completedTrips.forEach((t) => {
    const key = t.vehicle.name;
    if (!efficiencyMap[key]) {
      efficiencyMap[key] = { name: key, sumDistance: 0, sumFuel: 0, count: 0 };
    }
    efficiencyMap[key].sumDistance += t.actualDistance;
    efficiencyMap[key].sumFuel += t.fuelConsumed;
    efficiencyMap[key].count += 1;
  });
  const efficiencyData = Object.values(efficiencyMap).map((e) => ({
    name: e.name,
    'Efficiency (km/L)': parseFloat((e.sumDistance / e.sumFuel).toFixed(2)),
  }));

  // 3. Cost Trends Data (Group expenses + fuel logs by Date)
  const costMap: { [key: string]: { date: string; Fuel: number; Miscellaneous: number } } = {};
  fuelLogs.forEach((f) => {
    const dStr = new Date(f.date).toISOString().split('T')[0];
    if (!costMap[dStr]) {
      costMap[dStr] = { date: dStr, Fuel: 0, Miscellaneous: 0 };
    }
    costMap[dStr].Fuel += f.cost;
  });
  expenses.forEach((e) => {
    const dStr = new Date(e.date).toISOString().split('T')[0];
    if (!costMap[dStr]) {
      costMap[dStr] = { date: dStr, Fuel: 0, Miscellaneous: 0 };
    }
    costMap[dStr].Miscellaneous += e.amount;
  });
  const costData = Object.values(costMap).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 4. Vehicle Status Pie Data
  const statusCounts: { [key: string]: number } = { AVAILABLE: 0, ON_TRIP: 0, IN_SHOP: 0, RETIRED: 0 };
  vehicles.forEach((v) => {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
  });
  const pieData = Object.keys(statusCounts).map((key) => ({
    name: key,
    value: statusCounts[key],
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#64748b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Cost Trends Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Chronological Cost Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMisc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="Fuel"
                stackId="1"
                stroke="#4f46e5"
                fillOpacity={1}
                fill="url(#colorFuel)"
              />
              <Area
                type="monotone"
                dataKey="Miscellaneous"
                stackId="1"
                stroke="#ec4899"
                fillOpacity={1}
                fill="url(#colorMisc)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fuel Efficiency Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Average Fuel Efficiency by Model</h3>
        <div className="h-64">
          {efficiencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="Efficiency (km/L)" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No completed trips with distance &amp; fuel data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Fleet Utilization Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Fleet Utilization by Type</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="type" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Total" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Status Breakdown Pie */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Asset Status Allocations</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-400 font-semibold">{item.name}:</span>
                <span className="text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
