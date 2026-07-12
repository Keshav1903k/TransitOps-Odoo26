import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  Truck,
  Users,
  Route,
  Wrench,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role || 'FLEET_MANAGER';

  // 1. Fetch overall database metrics
  const [
    vehicleCounts,
    driverCounts,
    tripCounts,
    openMaintenanceCount,
    allCompletedTrips,
    allExpenses,
    allFuelLogs,
    expiredDrivers,
    lowSafetyDrivers,
  ] = await Promise.all([
    prisma.vehicle.groupBy({ by: ['status'], _count: true }),
    prisma.driver.groupBy({ by: ['status'], _count: true }),
    prisma.trip.groupBy({ by: ['status'], _count: true }),
    prisma.maintenanceLog.count({ where: { status: 'OPEN' } }),
    prisma.trip.findMany({ where: { status: 'COMPLETED' } }),
    prisma.expense.findMany(),
    prisma.fuelLog.findMany(),
    prisma.driver.findMany({ where: { licenseExpiryDate: { lt: new Date() } } }),
    prisma.driver.findMany({ where: { safetyScore: { lt: 70 } } }),
  ]);

  // Aggregate stats
  const totalVehicles = vehicleCounts.reduce((acc, curr) => acc + curr._count, 0);
  const activeVehicles = vehicleCounts.find((v) => v.status === 'ON_TRIP')?._count || 0;
  const inShopVehicles = vehicleCounts.find((v) => v.status === 'IN_SHOP')?._count || 0;

  const totalDrivers = driverCounts.reduce((acc, curr) => acc + curr._count, 0);
  const activeDrivers = driverCounts.find((d) => d.status === 'ON_TRIP')?._count || 0;

  const activeTrips = tripCounts.find((t) => t.status === 'DISPATCHED')?._count || 0;
  const draftTrips = tripCounts.find((t) => t.status === 'DRAFT')?._count || 0;

  // Financial aggregates
  const totalRevenue = allCompletedTrips.reduce((acc, t) => acc + t.revenue, 0);
  const expenseSum = allExpenses.reduce((acc, e) => acc + e.amount, 0);
  const fuelSum = allFuelLogs.reduce((acc, f) => acc + f.cost, 0);
  const totalCost = expenseSum + fuelSum;
  const profit = totalRevenue - totalCost;

  // Safety aggregates
  const safetyScores = await prisma.driver.findMany({ select: { safetyScore: true } });
  const avgSafetyScore =
    safetyScores.length > 0
      ? Math.round(safetyScores.reduce((acc, d) => acc + d.safetyScore, 0) / safetyScores.length)
      : 100;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Real-time status updates, logistics KPIs, and role-based action logs.
        </p>
      </div>

      {/* Grid Cards (Overall Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Truck className="h-24 w-24 text-indigo-500" />
          </div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Active Fleet</span>
          <h3 className="text-3xl font-extrabold text-white mt-1">{activeVehicles} / {totalVehicles}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
            {inShopVehicles} Vehicles in Maintenance
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="h-24 w-24 text-indigo-500" />
          </div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Active Drivers</span>
          <h3 className="text-3xl font-extrabold text-white mt-1">{activeDrivers} / {totalDrivers}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
            Avg Safety Score: {avgSafetyScore}/100
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Route className="h-24 w-24 text-indigo-500" />
          </div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Trips Status</span>
          <h3 className="text-3xl font-extrabold text-white mt-1">{activeTrips} Active</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block" />
            {draftTrips} Draft Trips Pending Dispatch
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="h-24 w-24 text-indigo-500" />
          </div>
          <span className="text-xs text-slate-500 uppercase font-semibold">Net Profit (Completed)</span>
          <h3 className={`text-3xl font-extrabold mt-1 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block" />
            Revenue: ${totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Role-Specific Widgets Panel */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="p-1.5 bg-indigo-600/10 text-indigo-400 rounded-lg">
            <Shield className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-bold text-white">
            Role Workspace: {role.replace('_', ' ')}
          </h2>
        </div>

        {/* 1. Fleet Manager Dashboard View */}
        {role === 'FLEET_MANAGER' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-4">Maintenance Overview</h3>
              <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-lg mb-4">
                <Wrench className="h-8 w-8 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">{openMaintenanceCount} Vehicles in Shop</h4>
                  <p className="text-xs text-slate-400">Open logs block vehicles from participating in trips.</p>
                </div>
              </div>
              <Link
                href="/maintenance"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                Go to Maintenance Console <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-4">Fleet Status Breakdown</h3>
              <div className="space-y-3">
                {['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'].map((status) => {
                  const count = vehicleCounts.find((v) => v.status === status)?._count || 0;
                  const percent = totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400 font-mono">{status}</span>
                        <span className="text-slate-200">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status === 'AVAILABLE'
                              ? 'bg-emerald-500'
                              : status === 'ON_TRIP'
                              ? 'bg-blue-500'
                              : status === 'IN_SHOP'
                              ? 'bg-amber-500'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. Driver Ops Dashboard View */}
        {role === 'DRIVER_OPS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-4">Logistics Shortcuts</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/trips"
                  className="bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-4 rounded-lg text-center transition-colors group"
                >
                  <Route className="h-6 w-6 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-semibold text-white">Create/Dispatch Trips</span>
                  <span className="text-[10px] text-slate-500">{draftTrips} Drafts pending</span>
                </Link>

                <Link
                  href="/drivers"
                  className="bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-4 rounded-lg text-center transition-colors group"
                >
                  <Users className="h-6 w-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="block text-xs font-semibold text-white">Manage Driver Statuses</span>
                  <span className="text-[10px] text-slate-500">{totalDrivers} Drivers registered</span>
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Driver Status Summary</h3>
                <p className="text-xs text-slate-400 mb-4">Assign available drivers and vehicles to trips.</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'].map((status) => {
                    const count = driverCounts.find((d) => d.status === status)?._count || 0;
                    return (
                      <div key={status} className="bg-slate-950/30 p-2.5 border border-slate-800 rounded-lg">
                        <span className="block text-[10px] text-slate-500 uppercase font-mono font-bold">
                          {status.replace('_', ' ')}
                        </span>
                        <span className="text-lg font-bold text-white">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Safety Officer Dashboard View */}
        {role === 'SAFETY_OFFICER' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-4">Compliance Alerts</h3>
              <div className="space-y-3">
                {expiredDrivers.length > 0 ? (
                  <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-lg">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">{expiredDrivers.length} Expired Licenses Found</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        These drivers are blocked from starting new dispatches.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    All drivers have valid licenses.
                  </div>
                )}

                {lowSafetyDrivers.length > 0 ? (
                  <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-lg">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">{lowSafetyDrivers.length} Low Safety Scores (&lt; 70)</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Drivers need review and safety training.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    No driver safety score warnings.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Driver safety profiles</h3>
                <p className="text-xs text-slate-400 mb-4">View metrics and expired credentials on the Drivers board.</p>
              </div>
              <Link
                href="/drivers"
                className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-center py-2.5 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Inspect Safety Ledger
              </Link>
            </div>
          </div>
        )}

        {/* 4. Financial Analyst Dashboard View */}
        {role === 'FINANCIAL_ANALYST' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-4">Operating Cost Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Fuel Costs:</span>
                  <span className="font-mono text-slate-200 font-bold">${fuelSum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Tolls &amp; Misc Expenses:</span>
                  <span className="font-mono text-slate-200 font-bold">${expenseSum.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-200">Total Expenditures:</span>
                  <span className="font-mono text-indigo-400">${totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Report Compilation</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Compile cost and revenue logs into Excel/CSV. Add transactions on the Finance board.
                </p>
              </div>
              <Link
                href="/finance"
                className="bg-indigo-600 hover:bg-indigo-500 text-center py-2.5 rounded-lg text-xs font-bold text-white transition-colors"
              >
                Open Analytics &amp; CSV Panel
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
