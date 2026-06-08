import Papa from "papaparse";

export const SHEET_ID = "1vXadk9Kio6IFdhjGOFh34AKHQqfqb6p5N4d_su6zFZs";
export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&_=`;

export const SECTORS = ["Internação", "Emergência", "Centro Cirúrgico", "Saúde Mental"] as const;
export type Sector = (typeof SECTORS)[number];

export interface RawRow {
  timestamp: string;
  date: string;
  material: string;
  Internação: string;
  Emergência: string;
  "Centro Cirúrgico": string;
  "Saúde Mental": string;
}

export interface Record {
  date: Date;
  material: string;
  sectors: Record_Sectors;
  total: number;
  year: number;
  month: number; // 1-12
  monthName: string;
  quarter: number;
  week: number;
  weekday: string;
  dateKey: string; // yyyy-mm-dd
  monthKey: string; // yyyy-mm
}

type Record_Sectors = { [K in Sector]: number };

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAY_NAMES = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

function parseDate(s: string): Date | null {
  if (!s) return null;
  const t = s.trim();
  // dd/mm/yyyy (suporta anos de 2 a 4 dígitos, como 26 ou 0026)
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    let year = Number(m[3]);
    if (year < 100) {
      year += 2000;
    }
    const d = new Date(year, Number(m[2]) - 1, Number(m[1]));
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(t);
  if (!isNaN(d.getTime())) {
    if (d.getFullYear() < 100) {
      d.setFullYear(d.getFullYear() + 2000);
    }
    return d;
  }
  return null;
}

function parseNum(s: string | undefined): number {
  if (!s) return 0;
  const cleaned = String(s).replace(/\./g, "").replace(",", ".").trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export async function fetchCMEData(): Promise<Record[]> {
  const res = await fetch(SHEET_URL + Date.now(), { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar planilha");
  const text = await res.text();

  const parsed = Papa.parse<{ [k: string]: string }>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const seen = new Set<string>();
  const records: Record[] = [];

  for (const row of parsed.data) {
    const material = (row["Selecione o Material"] || "").trim();
    const dateStr = (row["Data"] || "").trim();
    if (!material || !dateStr) continue;
    const date = parseDate(dateStr);
    if (!date) continue;

    const sectors: Record_Sectors = {
      "Internação": parseNum(row["Internação"]),
      "Emergência": parseNum(row["Emergência"]),
      "Centro Cirúrgico": parseNum(row["Centro Cirúrgico"]),
      "Saúde Mental": parseNum(row["Saúde Mental"]),
    };
    const total = SECTORS.reduce((a, s) => a + sectors[s], 0);
    if (total === 0) continue;

    const timestamp = (row["Carimbo de data/hora"] || "").trim();
    const dedupeKey = `${timestamp}|${dateStr}|${material}|${total}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    records.push({
      date,
      material,
      sectors,
      total,
      year,
      month,
      monthName: MONTH_NAMES[month - 1],
      quarter: Math.ceil(month / 3),
      week: getISOWeek(date),
      weekday: WEEKDAY_NAMES[date.getDay()],
      dateKey,
      monthKey,
    });
  }

  records.sort((a, b) => a.date.getTime() - b.date.getTime());
  return records;
}

// ---------- Filtering ----------
export interface Filters {
  years: number[];
  months: number[];
  materials: string[];
  sectors: Sector[];
}

export function applyFilters(records: Record[], f: Filters): Record[] {
  return records
    .filter((r) => (f.years.length ? f.years.includes(r.year) : true))
    .filter((r) => (f.months.length ? f.months.includes(r.month) : true))
    .filter((r) => (f.materials.length ? f.materials.includes(r.material) : true))
    .map((r) => {
      if (!f.sectors.length) return r;
      const sectors = { ...r.sectors };
      let total = 0;
      for (const s of SECTORS) {
        if (!f.sectors.includes(s)) sectors[s] = 0;
        total += sectors[s];
      }
      return { ...r, sectors, total };
    })
    .filter((r) => r.total > 0);
}

// ---------- Aggregations ----------
export function uniqueSorted<T>(arr: T[]): T[] {
  return Array.from(new Set(arr)).sort((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));
}

export const MONTH_NAMES_PT = MONTH_NAMES;
