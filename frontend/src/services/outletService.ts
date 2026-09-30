import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Area, Outlet, VisitRecord } from '../types';

export async function getAreas() {
  const snapshot = await getDocs(query(collection(db, 'areas'), orderBy('name')));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Area);
}

export async function addArea(name: string) {
  const ref = await addDoc(collection(db, 'areas'), { name: name.trim(), createdAt: serverTimestamp() });
  return ref.id;
}

export async function getOutlets(areaId: string) {
  const snapshot = await getDocs(query(collection(db, 'outlets'), where('areaId', '==', areaId), orderBy('shopName')));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Outlet);
}

export async function getAllOutlets() {
  const snapshot = await getDocs(query(collection(db, 'outlets'), orderBy('shopName')));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Outlet);
}

export async function addOutlet(outlet: Omit<Outlet, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'outlets'), { ...outlet, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getOutlet(id: string) {
  const { getDoc } = await import('firebase/firestore');
  const snapshot = await getDoc(doc(db, 'outlets', id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Outlet) : null;
}

export async function getAreaVisits(areaId: string) {
  const snapshot = await getDocs(query(collection(db, 'visits'), where('areaId', '==', areaId)));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as VisitRecord);
}

export async function getOutletVisits(outletId: string) {
  const snapshot = await getDocs(query(collection(db, 'visits'), where('outletId', '==', outletId)));
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as VisitRecord)
    .sort((a, b) => (b.visitedAt?.toDate?.().getTime() ?? 0) - (a.visitedAt?.toDate?.().getTime() ?? 0));
}

export async function saveVisit(visit: Omit<VisitRecord, 'id' | 'visitedAt'>) {
  const ref = await addDoc(collection(db, 'visits'), { ...visit, visitedAt: serverTimestamp() });
  await updateDoc(doc(db, 'outlets', visit.outletId), { lastVisitAt: serverTimestamp() });
  return ref.id;
}
