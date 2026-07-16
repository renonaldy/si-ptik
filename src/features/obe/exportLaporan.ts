import {
  kategoriLabel,
  TOTAL_SEMESTER,
  type CPL,
  type CPMK,
  type Course,
  type Curriculum,
  type Link,
} from "@/lib/api/obeApi";

// Everything the Laporan page already has on screen; exports render the same data.
export interface LaporanData {
  curriculum: Curriculum | null;
  courses: Course[];
  cpls: CPL[];
  cpmks: CPMK[];
  links: Link[];
}

const today = () => new Date().toISOString().slice(0, 10);

const fileStem = (c: Curriculum | null) =>
  `laporan-obe${c?.tahun ? `-${c.tahun}` : ""}-${today()}`;

// ── Row builders (shared by PDF & Excel so both stay in sync) ──

function strukturRows(courses: Course[]) {
  const rows: (string | number)[][] = [];
  for (let n = 1; n <= TOTAL_SEMESTER; n++) {
    for (const c of courses.filter((x) => x.semester === n)) {
      rows.push([`Semester ${n}`, c.kode || "—", c.nama, c.sks]);
    }
  }
  return rows;
}

const cplRows = (cpls: CPL[]) => cpls.map((c) => [c.kode || "—", kategoriLabel(c.kategori), c.deskripsi]);

function cpmkRows(cpmks: CPMK[], courses: Course[]) {
  const courseName = new Map(courses.map((c) => [c.id, c.nama]));
  return cpmks.map((m) => [
    courseName.get(m.course_id) ?? "—",
    m.kode || "—",
    m.level_bloom || "—",
    m.target || "—",
    m.deskripsi,
  ]);
}

// Matrix: header = ["CPMK", ...cpl codes]; body rows mark supported CPLs.
function mappingMatrix(data: LaporanData, mark: string) {
  const linked = new Set(data.links.map((l) => `${l.cpl_id}|${l.cpmk_id}`));
  const header = ["CPMK", ...data.cpls.map((c) => c.kode || "CPL")];
  const rows = data.cpmks.map((m) => [
    m.kode || "CPMK",
    ...data.cpls.map((c) => (linked.has(`${c.id}|${m.id}`) ? mark : "")),
  ]);
  return { header, rows };
}

// ── PDF (jsPDF + autotable, dynamically imported to keep the main bundle lean) ──

export async function exportLaporanPdf(data: LaporanData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 14;
  const totalSks = data.courses.reduce((a, c) => a + c.sks, 0);

  // Header
  doc.setFont("helvetica", "bold").setFontSize(15);
  doc.text("Laporan Kurikulum OBE", M, 18);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(90);
  const sub = data.curriculum
    ? `${data.curriculum.nama}${data.curriculum.tahun ? ` · Tahun ${data.curriculum.tahun}` : ""}${data.curriculum.nomor_sk ? ` · SK ${data.curriculum.nomor_sk}` : ""}`
    : "Program Studi PTIK";
  doc.text(sub, M, 24);
  doc.text(`Program Studi PTIK — dicetak ${today()}`, W - M, 24, { align: "right" });
  doc.setTextColor(0);

  const section = (title: string, startY: number) => {
    doc.setFont("helvetica", "bold").setFontSize(12);
    doc.text(title, M, startY);
    return startY + 4;
  };
  // Violet header to echo the app chrome.
  const headStyles = { fillColor: [124, 58, 237] as [number, number, number] };
  const bottomOf = () =>
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // 1 — Struktur Kurikulum
  let y = section(`1. Struktur Kurikulum (total ${totalSks} SKS)`, 34);
  autoTable(doc, {
    startY: y,
    head: [["Semester", "Kode", "Mata Kuliah", "SKS"]],
    body: strukturRows(data.courses),
    margin: { left: M, right: M },
    styles: { fontSize: 8.5, cellPadding: 1.8 },
    headStyles,
  });

  // 2 — CPL
  y = section("2. Capaian Pembelajaran Lulusan (CPL)", bottomOf() + 10);
  autoTable(doc, {
    startY: y,
    head: [["Kode", "Kategori", "Deskripsi"]],
    body: cplRows(data.cpls),
    margin: { left: M, right: M },
    styles: { fontSize: 8.5, cellPadding: 1.8 },
    headStyles,
  });

  // 3 — CPMK
  y = section("3. Capaian Pembelajaran Mata Kuliah (CPMK)", bottomOf() + 10);
  autoTable(doc, {
    startY: y,
    head: [["Mata Kuliah", "Kode", "Bloom", "Target", "Deskripsi"]],
    body: cpmkRows(data.cpmks, data.courses),
    margin: { left: M, right: M },
    styles: { fontSize: 8.5, cellPadding: 1.8 },
    headStyles,
  });

  // 4 — Mapping matrix ("•" — helvetica/WinAnsi has no ✓ glyph)
  const { header, rows } = mappingMatrix(data, "•");
  y = section("4. Matriks Pemetaan CPL – CPMK", bottomOf() + 10);
  autoTable(doc, {
    startY: y,
    head: [header],
    body: rows,
    margin: { left: M, right: M },
    styles: { fontSize: 8.5, cellPadding: 1.8, halign: "center" },
    columnStyles: { 0: { halign: "left" } },
    headStyles,
  });

  doc.save(`${fileStem(data.curriculum)}.pdf`);
}

// ── Excel (SheetJS): one workbook, four sheets ──

export async function exportLaporanExcel(data: LaporanData) {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();
  const addSheet = (name: string, header: (string | number)[], rows: (string | number)[][], colWidths: number[]) => {
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws["!cols"] = colWidths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  addSheet("Struktur Kurikulum", ["Semester", "Kode", "Mata Kuliah", "SKS"], strukturRows(data.courses), [12, 10, 45, 6]);
  addSheet("CPL", ["Kode", "Kategori", "Deskripsi"], cplRows(data.cpls), [10, 20, 80]);
  addSheet(
    "CPMK",
    ["Mata Kuliah", "Kode", "Level Bloom", "Target", "Deskripsi"],
    cpmkRows(data.cpmks, data.courses),
    [30, 10, 12, 10, 70],
  );
  const { header, rows } = mappingMatrix(data, "✓");
  addSheet("Mapping CPL-CPMK", header, rows, [14, ...data.cpls.map(() => 8)]);

  XLSX.writeFile(wb, `${fileStem(data.curriculum)}.xlsx`);
}
