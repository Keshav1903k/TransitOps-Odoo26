import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { createTrip } from '@/actions/stateTransitions';
import { TripTable } from '@/components/TripTable';
import { Plus, ShieldAlert } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function TripsPage() {
  const session = await auth();
  const role = session?.user?.role || 'DRIVER_OPS';
  const isDriverOps = role === 'DRIVER_OPS';

  // Fetch trips and assets for dropdowns
  const [trips, vehicles, drivers] = await Promise.all([
    prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vehicle.findMany({
      where: { NOT: { status: 'RETIRED' } },
    }),
    prisma.driver.findMany({
      where: { NOT: { status: 'SUSPENDED' } },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Trips &amp; Dispatch Board</h1>
        <p className="text-slate-400 text-sm mt-1">
          Draft cargo trips, monitor route dispatches, and log completion stats.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        {/* Left Side: Create Trip Form */}
        <div className="xl:col-span-1">
          {isDriverOps ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4 text-indigo-400" />
                Draft New Cargo Trip
              </h2>
              <form
                action={async (formData) => {
                  'use server';
                  const source = formData.get('source') as string;
                  const destination = formData.get('destination') as string;
                  const vehicleId = formData.get('vehicleId') as string;
                  const driverId = formData.get('driverId') as string;
                  const cargoWeight = Number(formData.get('cargoWeight'));
                  const plannedDistance = Number(formData.get('plannedDistance'));
                  const revenue = Number(formData.get('revenue') || 0.0);

                  await createTrip({
                    source,
                    destination,
                    vehicleId,
                    driverId,
                    cargoWeight,
                    plannedDistance,
                    revenue,
                  });
                  revalidatePath('/trips');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Source Terminal
                  </label>
                  <input
                    name="source"
                    required
                    placeholder="e.g. Chicago Port"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Destination Hub
                  </label>
                  <input
                    name="destination"
                    required
                    placeholder="e.g. Detroit Terminal"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Assign Vehicle
                  </label>
                  <select
                    name="vehicleId"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  >
                    <option value="">Choose vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.name} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Assign Operator
                  </label>
                  <select
                    name="driverId"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  >
                    <option value="">Choose driver...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Cargo Weight (kg)
                  </label>
                  <input
                    name="cargoWeight"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1200"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Planned Distance (km)
                  </label>
                  <input
                    name="plannedDistance"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 450"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Contract Revenue ($)
                  </label>
                  <input
                    name="revenue"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
                >
                  Create Draft
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-xl text-center">
              <ShieldAlert className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <h2 className="text-xs font-bold text-slate-300">Creator Lock</h2>
              <p className="text-[10px] text-slate-500 mt-1">
                Only the **Driver Ops** role can create or dispatch trips. Switch roles using the sidebar switcher to test.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Trips Table */}
        <div className="xl:col-span-3">
          <TripTable trips={trips} canModify={isDriverOps} />
        </div>
      </div>
    </div>
  );
}
