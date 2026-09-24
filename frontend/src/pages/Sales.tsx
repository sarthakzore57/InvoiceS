import { Download, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { RecentSalesTable } from './Dashboard';
import { salesBetween } from '../services/invoiceService';
import type { Sale } from '../types';
import { exportSalesToExcel } from '../utils/exportSales';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  const loadSales = useCallback(async () => {
    try {
      setSales(await salesBetween(from || undefined, to || undefined));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load sales');
    }
  }, [from, to]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return sales.filter((sale) =>
      [sale.invoiceNumber, sale.vendorName, sale.customerName, sale.customerMobile, sale.invoiceDate, sale.paymentMethod]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [sales, search]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">Sales</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search, filter, and export invoice records.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => exportSalesToExcel(filtered)}>
          <Download size={18} />
          Export Excel
        </button>
      </div>
      <section className="panel grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="field pl-10" placeholder="Search invoices" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <label><span className="label md:hidden">From</span><input className="field" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label><span className="label md:hidden">To</span><input className="field" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <button className="btn-secondary" onClick={loadSales}>Apply</button>
      </section>
      <section className="panel">
        <RecentSalesTable sales={filtered} onDeleted={(id) => setSales((current) => current.filter((sale) => sale.id !== id))} />
      </section>
    </div>
  );
}
