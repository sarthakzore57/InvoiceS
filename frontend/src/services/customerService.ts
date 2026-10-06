import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Customer } from '../types';

export function customerIdFromMobile(mobile: string, createdBy = '') {
  return `CUS${createdBy ? `${createdBy}-` : ''}${mobile.replace(/\D/g, '')}`;
}

export async function getCustomerByMobile(mobile: string, createdBy: string) {
  const customerId = customerIdFromMobile(mobile, createdBy);
  const snap = await getDoc(doc(db, 'customers', customerId));
  return snap.exists() ? (snap.data() as Customer) : null;
}

export async function upsertCustomer(input: {
  customerName: string;
  mobile: string;
  address: string;
  grandTotal: number;
  pendingAmount: number;
  createdBy: string;
}) {
  const customerId = customerIdFromMobile(input.mobile, input.createdBy);
  const ref = doc(db, 'customers', customerId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    const current = existing.data() as Customer;
    await updateDoc(ref, {
      customerName: input.customerName,
      address: input.address,
      totalPurchase: (current.totalPurchase ?? 0) + input.grandTotal,
      previousOrders: (current.previousOrders ?? 0) + 1,
      outstandingBalance: (current.outstandingBalance ?? 0) + input.pendingAmount,
    });
    return { ...current, customerName: input.customerName, address: input.address };
  }

  const customer = {
    customerId,
    customerName: input.customerName,
    mobile: input.mobile,
    address: input.address,
    totalPurchase: input.grandTotal,
    previousOrders: 1,
    outstandingBalance: input.pendingAmount,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, customer);
  return customer as Customer;
}
