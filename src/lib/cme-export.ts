import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Record as CMERecord } from "./cme-data";
import { SECTORS } from "./cme-data";

function rows(data: CMERecord[]) {
  return data.map((r) => ({
    Data: r.date.toLocaleDateString("pt-BR"),
    Material: r.material,
    Internação: r.sectors["Internação"],
    Emergência: r.sectors["Emergência"],
    "Centro Cirúrgico": r.sectors["Centro Cirúrgico"],
    "Saúde Mental": r.sectors["Saúde Mental"],
    Total: r.total,
  }));
}

export function exportExcel(data: CMERecord[]) {
  const ws = XLSX.utils.json_to_sheet(rows(data));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "CME");
  XLSX.writeFile(wb, `cme-${Date.now()}.xlsx`);
}

export function exportCSV(data: CMERecord[]) {
  const ws = XLSX.utils.json_to_sheet(rows(data));
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `cme-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(data: CMERecord[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("CME — Relatório de Materiais Desinfectados", 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")} · ${data.length} registros`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [["Data", "Material", ...SECTORS, "Total"]],
    body: rows(data).map((r) => [
      r.Data, r.Material, r.Internação, r.Emergência, r["Centro Cirúrgico"], r["Saúde Mental"], r.Total,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 100, 130] },
  });
  doc.save(`cme-${Date.now()}.pdf`);
}
