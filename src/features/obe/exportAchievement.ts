import type { ClassResults, ScoreMatrix } from "@/lib/api/obeApi";
import { jenisAssessmentLabel } from "@/lib/api/obeApi";

// Everything the Achievement page already shows; both exports render the same data.
export interface AchievementExportData {
  results: ClassResults;
  matrix: ScoreMatrix;
}

const today = () => new Date().toISOString().slice(0, 10);
const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;

const fileStem = (d: AchievementExportData) => {
  const mk = d.results.course.kode || d.results.course.nama;
  return `rekap-obe-${mk}-kelas-${d.results.class.nama}-${today()}`.replace(/\s+/g, "-").toLowerCase();
};

// ── Row builders (shared by PDF & Excel) ──

function headerInfo(d: AchievementExportData): string[][] {
  const c = d.results.class;
  return [
    ["Mata Kuliah", `${d.results.course.kode ? d.results.course.kode + " — " : ""}${d.results.course.nama}`],
    ["Kelas", `${c.nama}${c.tahun_akademik ? ` · ${c.tahun_akademik}` : ""}${c.periode ? ` · ${c.periode}` : ""}`],
    ["Dosen Pengampu", c.dosen_nama || "—"],
    ["Threshold", `${d.results.threshold}%`],
    ["Total Bobot Assessment", `${d.results.bobot_total}%`],
  ];
}

function ringkasanRows(d: AchievementExportData) {
  const r = d.results;
  const label = (refId: string, list: { id: string; kode: string }[]) =>
    list.find((x) => x.id === refId)?.kode || refId;
  const rows: (string | number)[][] = [];
  for (const a of r.class_cpmk) rows.push(["CPMK", label(a.ref_id, r.cpmks), a.nilai, `${a.tercapai}/${a.dinilai}`]);
  for (const a of r.class_cpl) rows.push(["CPL", label(a.ref_id, r.cpls), a.nilai, `${a.tercapai}/${a.dinilai}`]);
  for (const a of r.class_ik) rows.push(["IK", label(a.ref_id, r.iks), a.nilai, `${a.tercapai}/${a.dinilai}`]);
  return rows;
}

function assessmentTable(d: AchievementExportData) {
  const { students, assessments, scores } = d.matrix;
  const score = new Map(scores.map((s) => [`${s.student_id}|${s.assessment_id}`, s.score]));
  const header = [
    "NPM",
    "Nama",
    ...assessments.map((a) => `${a.nama} (${jenisAssessmentLabel(a.jenis)} ${a.bobot}%)`),
    "Nilai Akhir",
  ];
  const rows = students.map((st) => {
    let akhir = 0;
    const cells = assessments.map((a) => {
      const v = score.get(`${st.id}|${a.id}`);
      if (v !== undefined) akhir += (v / 100) * a.bobot;
      return v === undefined ? "" : v;
    });
    return [st.npm || "—", st.nama, ...cells, round2(akhir)];
  });
  return { header, rows };
}

// Generic per-student recap over one result dimension (cpmk/cpl/ik).
function recapTable(
  d: AchievementExportData,
  dim: "cpmk" | "cpl" | "ik",
  refs: { id: string; kode: string }[],
) {
  const header = ["NPM", "Nama", ...refs.map((r) => r.kode || dim.toUpperCase()), "Rata-rata"];
  const rows = d.results.students.map((sr) => {
    const byRef = new Map(sr[dim].map((r) => [r.ref_id, r.nilai]));
    const vals = refs.map((r) => byRef.get(r.id));
    const present = vals.filter((v): v is number => v !== undefined);
    const avg = present.length ? round2(present.reduce((a, b) => a + b, 0) / present.length) : "";
    return [sr.student.npm || "—", sr.student.nama, ...vals.map((v) => (v === undefined ? "" : v)), avg];
  });
  return { header, rows };
}

// ── PDF (jsPDF + autotable, lazy-loaded chunks) ──

export async function exportAchievementPdf(d: AchievementExportData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  const M = 12;
  const headStyles = { fillColor: [124, 58, 237] as [number, number, number] };
  const styles = { fontSize: 8, cellPadding: 1.6 };
  const bottomOf = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFont("helvetica", "bold").setFontSize(14);
  doc.text("Rekap Evaluasi OBE", M, 15);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
  doc.text(`Program Studi PTIK — dicetak ${today()}`, W - M, 15, { align: "right" });
  doc.setTextColor(0);
  autoTable(doc, {
    startY: 19,
    body: headerInfo(d),
    margin: { left: M, right: M },
    styles: { fontSize: 8.5, cellPadding: 1.4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 48 } },
    theme: "plain",
  });

  const section = (title: string, head: (string | number)[], body: (string | number)[][]) => {
    const y = bottomOf() + 8;
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text(title, M, y);
    autoTable(doc, {
      startY: y + 3,
      head: [head.map(String)],
      body,
      margin: { left: M, right: M },
      styles,
      headStyles,
    });
  };

  section("1. Ringkasan Ketercapaian Kelas", ["Jenis", "Kode", "Rata-rata (%)", "Tercapai/Dinilai"], ringkasanRows(d));
  const asm = assessmentTable(d);
  section("2. Rekap Assessment", asm.header, asm.rows);
  const cpmk = recapTable(d, "cpmk", d.results.cpmks);
  section("3. Rekap CPMK (%)", cpmk.header, cpmk.rows);
  const cpl = recapTable(d, "cpl", d.results.cpls);
  section("4. Rekap CPL (%)", cpl.header, cpl.rows);
  if (d.results.iks.length > 0) {
    const ik = recapTable(d, "ik", d.results.iks);
    section("5. Rekap IK (%)", ik.header, ik.rows);
  }

  doc.save(`${fileStem(d)}.pdf`);
}

// ── Excel (SheetJS): one workbook, up to five sheets ──

export async function exportAchievementExcel(d: AchievementExportData) {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();
  const addSheet = (name: string, aoa: (string | number)[][], colWidths?: number[]) => {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    if (colWidths) ws["!cols"] = colWidths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  addSheet("Info", headerInfo(d), [24, 50]);
  addSheet("Ringkasan Kelas", [["Jenis", "Kode", "Rata-rata (%)", "Tercapai/Dinilai"], ...ringkasanRows(d)], [8, 12, 14, 16]);
  const asm = assessmentTable(d);
  addSheet("Rekap Assessment", [asm.header, ...asm.rows], [16, 28, ...d.matrix.assessments.map(() => 18), 12]);
  const cpmk = recapTable(d, "cpmk", d.results.cpmks);
  addSheet("Rekap CPMK", [cpmk.header, ...cpmk.rows], [16, 28, ...d.results.cpmks.map(() => 10), 10]);
  const cpl = recapTable(d, "cpl", d.results.cpls);
  addSheet("Rekap CPL", [cpl.header, ...cpl.rows], [16, 28, ...d.results.cpls.map(() => 10), 10]);
  if (d.results.iks.length > 0) {
    const ik = recapTable(d, "ik", d.results.iks);
    addSheet("Rekap IK", [ik.header, ...ik.rows], [16, 28, ...d.results.iks.map(() => 10), 10]);
  }

  XLSX.writeFile(wb, `${fileStem(d)}.xlsx`);
}
