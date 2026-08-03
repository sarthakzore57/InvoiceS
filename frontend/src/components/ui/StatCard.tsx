import type { LucideIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

export default function StatCard({
  label,
  value,
  icon: Icon,
  currency,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  currency?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-brand dark:bg-emerald-950">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-black tracking-tight">{currency ? formatCurrency(value) : value.toLocaleString('en-IN')}</p>
    </div>
  );
}
