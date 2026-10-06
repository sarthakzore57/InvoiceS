import { addDoc, collection, deleteDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, doc, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Area, Outlet, VisitRecord } from '../types';

export async function getAreas(createdBy?: string) {
  const snapshot = await getDocs(query(collection(db, 'areas'), ...(createdBy ? [where('createdBy', '==', createdBy)] : []), orderBy('name')));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Area);
}

export async function addArea(name: string, createdBy: string) {
  const ref = await addDoc(collection(db, 'areas'), { name: name.trim(), createdBy, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateArea(id: string, name: string) {
  await updateDoc(doc(db, 'areas', id), { name: name.trim(), updatedAt: serverTimestamp() });
}

export async function deleteArea(id: string, createdBy?: string) {
  // The ownership filter is required for employee accounts: Firestore rules do
  // not treat a collection query as a safe filter unless it includes it.
  const outlets = await getOutlets(id, createdBy);
  const batch = writeBatch(db);
  batch.delete(doc(db, 'areas', id));
  outlets.forEach((outlet) => outlet.id && batch.delete(doc(db, 'outlets', outlet.id)));
  await batch.commit();
}

export async function getOutlets(areaId: string, createdBy?: string) {
  const snapshot = await getDocs(query(collection(db, 'outlets'), where('areaId', '==', areaId), ...(createdBy ? [where('createdBy', '==', createdBy)] : []), orderBy('shopName')));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as Outlet);
}

export async function getAllOutlets(createdBy?: string) {
  // Sorting employee-owned outlets in the browser avoids waiting for a new
  // composite Firestore index after an employee account is created.
  const snapshot = await getDocs(query(
    collection(db, 'outlets'),
    ...(createdBy ? [where('createdBy', '==', createdBy)] : [orderBy('shopName')]),
  ));
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as Outlet)
    .sort((a, b) => a.shopName.localeCompare(b.shopName));
}

export async function addOutlet(outlet: Omit<Outlet, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'outlets'), { ...outlet, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateOutlet(id: string, outlet: Omit<Outlet, 'id' | 'createdAt'>) {
  await updateDoc(doc(db, 'outlets', id), { ...outlet, updatedAt: serverTimestamp() });
}

export async function deleteOutlet(id: string) { await deleteDoc(doc(db, 'outlets', id)); }

export async function getOutlet(id: string) {
  const { getDoc } = await import('firebase/firestore');
  const snapshot = await getDoc(doc(db, 'outlets', id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Outlet) : null;
}

export async function getAreaVisits(areaId: string, createdBy?: string) {
  const snapshot = await getDocs(query(collection(db, 'visits'), where('areaId', '==', areaId), ...(createdBy ? [where('createdBy', '==', createdBy)] : [])));
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as VisitRecord);
}

export async function getOutletVisits(outletId: string, createdBy?: string) {
  const snapshot = await getDocs(query(collection(db, 'visits'), where('outletId', '==', outletId), ...(createdBy ? [where('createdBy', '==', createdBy)] : [])));
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as VisitRecord)
    .sort((a, b) => (b.visitedAt?.toDate?.().getTime() ?? 0) - (a.visitedAt?.toDate?.().getTime() ?? 0));
}

export async function getVisit(id: string) {
  const { getDoc } = await import('firebase/firestore');
  const snapshot = await getDoc(doc(db, 'visits', id));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as VisitRecord) : null;
}

export async function saveVisit(visit: Omit<VisitRecord, 'id' | 'visitedAt'>) {
  const ref = await addDoc(collection(db, 'visits'), { ...visit, visitedAt: serverTimestamp() });
  await updateDoc(doc(db, 'outlets', visit.outletId), { lastVisitAt: serverTimestamp() });
  return ref.id;
}
