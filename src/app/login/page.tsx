'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Truck, Users, BarChart3, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  const demoAccounts = [
    {
      role: 'Fleet Manager',
      email: 'manager@transitops.com',
      icon: <Truck className="h-4 w-4" />,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    },
    {
      role: 'Driver Ops',
      email: 'driverops@transitops.com',
      icon: <Users className="h-4 w-4" />,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    },
    {
      role: 'Safety Officer',
      email: 'safety@transitops.com',
      icon: <Shield className="h-4 w-4" />,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    },
    {
      role: 'Financial Analyst',
      email: 'finance@transitops.com',
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/25 mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TransitOps Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Manage fleet transitions & analytics</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@transitops.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 text-sm rounded-lg transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 text-sm rounded-lg transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium text-sm rounded-lg transition-colors shadow-md shadow-indigo-600/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mt-2"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900/60 px-3 text-slate-500 backdrop-blur-xl">
              Quick Demo Login
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {demoAccounts.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => handleQuickLogin(account.email)}
              className={`flex flex-col items-start p-2.5 border rounded-lg text-left transition-all hover:scale-[1.02] ${account.color}`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs mb-0.5">
                {account.icon}
                {account.role}
              </div>
              <span className="text-[10px] text-slate-400 font-mono truncate w-full">
                {account.email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
