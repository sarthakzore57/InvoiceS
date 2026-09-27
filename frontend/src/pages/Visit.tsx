import { ArrowRight, MapPin, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAreas, getOutlets } from '../services/outletService';
import type { Area, Outlet } from '../types';

export default function Visit() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]); const [selectedArea, setSelectedArea] = useState(''); const [outlets, setOutlets] = useState<Outlet[]>([]); const [loading, setLoading] = useState(false);
  useEffect(() => { getAreas().then(setAreas).catch((error) => toast.error(error instanceof Error ? error.message : 'Could not load areas')); }, []);
  useEffect(() => { if (!selectedArea) { setOutlets([]); return; } setLoading(true); getOutlets(selectedArea).then(setOutlets).catch((error) => toast.error(error instanceof Error ? error.message : 'Could not load outlets')).finally(() => setLoading(false)); }, [selectedArea]);
  return <div className="space-y-4 sm:space-y-5"><div><h1 className="text-xl font-black tracking-tight sm:text-2xl">Visit</h1><p className="text-sm text-slate-500 dark:text-slate-400">Choose an area, select an outlet, and create its order.</p></div><section className="panel"><label className="label">Area</label><select className="field max-w-xl" value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}><option value="">Select an area</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></section>{selectedArea ? <section className="panel"><h2 className="mb-4 text-lg font-black">Available Outlets</h2>{loading ? <p className="text-sm text-slate-500">Loading outlets...</p> : outlets.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{outlets.map((outlet) => <button key={outlet.id} className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-brand hover:bg-emerald-50 dark:border-slate-800 dark:hover:bg-slate-800" onClick={() => navigate(`/invoice/new?outletId=${outlet.id}`)}><div className="flex items-start justify-between gap-2"><div><p className="font-black">{outlet.shopName}</p><p className="mt-1 text-sm font-semibold text-brand">{outlet.areaName}</p></div><ArrowRight size={18} /></div><p className="mt-3 text-sm text-slate-500"><MapPin className="mr-1 inline" size={14} />{outlet.address}</p><p className="mt-2 text-sm font-semibold">{outlet.contactNumber}</p></button>)}</div> : <div className="flex items-center gap-2 text-sm text-slate-500"><Store size={18} />No outlets in this area yet. Add one in Areas & Outlets.</div>}</section> : null}</div>;
}
