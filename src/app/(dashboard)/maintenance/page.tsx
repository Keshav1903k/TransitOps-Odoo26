import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { createMaintenanceLog, closeMaintenanceLog } from '@/actions/stateTransitions';
import { Wrench, Plus, CheckCircle, ShieldAlert, Archive, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function MaintenancePage() {
  const session = await auth();
  const role = session?.user?.role || 'FLEET_MANAGER';
  const isManager = role === 'FLEET_MANAGER';

  // Fetch logs and vehicles
  const [logs, vehicles] = await Promise.all([
    prisma.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vehicle.findMany({
      where: { NOT: { status: 'RETIRED' } },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Maintenance Logs</h1>
        <p className="text-slate-400 text-sm mt-1">
          Open repair tickets, budget diagnostics, and release assets to the active fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Left Side: Create Ticket (Fleet Manager only) */}
        <div className="xl:col-span-1">
          {isManager ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4 text-indigo-400" />
                Open Repair Ticket
              </h2>
              <form
                action={async (formData) => {
                  'use server';
                  const vehicleId = formData.get('vehicleId') as string;
                  const description = formData.get('description') as string;
                  const cost = Number(formData.get('cost'));
                  await createMaintenanceLog(vehicleId, description, cost);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Select Vehicle
                  </label>
                  <select
                    name="vehicleId"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  >
                    <option value="">Choose vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id} disabled={v.status === 'ON_TRIP'}>
                        {v.registrationNumber} - {v.name} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Description of Issue
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    placeholder="e.g. Brake pad replacements & fluid inspection"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    name="cost"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 350"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
                >
                  File Ticket
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-xl text-center">
              <ShieldAlert className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <h2 className="text-xs font-bold text-slate-300">Creator Lock</h2>
              <p className="text-[10px] text-slate-500 mt-1">
                Only the **Fleet Manager** can open or close maintenance tickets.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Maintenance Log Table */}
        <div className="xl:col-span-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-[10px] uppercase font-mono font-bold text-slate-500 border-b border-slate-850">
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Cost</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Filed Date</th>
                    <th className="px-6 py-4">Completion Date</th>
                    {isManager && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-200 block">
                            {log.vehicle.name}
                          </span>
                          <span className="font-mono text-[10px] text-indigo-400">
                            {log.vehicle.registrationNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={log.description}>
                          {log.description}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-200 font-semibold">
                          ${log.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                              log.status === 'OPEN'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {log.status === 'OPEN' ? (
                              <>
                                <Clock className="h-3 w-3" />
                                OPEN
                              </>
                            ) : (
                              <>
                                <Archive className="h-3 w-3" />
                                CLOSED
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {log.closedAt ? new Date(log.closedAt).toLocaleDateString() : '-'}
                        </td>
                        {isManager && (
                          <td className="px-6 py-4 text-right">
                            {log.status === 'OPEN' && (
                              <form
                                action={async () => {
                                  'use server';
                                  await closeMaintenanceLog(log.id);
                                }}
                              >
                                <button
                                  type="submit"
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Close Ticket
                                </button>
                              </form>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No maintenance tickets filed.
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
