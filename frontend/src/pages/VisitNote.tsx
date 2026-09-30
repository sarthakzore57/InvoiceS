import { ArrowLeft, FilePlus2, MapPin, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOutlet, saveVisit } from '../services/outletService';
import { useAuth } from '../contexts/AuthContext';
import type { Outlet } from '../types';

export default function VisitNote() {
  const { outletId } = useParams(); const navigate = useNavigate(); const { user, employee } = useAuth();
  const [outlet, setOutlet] = useState<Outlet | null>(null); const [note, setNote] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { if (outletId) getOutlet(outletId).then(setOutlet).catch(() => toast.error('Could not load outlet')); }, [outletId]);
  async function save(hasOrder: boolean) { if (!outlet?.id || !user) return; setSaving(true); try { await saveVisit({ outletId: outlet.id, outletName: outlet.shopName, areaId: outlet.areaId, areaName: outlet.areaName, note: note.trim(), hasOrder, createdBy: user.uid, employeeName: employee?.name ?? user.email ?? 'Employee' }); toast.success('Visit saved'); navigate(hasOrder ? `/invoice/new?outletId=${outlet.id}` : '/visit'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save visit'); } finally { setSaving(false); } }
  if (!outlet) return <p className="text-sm text-slate-500">Loading outlet...</p>;
  return <div className="mx-auto max-w-2xl space-y-4"><button className="btn-secondary" onClick={() => navigate('/visit')}><ArrowLeft size={18} />Back to visits</button><section className="panel"><h1 className="text-xl font-black">Visit note</h1><p className="mt-2 font-bold text-brand">{outlet.shopName}</p><p className="mt-1 text-sm text-slate-500"><MapPin className="mr-1 inline" size={14} />{outlet.address}</p></section><section className="panel"><label className="label">Visit information</label><textarea className="field min-h-36" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Discussion, stock requirement, follow-up, payment note..." /><div className="mt-4 grid gap-3 sm:grid-cols-2"><button className="btn-secondary" disabled={saving} onClick={() => save(false)}><Save size={18} />Save visit only</button><button className="btn-primary" disabled={saving} onClick={() => save(true)}><FilePlus2 size={18} />{saving ? 'Saving...' : 'Save & create invoice'}</button></div></section></div>;
}
