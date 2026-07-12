'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Truck,
  Users,
  Route,
  Wrench,
  BarChart3,
  LogOut,
  User as UserIcon,
  ChevronsUpDown,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Overview', href: '/', icon: BarChart3 },
  { name: 'Vehicles', href: '/vehicles', icon: Truck },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Trips Board', href: '/trips', icon: Route },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Financials & CSV', href: '/finance', icon: BarChart3 },
];

const rolesList = [
  { id: 'FLEET_MANAGER', label: 'Fleet Manager', color: 'text-emerald-400' },
  { id: 'DRIVER_OPS', label: 'Driver Ops', color: 'text-blue-400' },
  { id: 'SAFETY_OFFICER', label: 'Safety Officer', color: 'text-amber-400' },
  { id: 'FINANCIAL_ANALYST', label: 'Financial Analyst', color: 'text-purple-400' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    setShowRoleDropdown(false);
    await update({ role: newRole });
    router.refresh();
  };

  const currentRoleInfo = rolesList.find((r) => r.id === session?.user?.role) || {
    label: session?.user?.role || 'Unknown',
    color: 'text-slate-400',
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-full select-none">
      <div className="flex flex-col overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-wider">TransitOps</span>
        </div>

        {/* Dynamic Demo Role Switcher */}
        <div className="p-4 border-b border-slate-800 relative">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
            Active Role (Demo Toggle)
          </span>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2 flex items-center justify-between text-left hover:border-slate-700 transition-colors"
          >
            <div className="truncate">
              <span className={`text-xs font-bold font-mono ${currentRoleInfo.color}`}>
                {currentRoleInfo.label}
              </span>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500 shrink-0 ml-1" />
          </button>

          {showRoleDropdown && (
            <div className="absolute left-4 right-4 mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
              {rolesList.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900 hover:text-white font-medium transition-colors flex items-center justify-between"
                >
                  <span className={role.color}>{role.label}</span>
                  {session?.user?.role === role.id && (
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 bg-slate-800 rounded-full text-slate-400">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {session?.user?.name || 'User Profile'}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {session?.user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full py-1.5 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-400 hover:text-rose-400 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
