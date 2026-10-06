import {
  addDoc,
  collection,
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

/** Firestore rejects `undefined`; optional invoice fields must be omitted instead. */
function firestoreSaleData(sale: Omit<Sale, 'id' | 'timestamp'>) {
  return Object.fromEntries(
    Object.entries(sale).filter(([, value]) => value !== undefined),
  );
}

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
    ...firestoreSaleData(sale),
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
    ...firestoreSaleData(sale),
    updatedAt: serverTimestamp(),
  });
}

export async function completeSale(id: string) {
  await updateDoc(doc(db, 'sales', id), { saleStatus: 'Complete', completedAt: serverTimestamp() });
}

export async function deleteSale(id: string) {
  const saleRef = doc(db, 'sales', id);
  await runTransaction(db, async (transaction) => {
    const saleSnapshot = await transaction.get(saleRef);
    if (!saleSnapshot.exists()) throw new Error('Invoice no longer exists');

    const sale = saleSnapshot.data() as Sale;
    const customerRef = sale.customerId ? doc(db, 'customers', sale.customerId) : null;
    if (customerRef) {
      const customerSnapshot = await transaction.get(customerRef);
      if (customerSnapshot.exists()) {
        const customer = customerSnapshot.data();
        transaction.update(customerRef, {
          totalPurchase: Math.max(0, Number(customer.totalPurchase ?? 0) - Number(sale.grandTotal ?? 0)),
          previousOrders: Math.max(0, Number(customer.previousOrders ?? 0) - 1),
          outstandingBalance: Math.max(0, Number(customer.outstandingBalance ?? 0) - Number(sale.pendingAmount ?? 0)),
          updatedAt: serverTimestamp(),
        });
      }
    }

    transaction.delete(saleRef);
  });
}

export async function recentSales(count = 8) {
  const snap = await getDocs(query(collection(db, 'sales'), orderBy('timestamp', 'desc'), limit(count)));
  return snap.docs.map((document) => ({ id: document.id, ...document.data() })) as Sale[];
}

export async function salesBetween(from?: string, to?: string, createdBy?: string) {
  const constraints: QueryConstraint[] = [];
  if (createdBy) constraints.push(where('createdBy', '==', createdBy));
  if (from) constraints.push(where('invoiceDate', '>=', from));
  if (to) constraints.push(where('invoiceDate', '<=', to));
  constraints.push(orderBy(from || to ? 'invoiceDate' : 'timestamp', 'desc'));
  if (from || to) constraints.push(orderBy('timestamp', 'desc'));
  const snap = await getDocs(query(collection(db, 'sales'), ...constraints));
  return snap.docs.map((document) => ({ id: document.id, ...document.data() })) as Sale[];
}
