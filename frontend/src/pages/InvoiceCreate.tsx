import { FileCheck2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerByMobile, upsertCustomer } from '../services/customerService';
import { nextInvoiceNumber, peekNextInvoiceNumber, saveSale } from '../services/invoiceService';
import { paymentMethods, productCatalog, snaxlayBusiness, type ProductItem, type Sale, type Vendor } from '../types';
import { formatCurrency, invoiceTotals, itemTotal } from '../utils/calculations';
import { createInvoicePdf, downloadPdf } from '../utils/pdf';

const invoiceSchema = z.object({
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerMobile: z.string().regex(/^[6-9]\d{9}$/, 'Customer mobile must be a valid 10-digit number'),
  customerAddress: z.string().min(4, 'Customer address is required'),
  paidAmount: z.number().min(0),
});

const blankItem = (): ProductItem => ({
  id: crypto.randomUUID(),
  productName: productCatalog[0].productName,
  variant: productCatalog[0].variant,
  category: productCatalog[0].category,
  quantity: 1,
  unit: productCatalog[0].unit,
  mrp: productCatalog[0].mrp,
  price: productCatalog[0].mrp,
  discount: 0,
  total: productCatalog[0].mrp,
});

async function withTimeout<T>(label: string, promise: Promise<T>, timeoutMs = 25000) {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} is taking too long. Check Firebase setup and try again.`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

export default function InvoiceCreate() {
  const { user, employee } = useAuth();
  const [invoiceNumber, setInvoiceNumber] = useState('SNX-0000-000000');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGst, setCustomerGst] = useState('');
  const [customerInsight, setCustomerInsight] = useState('');
  const [items, setItems] = useState<ProductItem[]>([blankItem()]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    peekNextInvoiceNumber().then(setInvoiceNumber).catch(() => setInvoiceNumber('SNX-YYYY-000001'));
  }, []);

  const totals = useMemo(() => invoiceTotals(items, paidAmount), [items, paidAmount]);
  const availableCategories = useMemo(() => [...new Set(productCatalog.map((product) => product.category))], []);

  function updateItem(id: string, patch: Partial<ProductItem>) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        const total = itemTotal(next);
        const price = next.mrp - next.mrp * (next.discount / 100);
        return { ...next, price, total };
      }),
    );
  }

  function applyCatalogItem(id: string, product: (typeof productCatalog)[number]) {
    updateItem(id, {
      productName: product.productName,
      variant: product.variant,
      category: product.category,
      unit: product.unit,
      mrp: product.mrp,
      price: product.mrp,
    });
  }

  function selectCategory(id: string, category: string) {
    const product = productCatalog.find((item) => item.category === category) ?? productCatalog[0];
    applyCatalogItem(id, product);
  }

  function selectVariant(id: string, category: string, variantKey: string) {
    const product = productCatalog.find((item) => `${item.productName}|${item.variant}` === variantKey && item.category === category);
    if (product) applyCatalogItem(id, product);
  }

  async function fetchCustomer() {
    if (customerMobile.length !== 10) return;
    const customer = await getCustomerByMobile(customerMobile);
    if (customer) {
      setCustomerName(customer.customerName);
      setCustomerAddress(customer.address);
      setCustomerInsight(`${customer.previousOrders} previous orders | ${formatCurrency(customer.totalPurchase)} purchased | ${formatCurrency(customer.outstandingBalance)} outstanding`);
      toast.info('Existing customer loaded');
    }
  }

  async function generateInvoice() {
    const validation = invoiceSchema.safeParse({
      invoiceDate,
      customerName,
      customerMobile,
      customerAddress,
      paidAmount,
    });
    const rowError = items.some((item) => !item.productName || !item.variant || item.quantity <= 0 || item.mrp <= 0);
    if (!validation.success || rowError) {
      const errors = validation.success
        ? {}
        : Object.fromEntries(
            Object.entries(validation.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0] ?? 'Invalid value']),
          );
      if (rowError) errors.items = 'Each product row needs a product name, variant, quantity, and MRP';
      setFormErrors(errors);
      toast.error(Object.values(errors)[0] ?? 'Please complete invoice details and product rows');
      return;
    }
    setFormErrors({});

    setSaving(true);
    setSaveStep('Creating invoice number...');
    try {
      const actualInvoiceNumber = await withTimeout('Invoice number creation', nextInvoiceNumber(new Date(invoiceDate)));
      const vendor: Vendor = {
        vendorId: 'SNAXLAY',
        vendorName: snaxlayBusiness.name,
        mobile: snaxlayBusiness.mobile,
        address: snaxlayBusiness.address,
        gst: snaxlayBusiness.gstin,
        previousPurchases: 0,
        createdAt: { toDate: () => new Date() } as Vendor['createdAt'],
      };

      setSaveStep('Saving customer...');
      const customer = await withTimeout(
        'Customer save',
        upsertCustomer({
          customerName,
          mobile: customerMobile,
          address: customerAddress,
          grandTotal: totals.grandTotal,
          pendingAmount: totals.pendingAmount,
        }),
      );

      const sale: Sale = {
        invoiceId: actualInvoiceNumber,
        invoiceNumber: actualInvoiceNumber,
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        vendorMobile: vendor.mobile,
        vendorAddress: vendor.address,
        vendorGst: vendor.gst,
        customerId: customer.customerId,
        customerName,
        customerMobile,
        customerAddress,
        customerGst,
        invoiceDate,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        gst: totals.gst,
        grandTotal: totals.grandTotal,
        roundOff: totals.roundOff,
        paidAmount,
        pendingAmount: totals.pendingAmount,
        paymentMethod: paymentMethod as Sale['paymentMethod'],
        notes,
        status: totals.status,
        createdBy: user?.uid ?? '',
        employeeName: employee?.name ?? user?.email ?? 'Employee',
        timestamp: { toDate: () => new Date() } as Sale['timestamp'],
      };

      setSaveStep('Creating PDF...');
      const pdf = await withTimeout('PDF creation', createInvoicePdf(sale));

      setSaveStep('Saving sale...');
      await withTimeout('Sale save', saveSale(sale));

      setInvoiceNumber(actualInvoiceNumber);
      downloadPdf(pdf, `${actualInvoiceNumber}.pdf`);
      toast.success('Invoice saved and PDF downloaded');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invoice generation failed';
      toast.error(saveStep ? `${saveStep.replace(/\.\.\.$/, '')}: ${message}` : message);
    } finally {
      setSaving(false);
      setSaveStep('');
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">Create Invoice</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">MRP discount, GST included, local PDF download.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={generateInvoice} disabled={saving}>
          <FileCheck2 size={18} />
          {saving ? saveStep || 'Generating...' : 'Generate Invoice'}
        </button>
      </div>

      <section className="panel grid gap-4 lg:grid-cols-3">
        <Field label="Invoice Number"><input className="field" value={invoiceNumber} readOnly /></Field>
        <Field label="Invoice Date" error={formErrors.invoiceDate}><input className="field" type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} /></Field>
        <Field label="Payment Method">
          <select className="field" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            {paymentMethods.map((method) => <option key={method}>{method}</option>)}
          </select>
        </Field>
      </section>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="panel">
          <h2 className="text-lg font-black">Seller Details</h2>
          <div className="mt-3 space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <p className="text-xl font-black text-brand">{snaxlayBusiness.name}</p>
            <p>GSTIN: {snaxlayBusiness.gstin}</p>
            <p>FSSAI: {snaxlayBusiness.fssai}</p>
            <p>{snaxlayBusiness.address}</p>
          </div>
        </section>

        <section className="panel grid gap-3 sm:grid-cols-2">
          <h2 className="text-lg font-black sm:col-span-2">Customer Details</h2>
          <Field label="Mobile" error={formErrors.customerMobile}><input className="field" value={customerMobile} onBlur={fetchCustomer} onChange={(event) => setCustomerMobile(event.target.value)} /></Field>
          <Field label="Name" error={formErrors.customerName}><input className="field" value={customerName} onChange={(event) => setCustomerName(event.target.value)} /></Field>
          <Field label="Address" error={formErrors.customerAddress}><input className="field" value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} /></Field>
          <Field label="GST Optional"><input className="field" value={customerGst} onChange={(event) => setCustomerGst(event.target.value)} /></Field>
          {customerInsight ? <p className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-brand sm:col-span-2">{customerInsight}</p> : null}
        </section>
      </div>

      <section className="panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">Products</h2>
          <button className="btn-secondary shrink-0 px-3 sm:px-4" onClick={() => setItems((current) => [...current, blankItem()])}>
            <Plus size={18} />
            Add Product
          </button>
        </div>
        {formErrors.items ? <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-500">{formErrors.items}</p> : null}

        <div className="space-y-3 md:hidden">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-black">Item {index + 1}</p>
                <button className="icon-btn h-9 w-9" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} title="Remove product">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid gap-3">
                <Field label="Category">
                  <select className="field" value={item.category} onChange={(event) => selectCategory(item.id, event.target.value)}>
                    {availableCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </Field>
                <Field label="Product / Variant">
                  <select className="field" value={`${item.productName}|${item.variant}`} onChange={(event) => selectVariant(item.id, item.category, event.target.value)}>
                    {productCatalog.filter((product) => product.category === item.category).map((product) => (
                      <option key={`${product.productName}-${product.variant}`} value={`${product.productName}|${product.variant}`}>{product.productName} - {product.variant}</option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Qty"><input className="field" type="number" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) })} /></Field>
                  <Field label="Unit"><input className="field" value={item.unit} onChange={(event) => updateItem(item.id, { unit: event.target.value })} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="MRP"><input className="field" value={formatCurrency(item.mrp)} readOnly /></Field>
                  <Field label="Discount %"><input className="field" type="number" value={item.discount} onChange={(event) => updateItem(item.id, { discount: Number(event.target.value) })} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm font-bold dark:bg-slate-900">
                  <div>
                    <p className="text-xs uppercase text-slate-500">Rate</p>
                    <p>{formatCurrency(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-slate-500">Total</p>
                    <p>{formatCurrency(item.total)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
          <tr>{['Category', 'Product / Variant', 'Qty', 'Unit', 'MRP', 'Discount', 'Rate', 'Total', ''].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="p-2"><select className="field" value={item.category} onChange={(event) => selectCategory(item.id, event.target.value)}>{availableCategories.map((category) => <option key={category}>{category}</option>)}</select></td>
                  <td className="p-2">
                    <select className="field" value={`${item.productName}|${item.variant}`} onChange={(event) => selectVariant(item.id, item.category, event.target.value)}>
                      {productCatalog.filter((product) => product.category === item.category).map((product) => (
                        <option key={`${product.productName}-${product.variant}`} value={`${product.productName}|${product.variant}`}>{product.productName} - {product.variant}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2"><input className="field" type="number" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) })} /></td>
                  <td className="p-2"><input className="field" value={item.unit} onChange={(event) => updateItem(item.id, { unit: event.target.value })} /></td>
                  <td className="p-2"><input className="field" value={formatCurrency(item.mrp)} readOnly /></td>
                  <td className="p-2"><input className="field" type="number" value={item.discount} onChange={(event) => updateItem(item.id, { discount: Number(event.target.value) })} /></td>
                  <td className="p-2 font-semibold">{formatCurrency(item.price)}</td>
                  <td className="p-2 font-bold">{formatCurrency(item.total)}</td>
                  <td className="p-2"><button className="icon-btn" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} title="Remove product"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="panel">
          <Field label="Invoice Notes">
            <textarea className="field min-h-32" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Field>
          <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            PDFs are generated from saved invoice data and downloaded locally.
          </p>
        </section>
        <section className="panel space-y-3">
          <Summary label="Subtotal" value={totals.subtotal} />
          <Summary label="Discount" value={totals.discount} />
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-brand">GST is included in the MRP/rate.</p>
          <Summary label="Round Off" value={totals.roundOff} />
          <div className="border-t border-slate-200 pt-3 dark:border-slate-800"><Summary label="Grand Total" value={totals.grandTotal} strong /></div>
          <Field label="Paid Amount"><input className="field" type="number" value={paidAmount} onChange={(event) => setPaidAmount(Number(event.target.value))} /></Field>
          <Summary label="Pending Amount" value={totals.pendingAmount} strong />
        </section>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span> : null}
    </label>
  );
}

function Summary({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? 'text-lg font-black' : 'text-sm font-semibold'}`}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
