import { Sidebar } from '@/components/Sidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-400">Welcome Back,</h2>
            <h1 className="text-base font-bold text-white leading-tight">
              {session.user.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded font-bold">
              Production Environment
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
