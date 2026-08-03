import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import EmptyState from '../components/ui/EmptyState';
import { salesBetween } from '../services/invoiceService';
import { categorySales, groupedSales, reportCards } from '../services/reportService';
import type { Sale } from '../types';
import { formatCurrency } from '../utils/calculations';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const reports = useMemo(() => reportCards(sales), [sales]);
  const monthly = groupedSales(sales, 'monthly');
  const categories = categorySales(sales);

  useEffect(() => {
    salesBetween().then(setSales).catch((error) => toast.error(error instanceof Error ? error.message : 'Reports failed'));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Daily, weekly, monthly, yearly, vendor, customer, product, and category insights.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ReportList title="Top Vendors" rows={reports.topVendors} currency />
        <ReportList title="Top Customers" rows={reports.topCustomers} currency />
        <ReportList title="Most Sold Products" rows={reports.mostSoldProducts} />
        <ReportList title="Highest Revenue Products" rows={reports.highestRevenueProducts} currency />
        <ReportList title="Monthly Revenue" rows={monthly.map((item) => [item.label, item.revenue])} currency />
        <ReportList title="Revenue by Category" rows={categories.map((item) => [item.category, item.revenue])} currency />
      </div>
    </div>
  );
}

function ReportList({ title, rows, currency }: { title: string; rows: [string, number][]; currency?: boolean }) {
  return (
    <section className="panel">
      <h2 className="mb-3 text-lg font-black">{title}</h2>
      {rows.length ? (
        <div className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
              <span className="font-semibold">{label}</span>
              <span className="font-bold">{currency ? formatCurrency(value) : value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No report data" detail="Generate invoices to build this report." />
      )}
    </section>
  );
}
