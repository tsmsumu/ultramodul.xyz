import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";

export type ExportFormat = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'json' | 'txt' | 'html';

export interface ExportColumn {
  header: string;
  key: string;
}

export interface ExportOptions {
  filename: string;
  title: string;
  columns: ExportColumn[];
  data: any[];
}

export async function exportData(format: ExportFormat, options: ExportOptions) {
  const { filename, title, columns, data } = options;

  switch (format) {
    case 'json': {
      const jsonStr = JSON.stringify(data, null, 2);
      downloadFile(jsonStr, `${filename}.json`, 'application/json');
      break;
    }
    case 'txt': {
      let txtStr = `${title}\n`;
      txtStr += `Generated: ${new Date().toLocaleString()}\n\n`;
      data.forEach(row => {
        columns.forEach(col => {
          txtStr += `${col.header}: ${row[col.key]}\n`;
        });
        txtStr += `---------------------------\n`;
      });
      downloadFile(txtStr, `${filename}.txt`, 'text/plain');
      break;
    }
    case 'csv': {
      const headerRow = columns.map(c => c.header).join(',');
      const rows = data.map(row => 
        columns.map(c => {
          let val = String(row[c.key] || '').replace(/"/g, '""');
          if (val.includes(',') || val.includes('\n')) val = `"${val}"`;
          return val;
        }).join(',')
      );
      const csvStr = [headerRow, ...rows].join('\n');
      downloadFile(csvStr, `${filename}.csv`, 'text/csv');
      break;
    }
    case 'html': {
      let htmlStr = `<!DOCTYPE html><html><head><title>${title}</title><style>table { border-collapse: collapse; width: 100%; font-family: sans-serif; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style></head><body>`;
      htmlStr += `<h2>${title}</h2><p>Generated: ${new Date().toLocaleString()}</p>`;
      htmlStr += `<table><thead><tr>`;
      columns.forEach(c => { htmlStr += `<th>${c.header}</th>`; });
      htmlStr += `</tr></thead><tbody>`;
      data.forEach(row => {
        htmlStr += `<tr>`;
        columns.forEach(c => { htmlStr += `<td>${row[c.key] || ''}</td>`; });
        htmlStr += `</tr>`;
      });
      htmlStr += `</tbody></table></body></html>`;
      downloadFile(htmlStr, `${filename}.html`, 'text/html');
      break;
    }
    case 'xlsx': {
      const wsData = [columns.map(c => c.header)];
      data.forEach(row => {
        wsData.push(columns.map(c => row[c.key]));
      });
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Logbook");
      XLSX.writeFile(wb, `${filename}.xlsx`);
      break;
    }
    case 'pdf': {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(title, 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      
      const head = [columns.map(c => c.header)];
      const body = data.map(row => columns.map(c => row[c.key]));
      
      autoTable(doc, {
        startY: 35,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8, cellPadding: 2 }
      });
      
      doc.save(`${filename}.pdf`);
      break;
    }
    case 'docx': {
      const tableRows = [
        new TableRow({
          children: columns.map(c => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: c.header, bold: true })] })] }))
        })
      ];

      data.forEach(row => {
        tableRows.push(new TableRow({
          children: columns.map(c => new TableCell({ children: [new Paragraph({ text: String(row[c.key] || '') })] }))
        }));
      });

      const docxDoc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 32 })] }),
            new Paragraph({ text: `Generated: ${new Date().toLocaleString()}` }),
            new Paragraph({ text: "" }),
            new Table({ rows: tableRows, width: { size: 100, type: "pct" } })
          ]
        }]
      });

      const blob = await Packer.toBlob(docxDoc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      break;
    }
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
