import type { Timestamp } from 'firebase/firestore';

export type Role = 'employee' | 'admin';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Partial';
export type SaleLifecycleStatus = 'Pending' | 'Complete';

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
  createdBy: string;
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

export type CatalogProduct = {
  id: string;
  productName: string;
  variant: string;
  category: string;
  unit: string;
  mrp: number;
};

export type Area = {
  id?: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
};

export type Outlet = {
  id?: string;
  areaId: string;
  areaName: string;
  shopName: string;
  contactNumber: string;
  gst?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  grade?: 'A' | 'B' | 'C';
  createdBy: string;
  createdAt: Timestamp;
};

export type VisitRecord = {
  id?: string;
  outletId: string;
  outletName: string;
  areaId: string;
  areaName: string;
  note: string;
  hasOrder: boolean;
  proposedItems?: ProductItem[];
  createdBy: string;
  employeeName: string;
  visitedAt: Timestamp;
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
  saleStatus: SaleLifecycleStatus;
  outletId?: string;
  outletName?: string;
  areaId?: string;
  areaName?: string;
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
  'Trifusion',
] as const;
export const paymentMethods: PaymentMethod[] = ['Cash', 'UPI', 'Card', 'Bank Transfer'];
export const snaxlayBusiness = {
  name: 'Snaxlay',
  tagline: 'HEALTH CON - SNACKS',
  gstin: '27IKIPM3057B1Z5',
  fssai: '21525079002191',
  mobile: '9075190946',
  address: 'No.16/5, Ambegaon Pathar, Tiranga Nagar, Near Kamal Kunj Building, Ambegaon, Pune, Maharashtra - 411046',
  state: 'Maharashtra',
  stateCode: '27',
  phone: '+91 90751 90946',
  email: 'snaxlay@gmail.com',
  website: 'www.snaxlay.com',
  bankName: 'MGB',
  ifsc: 'MAH0004515',
  accountNo: '80078125311',
  accountHolder: 'SNAXLAY',
} as const;
const catalogEntry = (productName: string, weight: number, mrp: number): CatalogProduct => ({
  id: `${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${weight}`,
  productName,
  variant: `${weight}g`,
  category: productName,
  unit: 'Pcs',
  mrp,
});

export const productCatalog: CatalogProduct[] = [
  ['Almondes', [[160,251.625],[200,309.375],[250,381.5625],[425,634.21875],[500,742.5],[900,1320],[1000,8.25]]],
  ['salted cashews', [[160,261.45]]], ['salted cashew', [[200,308]]],
  ['pari-pari cashew', [[160,249.2],[200,308]]], ['Black Papper Cashews', [[160,245.7],[200,308]]],
  ['Black Raises', [[160,79.475],[200,95.09375],[250,117.40625],[425,195.075],[500,224.08125],[900,386.64375],[1000,426.80625]]],
  ['cashews w400', [[160,217.18125],[200,267.7125],[250,329.79375],[425,549.24375],[500,644.53125],[900,1151.08125],[1000,1276.6875]]],
  ['GE Rasies', [[160,102.76],[200,124.075],[250,150.71875],[425,243.971875],[500,283.9375],[900,497.0875],[1000,550.375]]],
  ['Mix Raisins', [[160,71.33],[200,85.6625],[250,103.578125],[425,166.2828125],[500,193.15625],[900,336.48125],[1000,372.3125]]],
  ['Panchmava', [[160,168],[200,204.75],[250,250.6875],[425,352.1175],[500,480.375],[900,847.875],[1000,952.6125]]],
  ['Rasies', [[160,116.018],[200,140.7875],[250,172.025],[425,284.1125],[500,331.8875],[900,587.3],[1000,651.6125]]],
  ['Dates black', [[160,90.5625],[200,107.1],[250,127.3125],[400,187.95],[425,198.05625],[500,228.375],[900,390.075],[1000,430.5]]],
  ['Dates', [[160,85.05],[200,99.75],[250,118.125],[400,173.25],[425,182.4375],[500,210],[900,357],[1000,393.75]]],
  ['GE Almondes', [[160,193.05],[200,239.25],[250,299.75],[425,501.875],[500,588.5],[900,1050.5],[1000,1178.375]]],
  ['GE Black Raises', [[160,68.558],[200,78.26],[250,90.3875],[425,113.58375],[500,131.775],[900,232.295],[1000,256.55]]],
  ['GE Cashews', [[160,195.8],[200,242],[250,302.5],[425,504.625],[500,591.25],[900,1053.25],[1000,1168.75]]],
  ['Trifusion', [[160,232.4875],[200,285.775],[250,353.7625],[425,588.9625],[500,690.025],[900,1226.575],[1000,1362.55]]],
  ['GE Mx Raises', [[160,74.83],[200,89.1625],[250,107.078125],[425,169.7828125],[500,138.775],[900,235.795],[1000,260.05]]],
].flatMap(([name, values]) => (values as number[][]).map(([weight, mrp]) => catalogEntry(name as string, weight, mrp)));
