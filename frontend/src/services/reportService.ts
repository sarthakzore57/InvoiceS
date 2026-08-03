import { startOfDay, startOfMonth, startOfWeek, startOfYear, format } from 'date-fns';
import type { DashboardMetrics, Sale } from '../types';

export function todayMetrics(sales: Sale[], vendorCount: number, customerCount: number): DashboardMetrics {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysSales = sales.filter((sale) => sale.invoiceDate === today);
  return {
    totalOrders: todaysSales.length,
    totalRevenue: todaysSales.reduce((sum, sale) => sum + sale.grandTotal, 0),
    totalCustomers: customerCount,
    totalVendors: vendorCount,
  };
}

export function groupedSales(sales: Sale[], range: 'daily' | 'weekly' | 'monthly' | 'yearly') {
  const starts = {
    daily: startOfDay,
    weekly: startOfWeek,
    monthly: startOfMonth,
    yearly: startOfYear,
  };
  const map = new Map<string, number>();
  sales.forEach((sale) => {
    const key = format(starts[range](new Date(sale.invoiceDate)), range === 'yearly' ? 'yyyy' : 'dd MMM yyyy');
    map.set(key, (map.get(key) ?? 0) + sale.grandTotal);
  });
  return Array.from(map.entries()).reverse().map(([label, revenue]) => ({ label, revenue }));
}

export function categorySales(sales: Sale[]) {
  const totals = new Map<string, { quantity: number; revenue: number }>();
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const current = totals.get(item.category) ?? { quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.total;
      totals.set(item.category, current);
    });
  });
  const revenueTotal = Array.from(totals.values()).reduce((sum, item) => sum + item.revenue, 0) || 1;
  return Array.from(totals.entries()).map(([category, value]) => ({
    category,
    quantity: value.quantity,
    revenue: value.revenue,
    percentage: Math.round((value.revenue / revenueTotal) * 100),
  }));
}

export function reportCards(sales: Sale[]) {
  const vendorRevenue = new Map<string, number>();
  const customerRevenue = new Map<string, number>();
  const productRevenue = new Map<string, number>();
  const productQuantity = new Map<string, number>();

  sales.forEach((sale) => {
    vendorRevenue.set(sale.vendorName, (vendorRevenue.get(sale.vendorName) ?? 0) + sale.grandTotal);
    customerRevenue.set(sale.customerName, (customerRevenue.get(sale.customerName) ?? 0) + sale.grandTotal);
    sale.items.forEach((item) => {
      productRevenue.set(item.productName, (productRevenue.get(item.productName) ?? 0) + item.total);
      productQuantity.set(item.productName, (productQuantity.get(item.productName) ?? 0) + item.quantity);
    });
  });

  const top = (map: Map<string, number>) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

  return {
    topVendors: top(vendorRevenue),
    topCustomers: top(customerRevenue),
    mostSoldProducts: top(productQuantity),
    highestRevenueProducts: top(productRevenue),
  };
}
