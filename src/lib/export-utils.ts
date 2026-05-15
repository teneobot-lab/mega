import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export function exportToExcel(data: any[], fileName: string, sheetName: string = "Data") {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
}

export function exportToPDF(columns: string[], data: any[][], title: string, fileName: string) {
  const doc = jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.text("PT ACCURATE LOCAL REPLICA", 14, 22);
  doc.setFontSize(11);
  doc.text(title, 14, 30);
  doc.text(`Dicetak pada: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 36);

  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 45,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [185, 28, 28] } // bg-red-700
  });

  doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
}
