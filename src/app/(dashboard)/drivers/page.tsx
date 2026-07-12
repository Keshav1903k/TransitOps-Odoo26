import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { addDriver, updateDriverSafetyScore, updateDriverStatus } from '@/actions/driverActions';
import { Users, ShieldAlert, AlertTriangle, Search } from 'lucide-react';
import Link from 'next/link';

interface SearchParams {
  status?: string;
  filter?: string;
}

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const role = session?.user?.role || 'FLEET_MANAGER';
  const isSafetyOfficer = role === 'SAFETY_OFFICER';
  const isDriverOps = role === 'DRIVER_OPS';
  const canModify = isSafetyOfficer || isDriverOps;

  const params = await searchParams;
  const statusFilter = params.status;
  const complianceFilter = params.filter;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build filter query
  const where: any = {};
  if (statusFilter) where.status = statusFilter;

  if (complianceFilter === 'expired') {
    where.licenseExpiryDate = { lt: today };
  } else if (complianceFilter === 'low_safety') {
    where.safetyScore = { lt: 70 };
  }

  const drivers = await prisma.driver.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Driver Profiles &amp; Compliance</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor safety performance, license validity, and status configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Left column: Add driver (Driver Ops / Fleet Manager) or safety widget */}
        <div className="xl:col-span-1 space-y-6">
          {canModify ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-indigo-400" />
                Register New Driver
              </h2>
              <form
                action={async (formData) => {
                  'use server';
                  await addDriver(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Driver Name
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Samuel L. Jackson"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    License Number
                  </label>
                  <input
                    name="licenseNumber"
                    required
                    placeholder="e.g. DL-192837"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    License Class
                  </label>
                  <input
                    name="licenseCategory"
                    required
                    placeholder="e.g. Class A Commercial"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    License Expiry Date
                  </label>
                  <input
                    name="licenseExpiryDate"
                    type="date"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    name="contactNumber"
                    required
                    placeholder="e.g. +1 555-0199"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
                >
                  Register Operator
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-xl text-center">
              <ShieldAlert className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <h2 className="text-xs font-bold text-slate-300">Operations Lock</h2>
              <p className="text-[10px] text-slate-500 mt-1">
                Only the **Safety Officer** or **Driver Ops** roles can add drivers or update safety statuses.
              </p>
            </div>
          )}

          {/* Quick Stats Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-white">Compliance Overview</h3>
            <div className="space-y-2">
              <Link
                href="/drivers?filter=expired"
                className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  complianceFilter === 'expired'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Expired Licenses
                </div>
              </Link>

              <Link
                href="/drivers?filter=low_safety"
                className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  complianceFilter === 'low_safety'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Low Safety (&lt; 70)
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right column: Drivers List */}
        <div className="xl:col-span-3 space-y-4">
          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">Filters</span>
            </div>

            <div className="flex gap-3">
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
                  <option value="OFF_DUTY">OFF_DUTY</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              {(statusFilter || complianceFilter) && (
                <Link
                  href="/drivers"
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center font-semibold"
                >
                  Clear Filters
                </Link>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-[10px] uppercase font-mono font-bold text-slate-500 border-b border-slate-850">
                    <th className="px-6 py-4">Operator Name</th>
                    <th className="px-6 py-4">License Number</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Expiration Date</th>
                    <th className="px-6 py-4">Safety Score</th>
                    <th className="px-6 py-4">Status</th>
                    {canModify && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs">
                  {drivers.length > 0 ? (
                    drivers.map((d) => {
                      const isExpired = new Date(d.licenseExpiryDate) < today;
                      const hasLowSafety = d.safetyScore < 70;
                      return (
                        <tr key={d.id} className="hover:bg-slate-850/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-200">{d.name}</td>
                          <td className="px-6 py-4 font-mono text-slate-400">{d.licenseNumber}</td>
                          <td className="px-6 py-4 text-slate-400">{d.licenseCategory}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-semibold flex items-center gap-1.5 ${
                                isExpired ? 'text-rose-400' : 'text-slate-300'
                              }`}
                            >
                              {new Date(d.licenseExpiryDate).toLocaleDateString()}
                              {isExpired && <AlertTriangle className="h-3.5 w-3.5" />}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                hasLowSafety
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : d.safetyScore < 85
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {d.safetyScore} / 100
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                d.status === 'AVAILABLE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : d.status === 'ON_TRIP'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : d.status === 'OFF_DUTY'
                                  ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          {canModify && (
                            <td className="px-6 py-4 text-right space-y-2 lg:space-y-0 lg:space-x-2">
                              {/* Safety Score updates */}
                              {isSafetyOfficer && (
                                <form
                                  action={async (formData) => {
                                    'use server';
                                    const score = Number(formData.get('safetyScore'));
                                    await updateDriverSafetyScore(d.id, score);
                                  }}
                                  className="inline-flex gap-1 items-center"
                                >
                                  <input
                                    name="safetyScore"
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={d.safetyScore}
                                    className="w-12 px-1 bg-slate-950 border border-slate-800 text-center text-xs rounded text-white"
                                  />
                                  <button
                                    type="submit"
                                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded text-[10px] font-semibold font-mono"
                                  >
                                    Score
                                  </button>
                                </form>
                              )}

                              {/* Status toggles */}
                              {d.status !== 'ON_TRIP' && (
                                <div className="inline-flex gap-1.5">
                                  {d.status === 'SUSPENDED' ? (
                                    <form
                                      action={async () => {
                                        'use server';
                                        await updateDriverStatus(d.id, 'AVAILABLE');
                                      }}
                                    >
                                      <button className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold">
                                        Reactivate
                                      </button>
                                    </form>
                                  ) : (
                                    <>
                                      <form
                                        action={async () => {
                                          'use server';
                                          await updateDriverStatus(
                                            d.id,
                                            d.status === 'AVAILABLE' ? 'OFF_DUTY' : 'AVAILABLE'
                                          );
                                        }}
                                      >
                                        <button className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold">
                                          {d.status === 'AVAILABLE' ? 'Off Duty' : 'Go Available'}
                                        </button>
                                      </form>

                                      <form
                                        action={async () => {
                                          'use server';
                                          await updateDriverStatus(d.id, 'SUSPENDED');
                                        }}
                                      >
                                        <button className="px-2 py-0.5 bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 rounded text-[10px] font-semibold">
                                          Suspend
                                        </button>
                                      </form>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No drivers registered matching active filters.
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
