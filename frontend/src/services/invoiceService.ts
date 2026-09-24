import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  getDocs,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Sale } from '../types';

export async function nextInvoiceNumber(date = new Date()) {
  const year = date.getFullYear();
  const counterRef = doc(db, 'counters', `invoice-${year}`);
  const sequence = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);
    if (!snap.exists()) {
      transaction.set(counterRef, { year, sequence: 1, updatedAt: serverTimestamp() });
      return 1;
    }
    const next = Number(snap.data().sequence ?? 0) + 1;
    transaction.update(counterRef, { sequence: increment(1), updatedAt: serverTimestamp() });
    return next;
  });
  return `SNX-${year}-${String(sequence).padStart(6, '0')}`;
}

export async function peekNextInvoiceNumber(date = new Date()) {
  const year = date.getFullYear();
  const snap = await getDoc(doc(db, 'counters', `invoice-${year}`));
  const next = snap.exists() ? Number(snap.data().sequence ?? 0) + 1 : 1;
  return `SNX-${year}-${String(next).padStart(6, '0')}`;
}

export async function saveSale(sale: Omit<Sale, 'id' | 'timestamp'>) {
  const docRef = await addDoc(collection(db, 'sales'), {
    ...sale,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSale(id: string) {
  const snap = await getDoc(doc(db, 'sales', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Sale) : null;
}

export async function updateSale(id: string, sale: Omit<Sale, 'id' | 'timestamp'>) {
  await updateDoc(doc(db, 'sales', id), {
    ...sale,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSale(id: string) {
  await deleteDoc(doc(db, 'sales', id));
}

export async function recentSales(count = 8) {
  const snap = await getDocs(query(collection(db, 'sales'), orderBy('timestamp', 'desc'), limit(count)));
  return snap.docs.map((document) => ({ id: document.id, ...document.data() })) as Sale[];
}

export async function salesBetween(from?: string, to?: string) {
  const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc')];
  if (from) constraints.push(where('invoiceDate', '>=', from));
  if (to) constraints.push(where('invoiceDate', '<=', to));
  const snap = await getDocs(query(collection(db, 'sales'), ...constraints));
  return snap.docs.map((document) => ({ id: document.id, ...document.data() })) as Sale[];
}
