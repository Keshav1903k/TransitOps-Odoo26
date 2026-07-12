import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { addVehicle } from '@/actions/vehicleActions';
import { Truck, Plus, Filter, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface SearchParams {
  region?: string;
  status?: string;
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const role = session?.user?.role || 'FLEET_MANAGER';
  const isManager = role === 'FLEET_MANAGER';

  // Await the searchParams promise as per Next.js 14+ requirements
  const params = await searchParams;
  const regionFilter = params.region;
  const statusFilter = params.status;

  // Build filter query
  const where: any = {};
  if (regionFilter) where.region = regionFilter;
  if (statusFilter) where.status = statusFilter;

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Extract unique regions for filters
  const allVehiclesForRegions = await prisma.vehicle.findMany({ select: { region: true } });
  const uniqueRegions = Array.from(new Set(allVehiclesForRegions.map((v) => v.region))).filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Fleet Vehicles</h1>
          <p className="text-slate-400 text-sm mt-1">
            Register and monitor fleet assets, status, and locations.
          </p>
        </div>
      </div>

      {/* Main Grid: Add form (if Fleet Manager) + List Table */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Left Side: Add Vehicle Form (Span 1) */}
        <div className="xl:col-span-1 space-y-6">
          {isManager ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4 text-indigo-400" />
                Add New Vehicle
              </h2>
              <form
                action={async (formData) => {
                  'use server';
                  await addVehicle(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Registration Number
                  </label>
                  <input
                    name="registrationNumber"
                    required
                    placeholder="e.g. TX-1025"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Model/Name
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Ford Transit"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Vehicle Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Max Capacity (kg)
                  </label>
                  <input
                    name="maxLoadCapacity"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Odometer (km)
                  </label>
                  <input
                    name="odometer"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 12000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Acquisition Cost ($)
                  </label>
                  <input
                    name="acquisitionCost"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 35000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Operating Region
                  </label>
                  <input
                    name="region"
                    required
                    placeholder="e.g. North"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
                >
                  Create Asset
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-xl text-center">
              <ShieldAlert className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <h2 className="text-xs font-bold text-slate-300">Creator Lock</h2>
              <p className="text-[10px] text-slate-500 mt-1">
                Only the **Fleet Manager** can register new vehicles. Switch roles using the switcher in the sidebar to test.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Vehicle Table (Span 3) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Filters Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">Filters</span>
            </div>

            <div className="flex gap-3">
              <div>
                <select
                  value={regionFilter || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const url = new URL(window.location.href);
                    if (val) url.searchParams.set('region', val);
                    else url.searchParams.delete('region');
                    window.location.href = url.pathname + url.search;
                  }}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-850 outline-none text-slate-300 text-xs rounded-lg"
                >
                  <option value="">All Regions</option>
                  {uniqueRegions.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const url = new URL(window.location.href);
                    if (val) url.searchParams.set('status', val);
                    else url.searchParams.delete('status');
                    window.location.href = url.pathname + url.search;
                  }}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-850 outline-none text-slate-300 text-xs rounded-lg"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ON_TRIP">ON_TRIP</option>
                  <option value="IN_SHOP">IN_SHOP</option>
                  <option value="RETIRED">RETIRED</option>
                </select>
              </div>

              {(regionFilter || statusFilter) && (
                <Link
                  href="/vehicles"
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center font-semibold"
                >
                  Clear
                </Link>
              )}
            </div>
          </div>

          {/* Vehicle Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-[10px] uppercase font-mono font-bold text-slate-500 border-b border-slate-850">
                    <th className="px-6 py-4">Reg Number</th>
                    <th className="px-6 py-4">Vehicle Model</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Max Load</th>
                    <th className="px-6 py-4">Odometer</th>
                    <th className="px-6 py-4">Cost</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {vehicles.length > 0 ? (
                    vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-indigo-400">
                          {v.registrationNumber}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-200">{v.name}</td>
                        <td className="px-6 py-4 text-slate-400">{v.type}</td>
                        <td className="px-6 py-4 text-slate-300">{v.maxLoadCapacity} kg</td>
                        <td className="px-6 py-4 font-mono text-slate-300">
                          {v.odometer.toLocaleString()} km
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300">
                          ${v.acquisitionCost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              v.status === 'AVAILABLE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : v.status === 'ON_TRIP'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : v.status === 'IN_SHOP'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-400">{v.region}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        No vehicles registered matching active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
