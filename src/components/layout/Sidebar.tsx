import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  AlertTriangle,
  BarChart3,
  Settings,
  Cpu,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/fleet', label: 'Fleet', icon: LayoutDashboard },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/models', label: 'Models', icon: Cpu },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 border-r bg-white dark:bg-[#020817] border-slate-200 dark:border-[#111827] transition-colors">
      <div className="flex h-16 items-center border-b border-slate-200 dark:border-[#111827] px-6 bg-white dark:bg-[#020817] transition-colors">
        <h1 className="text-xl font-medium text-[#0F172A] dark:text-[#E5E7EB] tracking-tight">
          BrakeDisc Twin
        </h1>
      </div>
      <nav className="p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-4 rounded-full px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-mercedes-accent text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#111827] dark:hover:text-[#E5E7EB]'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
