'use client';

import { Download } from 'lucide-react';

interface CsvExporterProps {
  vehicles: any[];
  drivers: any[];
  trips: any[];
  maintenanceLogs: any[];
  expenses: any[];
  fuelLogs: any[];
}

export function CsvExporter({
  vehicles,
  drivers,
  trips,
  maintenanceLogs,
  expenses,
  fuelLogs,
}: CsvExporterProps) {
  const downloadCsv = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((val) => {
            const str = val === null || val === undefined ? '' : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportVehicles = () => {
    const headers = ['ID', 'Reg Number', 'Model Name', 'Type', 'Max Load (kg)', 'Odometer (km)', 'Acquisition Cost ($)', 'Status', 'Region', 'Created At'];
    const rows = vehicles.map((v) => [
      v.id,
      v.registrationNumber,
      v.name,
      v.type,
      v.maxLoadCapacity,
      v.odometer,
      v.acquisitionCost,
      v.status,
      v.region,
      v.createdAt,
    ]);
    downloadCsv(headers, rows, 'transitops_vehicles.csv');
  };

  const exportDrivers = () => {
    const headers = ['ID', 'Name', 'License Number', 'License Class', 'Expiry Date', 'Phone', 'Safety Score', 'Status', 'Created At'];
    const rows = drivers.map((d) => [
      d.id,
      d.name,
      d.licenseNumber,
      d.licenseCategory,
      d.licenseExpiryDate,
      d.contactNumber,
      d.safetyScore,
      d.status,
      d.createdAt,
    ]);
    downloadCsv(headers, rows, 'transitops_drivers.csv');
  };

  const exportTrips = () => {
    const headers = ['ID', 'Source', 'Destination', 'Vehicle ID', 'Driver ID', 'Cargo Weight (kg)', 'Planned Distance (km)', 'Actual Distance (km)', 'Fuel Consumed (L)', 'Revenue ($)', 'Status', 'Dispatched At', 'Completed At', 'Created At'];
    const rows = trips.map((t) => [
      t.id,
      t.source,
      t.destination,
      t.vehicleId,
      t.driverId,
      t.cargoWeight,
      t.plannedDistance,
      t.actualDistance || '',
      t.fuelConsumed || '',
      t.revenue,
      t.status,
      t.dispatchedAt || '',
      t.completedAt || '',
      t.createdAt,
    ]);
    downloadCsv(headers, rows, 'transitops_trips.csv');
  };

  const exportMaintenance = () => {
    const headers = ['ID', 'Vehicle ID', 'Description', 'Cost ($)', 'Status', 'Created At', 'Closed At'];
    const rows = maintenanceLogs.map((log) => [
      log.id,
      log.vehicleId,
      log.description,
      log.cost,
      log.status,
      log.createdAt,
      log.closedAt || '',
    ]);
    downloadCsv(headers, rows, 'transitops_maintenance.csv');
  };

  const exportExpenses = () => {
    const headers = ['Type', 'Vehicle ID', 'Type/Name', 'Amount/Liters', 'Cost ($)', 'Date'];
    const rows = [
      ...expenses.map((e) => ['Expense', e.vehicleId, e.type, '', e.amount, e.date]),
      ...fuelLogs.map((f) => ['Fuel Log', f.vehicleId, 'Fuel Refill', f.liters, f.cost, f.date]),
    ];
    downloadCsv(headers, rows, 'transitops_financial_ledger.csv');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">System Data Compilation</h3>
        <p className="text-[10px] text-slate-500 mt-1">
          Export full relational database logs as structured spreadsheet formats.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={exportVehicles}
          className="py-2.5 px-3 bg-slate-950 border border-slate-850 hover:border-indigo-500 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Download className="h-4 w-4" />
          Vehicles CSV
        </button>

        <button
          onClick={exportDrivers}
          className="py-2.5 px-3 bg-slate-950 border border-slate-850 hover:border-indigo-500 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Download className="h-4 w-4" />
          Drivers CSV
        </button>

        <button
          onClick={exportTrips}
          className="py-2.5 px-3 bg-slate-950 border border-slate-850 hover:border-indigo-500 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Download className="h-4 w-4" />
          Trips CSV
        </button>

        <button
          onClick={exportMaintenance}
          className="py-2.5 px-3 bg-slate-950 border border-slate-850 hover:border-indigo-500 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <Download className="h-4 w-4" />
          Maintenance CSV
        </button>

        <button
          onClick={exportExpenses}
          className="py-2.5 px-3 bg-slate-950 border border-slate-850 hover:border-indigo-500 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:scale-[1.02] col-span-2 md:col-span-1"
        >
          <Download className="h-4 w-4" />
          Financials CSV
        </button>
      </div>
    </div>
  );
}
