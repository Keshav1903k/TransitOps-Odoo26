'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from '@/actions/stateTransitions';
import {
  Route,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Navigation,
  Fuel,
  Info,
} from 'lucide-react';

interface Vehicle {
  registrationNumber: string;
  name: string;
}

interface Driver {
  name: string;
}

interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  vehicle: Vehicle;
  driverId: string;
  driver: Driver;
  cargoWeight: number;
  plannedDistance: number;
  actualDistance: number | null;
  fuelConsumed: number | null;
  revenue: number;
  status: string;
  dispatchedAt: Date | null;
  completedAt: Date | null;
}

export function TripTable({ trips, canModify }: { trips: any[]; canModify: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Keep track of which trip is being completed (holds inline form inputs)
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const [actualDistance, setActualDistance] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleDispatch = async (tripId: string) => {
    clearMessages();
    startTransition(async () => {
      try {
        await dispatchTrip(tripId);
        setSuccessMsg('Trip dispatched successfully!');
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to dispatch trip.');
      }
    });
  };

  const handleCancel = async (tripId: string) => {
    clearMessages();
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    startTransition(async () => {
      try {
        await cancelTrip(tripId);
        setSuccessMsg('Trip cancelled successfully!');
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to cancel trip.');
      }
    });
  };

  const handleComplete = async (tripId: string) => {
    clearMessages();
    const distanceVal = parseFloat(actualDistance);
    const fuelVal = parseFloat(fuelConsumed);

    if (isNaN(distanceVal) || distanceVal <= 0) {
      setErrorMsg('Actual distance must be a positive number.');
      return;
    }
    if (isNaN(fuelVal) || fuelVal <= 0) {
      setErrorMsg('Fuel consumed must be a positive number.');
      return;
    }

    startTransition(async () => {
      try {
        await completeTrip(tripId, distanceVal, fuelVal);
        setSuccessMsg('Trip completed successfully!');
        setCompletingTripId(null);
        setActualDistance('');
        setFuelConsumed('');
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to complete trip.');
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Alerts */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2.5 shadow-lg shadow-rose-950/20">
          <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Guard Rule Violation</h4>
            <p className="mt-0.5 font-medium">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2.5">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-[10px] uppercase font-mono font-bold text-slate-500 border-b border-slate-850">
                <th className="px-6 py-4">Source &amp; Destination</th>
                <th className="px-6 py-4">Assigned Vehicle</th>
                <th className="px-6 py-4">Assigned Driver</th>
                <th className="px-6 py-4">Cargo &amp; Distance</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Status</th>
                {canModify && <th className="px-6 py-4 text-center">Dispatch Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {trips.length > 0 ? (
                trips.map((t: Trip) => (
                  <tr key={t.id} className="hover:bg-slate-850/40 transition-colors">
                    {/* Source / Destination */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-200 block">{t.source}</span>
                      <span className="text-slate-400 text-[10px] flex items-center gap-1 mt-0.5">
                        <Route className="h-3 w-3 text-slate-500" />
                        {t.destination}
                      </span>
                    </td>

                    {/* Assigned Vehicle */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-300 block">{t.vehicle.name}</span>
                      <span className="text-[10px] font-mono text-indigo-400">
                        {t.vehicle.registrationNumber}
                      </span>
                    </td>

                    {/* Assigned Driver */}
                    <td className="px-6 py-4 font-semibold text-slate-300">
                      {t.driver.name}
                    </td>

                    {/* Cargo / Distance */}
                    <td className="px-6 py-4">
                      <div className="text-slate-300">Cargo: <span className="font-semibold">{t.cargoWeight} kg</span></div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Planned Dist: <span className="font-semibold">{t.plannedDistance} km</span>
                      </div>
                      {t.actualDistance && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          Actual Dist: <span className="font-semibold">{t.actualDistance} km</span>
                        </div>
                      )}
                    </td>

                    {/* Revenue */}
                    <td className="px-6 py-4 font-mono text-slate-200 font-bold">
                      ${t.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                          t.status === 'DRAFT'
                            ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                            : t.status === 'DISPATCHED'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : t.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {t.status === 'DRAFT' && <Clock className="h-3 w-3" />}
                        {t.status === 'DISPATCHED' && <Navigation className="h-3 w-3" />}
                        {t.status === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
                        {t.status === 'CANCELLED' && <XCircle className="h-3 w-3" />}
                        {t.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {canModify && (
                      <td className="px-6 py-4 text-center">
                        {t.status === 'DRAFT' && (
                          <div className="inline-flex gap-2 justify-center">
                            <button
                              onClick={() => handleDispatch(t.id)}
                              disabled={isPending}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px] flex items-center gap-1 transition-colors"
                            >
                              <Play className="h-3 w-3" />
                              Dispatch
                            </button>
                            <button
                              onClick={() => handleCancel(t.id)}
                              disabled={isPending}
                              className="px-2.5 py-1 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400 rounded text-[10px] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {t.status === 'DISPATCHED' && (
                          <div className="flex flex-col gap-2 items-center justify-center">
                            {completingTripId === t.id ? (
                              <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg space-y-2 text-left w-48 shadow-lg">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  Trip Completion Details
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">
                                    Actual Dist (km)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="e.g. 452"
                                    value={actualDistance}
                                    onChange={(e) => setActualDistance(e.target.value)}
                                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 outline-none text-white text-[11px] rounded"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">
                                    Fuel Consumed (L)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="e.g. 58"
                                    value={fuelConsumed}
                                    onChange={(e) => setFuelConsumed(e.target.value)}
                                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 outline-none text-white text-[11px] rounded"
                                  />
                                </div>
                                <div className="flex gap-1.5 pt-1">
                                  <button
                                    onClick={() => handleComplete(t.id)}
                                    disabled={isPending}
                                    className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px]"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCompletingTripId(null);
                                      clearMessages();
                                    }}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => {
                                    clearMessages();
                                    setCompletingTripId(t.id);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] flex items-center gap-1 transition-colors"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleCancel(t.id)}
                                  disabled={isPending}
                                  className="px-2.5 py-1 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400 rounded text-[10px] transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {t.status === 'COMPLETED' && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            Dispatched: {t.dispatchedAt ? new Date(t.dispatchedAt).toLocaleDateString() : '-'}<br />
                            Completed: {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '-'}
                          </div>
                        )}

                        {t.status === 'CANCELLED' && (
                          <span className="text-[10px] text-slate-600 font-semibold uppercase">
                            Archived
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No trips recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
