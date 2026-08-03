import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { CalendarDays, Download, FilePlus2, IndianRupee, Store, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import { recentSales, salesBetween } from '../services/invoiceService';
import { categorySales, groupedSales, todayMetrics } from '../services/reportService';
import type { Sale } from '../types';
import { formatCurrency } from '../utils/calculations';
import { exportSalesToExcel } from '../utils/exportSales';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createInvoicePdf, downloadPdf } from '../utils/pdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [counts, setCounts] = useState({ vendors: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [saleData, vendorCount, customerCount] = await Promise.all([
          salesBetween(),
          getCountFromServer(collection(db, 'vendors')),
          getCountFromServer(collection(db, 'customers')),
        ]);
        setSales(saleData);
        setCounts({ vendors: vendorCount.data().count, customers: customerCount.data().count });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const metrics = useMemo(() => todayMetrics(sales, counts.vendors, counts.customers), [sales, counts]);
  const daily = groupedSales(sales, 'daily').slice(-10);
  const categories = categorySales(sales);

  async function handleExport() {
    const data = await recentSales(1000);
    exportSalesToExcel(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Today&apos;s sales, analytics, and recent invoices.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link className="btn-primary px-3" to="/invoice/new">
            <FilePlus2 size={18} />
            Create Invoice
          </Link>
          <button className="btn-secondary px-3" onClick={handleExport}>
            <Download size={18} />
            Export Sales
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={metrics.totalOrders} icon={CalendarDays} />
        <StatCard label="Total Revenue" value={metrics.totalRevenue} icon={IndianRupee} currency />
        <StatCard label="Total Customers" value={metrics.totalCustomers} icon={Users} />
        <StatCard label="Total Vendors" value={metrics.totalVendors} icon={Store} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="panel">
          <h2 className="text-lg font-black">Daily Sales</h2>
          <div className="mt-4 h-80">
            {daily.length ? (
              <Bar
                data={{
                  labels: daily.map((item) => item.label),
                  datasets: [{ label: 'Revenue', data: daily.map((item) => item.revenue), backgroundColor: '#0f8f72' }],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            ) : (
              <EmptyState title={loading ? 'Loading sales' : 'No sales yet'} detail="Create invoices to populate analytics." />
            )}
          </div>
        </section>

        <section className="panel">
          <h2 className="text-lg font-black">Category Wise Sales</h2>
          <div className="mt-4 space-y-3">
            {categories.length ? categories.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between text-sm font-semibold">
                  <span>{item.category}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-saffron" style={{ width: `${item.percentage}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.quantity} sold | {formatCurrency(item.revenue)}
                </p>
              </div>
            )) : <EmptyState title="No category data" detail="Product categories appear once invoices are generated." />}
          </div>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <h2 className="mb-4 text-lg font-black">Recent Sales</h2>
        <RecentSalesTable sales={sales.slice(0, 8)} />
      </section>
    </div>
  );
}

export function RecentSalesTable({ sales }: { sales: Sale[] }) {
  const [downloading, setDownloading] = useState('');

  async function handleDownloadPdf(sale: Sale) {
    setDownloading(sale.invoiceNumber);
    try {
      const pdf = await createInvoicePdf(sale);
      downloadPdf(pdf, `${sale.invoiceNumber}.pdf`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not generate PDF');
    } finally {
      setDownloading('');
    }
  }

  if (!sales.length) return <EmptyState title="No invoices found" detail="Recent invoices will appear here." />;
  return (
    <>
      <div className="space-y-3 md:hidden">
        {sales.map((sale) => (
          <div key={sale.id ?? sale.invoiceNumber} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{sale.invoiceNumber}</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-600 dark:text-slate-300">{sale.customerName}</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-brand">{sale.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Date</p>
                <p className="font-semibold">{sale.invoiceDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-slate-500">Amount</p>
                <p className="font-black">{formatCurrency(sale.grandTotal)}</p>
              </div>
            </div>
            <button className="btn-secondary mt-3 w-full" onClick={() => handleDownloadPdf(sale)} disabled={downloading === sale.invoiceNumber}>
              <Download size={16} />
              {downloading === sale.invoiceNumber ? 'Generating' : 'Download PDF'}
            </button>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            {['Invoice Number', 'Customer', 'Vendor', 'Date', 'Amount', 'Status', 'PDF'].map((heading) => (
              <th key={heading} className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id ?? sale.invoiceNumber} className="border-b border-slate-100 dark:border-slate-800">
              <td className="px-3 py-3 font-bold">{sale.invoiceNumber}</td>
              <td className="px-3 py-3">{sale.customerName}</td>
              <td className="px-3 py-3">{sale.vendorName}</td>
              <td className="px-3 py-3">{sale.invoiceDate}</td>
              <td className="px-3 py-3">{formatCurrency(sale.grandTotal)}</td>
              <td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-brand">{sale.status}</span></td>
              <td className="px-3 py-3">
                <button className="btn-secondary px-3 py-2" onClick={() => handleDownloadPdf(sale)} disabled={downloading === sale.invoiceNumber}>
                  <Download size={16} />
                  {downloading === sale.invoiceNumber ? 'Generating' : 'Download'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
