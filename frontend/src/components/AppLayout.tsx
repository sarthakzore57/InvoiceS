import { BarChart3, FilePlus2, LayoutDashboard, LogOut, Moon, Search, Sun, TableProperties } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { logoutEmployee } from '../services/authService';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/invoice/new', label: 'Create Invoice', icon: FilePlus2 },
  { to: '/sales', label: 'Sales', icon: TableProperties },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function AppLayout() {
  const { employee } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  async function handleLogout() {
    await logoutEmployee();
    toast.info('Logged out');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-100 text-ink transition dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/50 bg-white/75 p-5 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 lg:block">
        <div className="mb-8">
          <p className="text-2xl font-black tracking-tight text-brand">Snaxlay</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Invoice & Sales ERP</p>
        </div>
        <nav className="space-y-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand text-white shadow-lg shadow-emerald-900/10'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-white/60 bg-white/75 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 md:hidden">
              <p className="truncate text-lg font-black text-brand">Snaxlay</p>
              <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">Invoice & Sales ERP</p>
            </div>
            <div className="hidden min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 md:flex">
              <Search size={18} className="text-slate-400" />
              <input
                className="ml-2 w-full bg-transparent text-sm outline-none"
                placeholder="Search invoices, vendors, customers, mobile numbers"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="icon-btn" onClick={() => setDark((value) => !value)} title="Toggle dark mode">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">{employee?.name ?? 'Employee'}</p>
                <p className="text-xs uppercase text-slate-500">{employee?.role ?? 'employee'}</p>
              </div>
              <button className="icon-btn" onClick={handleLogout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <main className="p-3 pb-24 sm:p-6 sm:pb-6">
          <Outlet />
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} className="mobile-nav">
            <item.icon size={19} />
            <span className="truncate">{item.label.replace('Create ', '')}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
