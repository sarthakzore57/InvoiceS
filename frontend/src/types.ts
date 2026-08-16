import type { Timestamp } from 'firebase/firestore';

export type Role = 'employee' | 'admin';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Partial';

export type Employee = {
  uid: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  createdAt: Timestamp;
};

export type Vendor = {
  vendorId: string;
  vendorName: string;
  mobile: string;
  address: string;
  gst?: string;
  previousPurchases?: number;
  createdAt: Timestamp;
};

export type Customer = {
  customerId: string;
  customerName: string;
  mobile: string;
  address: string;
  totalPurchase: number;
  previousOrders: number;
  outstandingBalance: number;
  createdAt: Timestamp;
};

export type ProductItem = {
  id: string;
  productName: string;
  variant: string;
  category: string;
  quantity: number;
  unit: string;
  mrp: number;
  price: number;
  discount: number;
  total: number;
};

export type Sale = {
  id?: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  vendorMobile?: string;
  vendorAddress?: string;
  vendorGst?: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  customerGst?: string;
  invoiceDate: string;
  items: ProductItem[];
  subtotal: number;
  discount: number;
  gst: number;
  grandTotal: number;
  roundOff: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: InvoiceStatus;
  createdBy: string;
  employeeName: string;
  timestamp: Timestamp;
};

export type DashboardMetrics = {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalVendors: number;
};

export const categories = [
  'Almondes',
  'Salted Cashews',
  'Peri-Peri Cashew',
  'Black Pepper Cashews',
  'Black Raisins',
  'Cashews',
  'GE Raisins',
  'Mix Raisins',
  'Panchmava',
  'Raisins',
  'Dates Black',
  'Dates',
  'GE Almondes',
  'GE Black Raisins',
  'GE Cashews',
] as const;
export const paymentMethods: PaymentMethod[] = ['Cash', 'UPI', 'Card', 'Bank Transfer'];
export const snaxlayBusiness = {
  name: 'Snaxlay',
  tagline: 'HEALTH CON - SNACKS',
  gstin: '27IKIPM3057B1Z5',
  fssai: '21525079002191',
  mobile: '9022982346',
  address: 'No.16/5, Ambegaon Pathar, Tiranga Nagar, Near Kamal Kunj Building, Ambegaon, Pune, Maharashtra - 411046',
  state: 'Maharashtra',
  stateCode: '27',
  phone: '+91 84461 50946',
  email: 'snaxlay@gmail.com',
  website: 'www.snaxlay.com',
  bankName: 'MGB',
  ifsc: 'MAH0004515',
  accountNo: '80078125311',
  accountHolder: 'SNAXLAY',
} as const;
export const productCatalog = [
  { productName: 'Almondes', variant: '160g', category: 'Almondes', unit: 'Pcs' },
  { productName: 'Almondes', variant: '200g', category: 'Almondes', unit: 'Pcs' },
  { productName: 'Almondes', variant: '250g', category: 'Almondes', unit: 'Pcs' },
  { productName: 'Almondes', variant: '425g', category: 'Almondes', unit: 'Pcs' },
  { productName: 'Almondes', variant: '500g', category: 'Almondes', unit: 'Pcs' },
  { productName: 'Almondes', variant: '900g', category: 'Almondes', unit: 'Pcs' },
  { productName: 'Almondes', variant: '1000g', category: 'Almondes', unit: 'Pcs' },
  { productName: 'Salted Cashews', variant: '160g', category: 'Salted Cashews', unit: 'Pcs' },
  { productName: 'Salted Cashews', variant: '200g', category: 'Salted Cashews', unit: 'Pcs' },
  { productName: 'Peri-Peri Cashew', variant: '160g', category: 'Peri-Peri Cashew', unit: 'Pcs' },
  { productName: 'Peri-Peri Cashew', variant: '200g', category: 'Peri-Peri Cashew', unit: 'Pcs' },
  { productName: 'Black Pepper Cashews', variant: '160g', category: 'Black Pepper Cashews', unit: 'Pcs' },
  { productName: 'Black Pepper Cashews', variant: '200g', category: 'Black Pepper Cashews', unit: 'Pcs' },
  { productName: 'Black Raisins', variant: '160g', category: 'Black Raisins', unit: 'Pcs' },
  { productName: 'Black Raisins', variant: '200g', category: 'Black Raisins', unit: 'Pcs' },
  { productName: 'Black Raisins', variant: '250g', category: 'Black Raisins', unit: 'Pcs' },
  { productName: 'Black Raisins', variant: '425g', category: 'Black Raisins', unit: 'Pcs' },
  { productName: 'Black Raisins', variant: '500g', category: 'Black Raisins', unit: 'Pcs' },
  { productName: 'Black Raisins', variant: '900g', category: 'Black Raisins', unit: 'Pcs' },
  { productName: 'Black Raisins', variant: '1000g', category: 'Black Raisins', unit: 'Pcs' },
  { productName: 'Cashews', variant: '160g', category: 'Cashews', unit: 'Pcs' },
  { productName: 'Cashews', variant: '200g', category: 'Cashews', unit: 'Pcs' },
  { productName: 'Cashews', variant: '250g', category: 'Cashews', unit: 'Pcs' },
  { productName: 'Cashews', variant: '425g', category: 'Cashews', unit: 'Pcs' },
  { productName: 'Cashews', variant: '500g', category: 'Cashews', unit: 'Pcs' },
  { productName: 'Cashews', variant: '900g', category: 'Cashews', unit: 'Pcs' },
  { productName: 'Cashews', variant: '1000g', category: 'Cashews', unit: 'Pcs' },
  { productName: 'GE Raisins', variant: '160g', category: 'GE Raisins', unit: 'Pcs' },
  { productName: 'GE Raisins', variant: '200g', category: 'GE Raisins', unit: 'Pcs' },
  { productName: 'GE Raisins', variant: '250g', category: 'GE Raisins', unit: 'Pcs' },
  { productName: 'GE Raisins', variant: '425g', category: 'GE Raisins', unit: 'Pcs' },
  { productName: 'GE Raisins', variant: '500g', category: 'GE Raisins', unit: 'Pcs' },
  { productName: 'GE Raisins', variant: '900g', category: 'GE Raisins', unit: 'Pcs' },
  { productName: 'GE Raisins', variant: '1000g', category: 'GE Raisins', unit: 'Pcs' },
  { productName: 'Mix Raisins', variant: '160g', category: 'Mix Raisins', unit: 'Pcs' },
  { productName: 'Mix Raisins', variant: '200g', category: 'Mix Raisins', unit: 'Pcs' },
  { productName: 'Mix Raisins', variant: '250g', category: 'Mix Raisins', unit: 'Pcs' },
  { productName: 'Mix Raisins', variant: '425g', category: 'Mix Raisins', unit: 'Pcs' },
  { productName: 'Mix Raisins', variant: '500g', category: 'Mix Raisins', unit: 'Pcs' },
  { productName: 'Mix Raisins', variant: '900g', category: 'Mix Raisins', unit: 'Pcs' },
  { productName: 'Mix Raisins', variant: '1000g', category: 'Mix Raisins', unit: 'Pcs' },
  { productName: 'Panchmava', variant: '160g', category: 'Panchmava', unit: 'Pcs' },
  { productName: 'Panchmava', variant: '200g', category: 'Panchmava', unit: 'Pcs' },
  { productName: 'Panchmava', variant: '250g', category: 'Panchmava', unit: 'Pcs' },
  { productName: 'Panchmava', variant: '425g', category: 'Panchmava', unit: 'Pcs' },
  { productName: 'Panchmava', variant: '500g', category: 'Panchmava', unit: 'Pcs' },
  { productName: 'Panchmava', variant: '900g', category: 'Panchmava', unit: 'Pcs' },
  { productName: 'Panchmava', variant: '1000g', category: 'Panchmava', unit: 'Pcs' },
  { productName: 'Raisins', variant: '160g', category: 'Raisins', unit: 'Pcs' },
  { productName: 'Raisins', variant: '200g', category: 'Raisins', unit: 'Pcs' },
  { productName: 'Raisins', variant: '250g', category: 'Raisins', unit: 'Pcs' },
  { productName: 'Raisins', variant: '425g', category: 'Raisins', unit: 'Pcs' },
  { productName: 'Raisins', variant: '500g', category: 'Raisins', unit: 'Pcs' },
  { productName: 'Raisins', variant: '900g', category: 'Raisins', unit: 'Pcs' },
  { productName: 'Raisins', variant: '1000g', category: 'Raisins', unit: 'Pcs' },
  { productName: 'Dates Black', variant: '160g', category: 'Dates Black', unit: 'Pcs' },
  { productName: 'Dates Black', variant: '200g', category: 'Dates Black', unit: 'Pcs' },
  { productName: 'Dates Black', variant: '250g', category: 'Dates Black', unit: 'Pcs' },
  { productName: 'Dates Black', variant: '400g', category: 'Dates Black', unit: 'Pcs' },
  { productName: 'Dates Black', variant: '425g', category: 'Dates Black', unit: 'Pcs' },
  { productName: 'Dates Black', variant: '500g', category: 'Dates Black', unit: 'Pcs' },
  { productName: 'Dates Black', variant: '900g', category: 'Dates Black', unit: 'Pcs' },
  { productName: 'Dates Black', variant: '1000g', category: 'Dates Black', unit: 'Pcs' },
  { productName: 'Dates', variant: '160g', category: 'Dates', unit: 'Pcs' },
  { productName: 'Dates', variant: '200g', category: 'Dates', unit: 'Pcs' },
  { productName: 'Dates', variant: '250g', category: 'Dates', unit: 'Pcs' },
  { productName: 'Dates', variant: '400g', category: 'Dates', unit: 'Pcs' },
  { productName: 'Dates', variant: '425g', category: 'Dates', unit: 'Pcs' },
  { productName: 'Dates', variant: '500g', category: 'Dates', unit: 'Pcs' },
  { productName: 'Dates', variant: '900g', category: 'Dates', unit: 'Pcs' },
  { productName: 'Dates', variant: '1000g', category: 'Dates', unit: 'Pcs' },
  { productName: 'GE Almondes', variant: '160g', category: 'GE Almondes', unit: 'Pcs' },
  { productName: 'GE Almondes', variant: '200g', category: 'GE Almondes', unit: 'Pcs' },
  { productName: 'GE Almondes', variant: '250g', category: 'GE Almondes', unit: 'Pcs' },
  { productName: 'GE Almondes', variant: '425g', category: 'GE Almondes', unit: 'Pcs' },
  { productName: 'GE Almondes', variant: '500g', category: 'GE Almondes', unit: 'Pcs' },
  { productName: 'GE Almondes', variant: '900g', category: 'GE Almondes', unit: 'Pcs' },
  { productName: 'GE Almondes', variant: '1000g', category: 'GE Almondes', unit: 'Pcs' },
  { productName: 'GE Black Raisins', variant: '160g', category: 'GE Black Raisins', unit: 'Pcs' },
  { productName: 'GE Black Raisins', variant: '200g', category: 'GE Black Raisins', unit: 'Pcs' },
  { productName: 'GE Black Raisins', variant: '250g', category: 'GE Black Raisins', unit: 'Pcs' },
  { productName: 'GE Black Raisins', variant: '425g', category: 'GE Black Raisins', unit: 'Pcs' },
  { productName: 'GE Black Raisins', variant: '500g', category: 'GE Black Raisins', unit: 'Pcs' },
  { productName: 'GE Black Raisins', variant: '900g', category: 'GE Black Raisins', unit: 'Pcs' },
  { productName: 'GE Black Raisins', variant: '1000g', category: 'GE Black Raisins', unit: 'Pcs' },
  { productName: 'GE Cashews', variant: '160g', category: 'GE Cashews', unit: 'Pcs' },
  { productName: 'GE Cashews', variant: '200g', category: 'GE Cashews', unit: 'Pcs' },
] as const;
