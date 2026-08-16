import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { snaxlayBusiness, type Sale } from '../types';
import { rupeesInWords } from './numberToWords';

function money(value: number) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN');
}

export async function createInvoicePdf(sale: Sale) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const business = snaxlayBusiness;

  const qrData = await QRCode.toDataURL(`${sale.invoiceNumber}|${sale.grandTotal}|${sale.invoiceDate}|${business.gstin}`);
  const line = (y: number) => doc.line(36, y, 559, y);

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(business.name.toUpperCase(), 40, 58);
  doc.setFontSize(8);
  doc.text(business.tagline, 74, 72);

  doc.setFontSize(17);
  doc.text('TAX INVOICE', 246, 58);
  doc.addImage(qrData, 'PNG', 476, 28, 70, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`GSTIN     ${business.gstin}`, 40, 96);
  doc.text(`FSSAI     ${business.fssai}`, 40, 110);
  doc.text(`Phone     ${business.phone}`, 40, 124);
  line(136);

  autoTable(doc, {
    startY: 146,
    theme: 'grid',
    margin: { left: 36, right: 36 },
    styles: { fontSize: 8, cellPadding: 5, lineColor: [40, 40, 40], lineWidth: 0.6, textColor: [0, 0, 0] },
    columnStyles: { 0: { cellWidth: 275 }, 1: { cellWidth: 248 } },
    body: [
      [
        {
          content: [
            'BILL TO',
            sale.customerName,
            sale.customerAddress || 'Address not provided',
            `Mobile: ${sale.customerMobile}`,
            `GSTIN/UIN: ${sale.customerGst || '-'}`,
            `State Name: ${business.state}, Code ${business.stateCode}`,
          ].join('\n'),
          styles: { fontStyle: 'bold' },
        },
        [
          `Invoice No.       ${sale.invoiceNumber}`,
          `Dated             ${dateLabel(sale.invoiceDate)}`,
          `Mode/Terms        ${sale.paymentMethod}`,
          `Reference No.     ${sale.invoiceNumber}`,
          `Buyer's Order No. -`,
          `Destination       ${sale.customerAddress || '-'}`,
        ].join('\n'),
      ],
    ],
  });

  autoTable(doc, {
    startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY,
    theme: 'grid',
    margin: { left: 36, right: 36 },
    head: [['Sl. No.', 'Description of Goods', 'Quantity', 'MRP', 'Rate', 'Amount']],
    body: sale.items.map((item, index) => [
      index + 1,
      `${item.productName}${item.variant ? ` ${item.variant}` : ''}`,
      `${item.quantity.toLocaleString('en-IN')} ${item.unit}`,
      money(item.mrp ?? item.price),
      money(item.price),
      money(item.total),
    ]),
    foot: [['', 'Total', `${sale.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('en-IN')} Pcs`, money(sale.subtotal), '', money(sale.grandTotal)]],
    styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 4, lineColor: [40, 40, 40], lineWidth: 0.6, textColor: [0, 0, 0], overflow: 'linebreak' },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
    footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 32 },
      1: { cellWidth: 206 },
      2: { halign: 'right', cellWidth: 62 },
      3: { halign: 'right', cellWidth: 72 },
      4: { halign: 'right', cellWidth: 70 },
      5: { halign: 'right', cellWidth: 83 },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Chargeable (in words)', 40, finalY);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${rupeesInWords(sale.grandTotal).replace(' Rupees Only', ' Only')}`, 40, finalY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text('GST is included in the MRP/rate. No separate GST amount is charged on this invoice.', 40, finalY + 34);

  autoTable(doc, {
    startY: finalY + 50,
    theme: 'grid',
    margin: { left: 36, right: 320 },
    body: [
      [{ content: 'BANK DETAILS', colSpan: 2, styles: { fontStyle: 'bold' } }],
      ['Bank Name', business.bankName],
      ['Account No.', business.accountNo],
      ['IFSC Code', business.ifsc],
      ['Account Holder', business.accountHolder],
    ],
    styles: { fontSize: 8, cellPadding: 4, lineColor: [40, 40, 40], lineWidth: 0.6, textColor: [0, 0, 0] },
  });

  doc.setFont('helvetica', 'bold');
  doc.text(`For ${business.name} ${business.tagline}`, 398, finalY + 78);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised Signatory', 430, finalY + 132);

  line(738);
  doc.setFontSize(7);
  doc.text(`${business.phone}    ${business.website}    ${business.email}`, 40, 756);
  doc.text(business.address, 40, 770, { maxWidth: 500 });
  doc.text('This is a Computer Generated Invoice', 226, 790);

  return doc;
}

export function downloadPdf(doc: jsPDF, fileName: string) {
  doc.save(fileName);
}
