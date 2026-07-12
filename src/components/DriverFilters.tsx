'use client';

import { useRouter } from 'next/navigation';

interface DriverFiltersProps {
  statusFilter?: string;
}

export function DriverFilters({ statusFilter }: DriverFiltersProps) {
  const router = useRouter();

  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set('status', val);
    } else {
      params.delete('status');
    }
    router.push(`/drivers?${params.toString()}`);
  };

  return (
    <select
      value={statusFilter || ''}
      onChange={(e) => handleStatusChange(e.target.value)}
      className="px-3 py-1.5 bg-slate-950 border border-slate-850 outline-none text-slate-300 text-xs rounded-lg"
    >
      <option value="">All Statuses</option>
      <option value="AVAILABLE">AVAILABLE</option>
      <option value="ON_TRIP">ON_TRIP</option>
      <option value="OFF_DUTY">OFF_DUTY</option>
      <option value="SUSPENDED">SUSPENDED</option>
    </select>
  );
}
