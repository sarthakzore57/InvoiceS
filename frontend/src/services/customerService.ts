import { collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Customer } from '../types';

export function customerIdFromMobile(mobile: string, createdBy = '') {
  return `CUS${createdBy ? `${createdBy}-` : ''}${mobile.replace(/\D/g, '')}`;
}

export async function getCustomerByMobile(mobile: string, createdBy: string) {
  const customerId = customerIdFromMobile(mobile, createdBy);
  // A direct read of a document that does not exist is denied by ownership
  // rules. Query the employee's own customers instead; an empty result is a
  // valid new customer and does not produce a permission error.
  const snap = await getDocs(query(
    collection(db, 'customers'),
    where('createdBy', '==', createdBy),
  ));
  const match = snap.docs.find((entry) => entry.id === customerId);
  return match ? (match.data() as Customer) : null;
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
  const current = await getCustomerByMobile(input.mobile, input.createdBy);
  if (current) {
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
