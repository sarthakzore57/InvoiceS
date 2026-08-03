import * as XLSX from 'xlsx';
import type { Sale } from '../types';

export function exportSalesToExcel(sales: Sale[]) {
  const rows = sales.flatMap((sale) =>
    sale.items.map((item) => ({
      'Invoice Number': sale.invoiceNumber,
      Date: sale.invoiceDate,
      Vendor: sale.vendorName,
      Customer: sale.customerName,
      Category: item.category,
      Products: item.productName,
      Variant: item.variant,
      Quantity: item.quantity,
      MRP: item.mrp,
      'Discount %': item.discount,
      Rate: item.price,
      Subtotal: sale.subtotal,
      'GST Included': 'Yes',
      Total: sale.grandTotal,
      'Payment Method': sale.paymentMethod,
      Employee: sale.employeeName,
    })),
  );
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
  XLSX.writeFile(workbook, 'sales_report.xlsx');
}
