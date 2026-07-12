'use client';

import { useRouter } from 'next/navigation';

interface VehicleFiltersProps {
  uniqueRegions: string[];
  regionFilter?: string;
  statusFilter?: string;
}

export function VehicleFilters({
  uniqueRegions,
  regionFilter,
  statusFilter,
}: VehicleFiltersProps) {
  const router = useRouter();

  const handleRegionChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('region', val);
    } else {
      params.delete('region');
    }
    router.push(`/vehicles?${params.toString()}`);
  };

  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('status', val);
    } else {
      params.delete('status');
    }
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="flex gap-3">
      <div>
        <select
          value={regionFilter || ''}
          onChange={(e) => handleRegionChange(e.target.value)}
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
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-950 border border-slate-850 outline-none text-slate-300 text-xs rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="ON_TRIP">ON_TRIP</option>
          <option value="IN_SHOP">IN_SHOP</option>
          <option value="RETIRED">RETIRED</option>
        </select>
      </div>
    </div>
  );
}
