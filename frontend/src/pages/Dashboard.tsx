import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { CalendarDays, CheckCircle2, Download, FilePlus2, IndianRupee, Pencil, Store, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import { completeSale, deleteSale, recentSales, salesBetween } from '../services/invoiceService';
import { categorySales, groupedSales, todayMetrics } from '../services/reportService';
import type { Sale } from '../types';
import { formatCurrency } from '../utils/calculations';
import { exportSalesToExcel } from '../utils/exportSales';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createInvoicePdf, downloadPdf } from '../utils/pdf';
import { useAuth } from '../contexts/AuthContext';
import { getAllOutlets } from '../services/outletService';
import type { Outlet } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [counts, setCounts] = useState({ vendors: 0, customers: 0 });
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const { employee, user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const [saleData, customerCount, outletData] = await Promise.all([
          salesBetween(undefined, undefined, employee?.role === 'admin' ? undefined : user?.uid),
          getCountFromServer(employee?.role === 'admin' ? collection(db, 'customers') : query(collection(db, 'customers'), where('createdBy', '==', user?.uid ?? ''))),
          getAllOutlets(employee?.role === 'admin' ? undefined : user?.uid),
        ]);
        setSales(saleData);
        setCounts({ vendors: 1, customers: customerCount.data().count });
        setOutlets(outletData);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [employee?.role, user?.uid]);

  const metrics = useMemo(() => todayMetrics(sales, counts.vendors, counts.customers), [sales, counts]);
  const daily = groupedSales(sales, 'daily').slice(-10);
  const categories = categorySales(sales);
  const gradeCounts = { A: outlets.filter((outlet) => outlet.grade === 'A').length, B: outlets.filter((outlet) => outlet.grade === 'B').length, C: outlets.filter((outlet) => (outlet.grade ?? 'C') === 'C').length };

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

      <section className="panel"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black">Outlet Grades</h2><p className="text-sm text-slate-500">{outlets.length} outlets in total</p></div><Link className="text-sm font-bold text-brand" to="/areas">Manage outlets</Link></div><div className="mt-4 grid grid-cols-3 gap-3"><GradeCount grade="A" count={gradeCounts.A} /><GradeCount grade="B" count={gradeCounts.B} /><GradeCount grade="C" count={gradeCounts.C} /></div></section>

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
        <RecentSalesTable sales={sales.slice(0, 8)} onDeleted={() => window.location.reload()} />
      </section>
    </div>
  );
}

function GradeCount({ grade, count }: { grade: 'A' | 'B' | 'C'; count: number }) { return <div className="rounded-lg bg-slate-100 p-3 text-center dark:bg-slate-800"><p className="text-2xl font-black text-brand">{count}</p><p className="text-xs font-bold uppercase text-slate-500">Grade {grade}</p></div>; }

export function RecentSalesTable({ sales, onDeleted }: { sales: Sale[]; onDeleted?: () => void }) {
  const { employee, user } = useAuth();
  const [downloading, setDownloading] = useState('');
  const [deleting, setDeleting] = useState('');
  const [completing, setCompleting] = useState('');

  function canDelete(sale: Sale) {
    return employee?.role === 'admin' || (sale.saleStatus !== 'Complete' && sale.createdBy === user?.uid);
  }

  async function handleComplete(sale: Sale) {
    if (!sale.id || sale.saleStatus === 'Complete') return;
    if (!window.confirm(`Mark invoice ${sale.invoiceNumber} as complete? It cannot be edited afterward.`)) return;
    setCompleting(sale.id);
    try {
      await completeSale(sale.id);
      sale.saleStatus = 'Complete';
      toast.success('Invoice marked complete and locked');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not complete invoice');
    } finally {
      setCompleting('');
    }
  }

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

  async function handleDelete(sale: Sale) {
    if (!sale.id) return;
    if (!window.confirm(`Delete invoice ${sale.invoiceNumber}?`)) return;
    setDeleting(sale.id);
    try {
      await deleteSale(sale.id);
      onDeleted?.();
      toast.success('Invoice deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete invoice');
    } finally {
      setDeleting('');
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
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">Created by {sale.employeeName || 'Unknown employee'}</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-brand">{sale.saleStatus ?? 'Pending'}</span>
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
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn-secondary px-2" onClick={() => handleDownloadPdf(sale)} disabled={downloading === sale.invoiceNumber}>
                <Download size={16} />
                {downloading === sale.invoiceNumber ? 'Wait' : 'PDF'}
              </button>
              {sale.saleStatus === 'Complete' ? <span className="btn-secondary px-2 opacity-60"><CheckCircle2 size={16} />Complete</span> : <button className="btn-secondary px-2" onClick={() => handleComplete(sale)} disabled={!sale.id || completing === sale.id}><CheckCircle2 size={16} />{completing === sale.id ? 'Wait' : 'Complete'}</button>}
              {sale.saleStatus !== 'Complete' ? <Link className="btn-secondary px-2" to={sale.id ? `/invoice/${sale.id}/edit` : '/sales'}><Pencil size={16} />Edit</Link> : null}
              {canDelete(sale) ? <button className="btn-secondary px-2 text-red-600" onClick={() => handleDelete(sale)} disabled={!sale.id || deleting === sale.id}>
                <Trash2 size={16} />
                {deleting === sale.id ? 'Wait' : 'Delete'}
              </button> : null}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            {['Invoice Number', 'Customer', 'Employee', 'Date', 'Amount', 'Status', 'Actions'].map((heading) => (
              <th key={heading} className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id ?? sale.invoiceNumber} className="border-b border-slate-100 dark:border-slate-800">
              <td className="px-3 py-3 font-bold">{sale.invoiceNumber}</td>
              <td className="px-3 py-3">{sale.customerName}</td>
              <td className="px-3 py-3 font-semibold">{sale.employeeName || 'Unknown employee'}</td>
              <td className="px-3 py-3">{sale.invoiceDate}</td>
              <td className="px-3 py-3">{formatCurrency(sale.grandTotal)}</td>
              <td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-brand">{sale.saleStatus ?? 'Pending'}</span></td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  <button className="icon-btn h-9 w-9" onClick={() => handleDownloadPdf(sale)} disabled={downloading === sale.invoiceNumber} title="Download PDF">
                    <Download size={16} />
                  </button>
                  {sale.saleStatus !== 'Complete' ? <><Link className="icon-btn h-9 w-9" to={sale.id ? `/invoice/${sale.id}/edit` : '/sales'} title="Edit invoice"><Pencil size={16} /></Link><button className="icon-btn h-9 w-9 text-brand" onClick={() => handleComplete(sale)} disabled={!sale.id || completing === sale.id} title="Mark complete"><CheckCircle2 size={16} /></button></> : <CheckCircle2 className="m-2 text-brand" size={20} />}
                  {canDelete(sale) ? <button className="icon-btn h-9 w-9 text-red-600" onClick={() => handleDelete(sale)} disabled={!sale.id || deleting === sale.id} title="Delete invoice">
                    <Trash2 size={16} />
                  </button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
