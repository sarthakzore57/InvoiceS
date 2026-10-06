import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { salesBetween } from '../services/invoiceService';
import type { Employee, Sale } from '../types';

export default function Admin() {
  const { employee } = useAuth(); const [employees, setEmployees] = useState<Employee[]>([]); const [sales, setSales] = useState<Sale[]>([]);
  useEffect(() => { if (employee?.role === 'admin') Promise.all([getDocs(query(collection(db, 'employees'), orderBy('name'))), salesBetween()]).then(([people, invoiceData]) => { setEmployees(people.docs.map((entry) => entry.data() as Employee)); setSales(invoiceData); }); }, [employee]);
  if (employee?.role !== 'admin') return <Navigate to="/" replace />;
  return <div className="space-y-4 sm:space-y-5"><div><h1 className="text-xl font-black sm:text-2xl">Admin workspace</h1><p className="text-sm text-slate-500">Employee records, sales oversight, and system management.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Card label="Employees" value={employees.length} /><Card label="Invoices" value={sales.length} /><Card label="Revenue" value={`₹${sales.reduce((sum, sale) => sum + sale.grandTotal, 0).toLocaleString('en-IN')}`} /><Card label="Pending" value={sales.filter((sale) => sale.saleStatus !== 'Complete').length} /></div><section className="panel overflow-x-auto"><h2 className="mb-3 text-lg font-black">Employees</h2><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b"><th className="p-2">Name</th><th className="p-2">Employee ID</th><th className="p-2">Email</th><th className="p-2">Mobile</th><th className="p-2">Role</th></tr></thead><tbody>{employees.map((person) => <tr key={person.uid} className="border-b border-slate-100"><td className="p-2 font-bold">{person.name}</td><td className="p-2">{person.employeeId}</td><td className="p-2">{person.email}</td><td className="p-2">{person.mobile}</td><td className="p-2 capitalize">{person.role}</td></tr>)}</tbody></table></section></div>;
}
function Card({ label, value }: { label: string; value: string | number }) { return <div className="panel p-3"><p className="text-xl font-black text-brand">{value}</p><p className="text-xs font-bold uppercase text-slate-500">{label}</p></div>; }
