import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { addFuelLog, addExpense } from '@/actions/financeActions';
import { FinancialCharts } from '@/components/FinancialCharts';
import { CsvExporter } from '@/components/CsvExporter';
import { DollarSign, Fuel, Plus, ShieldAlert, FileText } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function FinancePage() {
  const session = await auth();
  const role = session?.user?.role || 'FINANCIAL_ANALYST';
  const isFinance = role === 'FINANCIAL_ANALYST';

  // Fetch all tables for reporting & exports
  const [
    vehicles,
    drivers,
    trips,
    maintenanceLogs,
    expenses,
    fuelLogs,
  ] = await Promise.all([
    prisma.vehicle.findMany(),
    prisma.driver.findMany(),
    prisma.trip.findMany({ include: { vehicle: true } }),
    prisma.maintenanceLog.findMany(),
    prisma.expense.findMany(),
    prisma.fuelLog.findMany(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Financials &amp; Reports</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor operating expenses, log asset costs, and compile full system audits.
        </p>
      </div>

      {/* CSV Export Panel */}
      <CsvExporter
        vehicles={vehicles}
        drivers={drivers}
        trips={trips}
        maintenanceLogs={maintenanceLogs}
        expenses={expenses}
        fuelLogs={fuelLogs}
      />

      {/* Financial Charts */}
      <FinancialCharts
        vehicles={vehicles}
        trips={trips}
        expenses={expenses}
        fuelLogs={fuelLogs}
      />

      {/* Transaction Logging Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fuel Log Refills (Financial Analyst only) */}
        <div>
          {isFinance ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Fuel className="h-4.5 w-4.5 text-indigo-400" />
                Log Fuel Purchase
              </h2>
              <form
                action={async (formData) => {
                  'use server';
                  await addFuelLog(formData);
                  revalidatePath('/finance');
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
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Liters Refilled
                    </label>
                    <input
                      name="liters"
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 85.5"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Total Cost ($)
                    </label>
                    <input
                      name="cost"
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 128.25"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Purchase Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
                >
                  Record Fuel Receipt
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl text-center">
              <ShieldAlert className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <h2 className="text-xs font-bold text-slate-300">Creator Lock</h2>
              <p className="text-[10px] text-slate-500 mt-1">
                Only the **Financial Analyst** role can log new fuel purchases.
              </p>
            </div>
          )}
        </div>

        {/* Expenses (Financial Analyst only) */}
        <div>
          {isFinance ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <DollarSign className="h-4.5 w-4.5 text-indigo-400" />
                Log General Expense
              </h2>
              <form
                action={async (formData) => {
                  'use server';
                  await addExpense(formData);
                  revalidatePath('/finance');
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
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Expense Type
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                    >
                      <option value="Toll">Toll Fee</option>
                      <option value="Permit">Route Permit</option>
                      <option value="Tires">Tire Replacement</option>
                      <option value="Misc">Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Amount ($)
                    </label>
                    <input
                      name="amount"
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 45.00"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                    Receipt Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-slate-200 text-xs rounded-lg transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
                >
                  Record Expense
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl text-center">
              <ShieldAlert className="h-8 w-8 text-slate-500 mx-auto mb-3" />
              <h2 className="text-xs font-bold text-slate-300">Creator Lock</h2>
              <p className="text-[10px] text-slate-500 mt-1">
                Only the **Financial Analyst** role can log new expenses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
