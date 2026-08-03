import type { InvoiceStatus, ProductItem } from '../types';

export function itemTotal(item: Omit<ProductItem, 'total'>) {
  const gross = item.quantity * item.mrp;
  const discountAmount = gross * (item.discount / 100);
  return roundCurrency(gross - discountAmount);
}

export function invoiceTotals(items: ProductItem[], paidAmount: number) {
  const subtotal = roundCurrency(items.reduce((sum, item) => sum + item.quantity * item.mrp, 0));
  const discount = roundCurrency(
    items.reduce((sum, item) => sum + item.quantity * item.mrp * (item.discount / 100), 0),
  );
  const gst = 0;
  const exactGrandTotal = subtotal - discount;
  const grandTotal = Math.round(exactGrandTotal);
  const roundOff = roundCurrency(grandTotal - exactGrandTotal);
  const pendingAmount = Math.max(0, roundCurrency(grandTotal - paidAmount));
  const status: InvoiceStatus = pendingAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending';
  return { subtotal, discount, gst, grandTotal, roundOff, pendingAmount, status };
}

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}
