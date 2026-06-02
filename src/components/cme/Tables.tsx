import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Record as CMERecord } from "@/lib/cme-data";
import { SECTORS } from "@/lib/cme-data";

function fmt(n: number, d = 0) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });
}

export function MaterialsTable({ data }: { data: CMERecord[] }) {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<"material" | "total" | "avg" | "share" | "rank">("total");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const m = new Map<string, { total: number; count: number }>();
    data.forEach((r) => {
      const cur = m.get(r.material) || { total: 0, count: 0 };
      cur.total += r.total; cur.count += 1;
      m.set(r.material, cur);
    });
    const grand = data.reduce((a, r) => a + r.total, 0) || 1;
    const arr = [...m.entries()].map(([material, v]) => ({
      material, total: v.total, avg: v.total / v.count, share: (v.total / grand) * 100,
    }));
    arr.sort((a, b) => b.total - a.total);
    const ranked = arr.map((r, i) => ({ ...r, rank: i + 1 }));
    const filtered = ranked.filter((r) => r.material.toLowerCase().includes(q.toLowerCase()));
    filtered.sort((a: any, b: any) => {
      const av = a[sortBy], bv = b[sortBy];
      if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return dir === "asc" ? av - bv : bv - av;
    });
    return filtered;
  }, [data, q, sortBy, dir]);

  const toggle = (k: typeof sortBy) => {
    if (sortBy === k) setDir(dir === "asc" ? "desc" : "asc");
    else { setSortBy(k); setDir("desc"); }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-base">Tabela de Materiais</CardTitle>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar material..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {[
                  ["rank", "#"], ["material", "Material"], ["total", "Quantidade"],
                  ["avg", "Média"], ["share", "Participação %"],
                ].map(([k, l]) => (
                  <th key={k} className="text-left p-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggle(k as any)}>
                    <span className="inline-flex items-center gap-1">{l} <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.material} className="border-t hover:bg-muted/30">
                  <td className="p-3"><Badge variant="outline">{r.rank}</Badge></td>
                  <td className="p-3 font-medium">{r.material}</td>
                  <td className="p-3">{fmt(r.total)}</td>
                  <td className="p-3">{fmt(r.avg, 1)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(r.share, 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{fmt(r.share, 1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum resultado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function MovementsTable({ data }: { data: CMERecord[] }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    const arr = !term ? data : data.filter((r) => r.material.toLowerCase().includes(term));
    return [...arr].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const view = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <CardTitle className="text-base">Movimentações ({fmt(filtered.length)})</CardTitle>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className="pl-8 h-9" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Material</th>
                {SECTORS.map((s) => <th key={s} className="text-right p-3 font-medium text-muted-foreground">{s}</th>)}
                <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {view.map((r, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  <td className="p-3 whitespace-nowrap text-muted-foreground">{r.date.toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 font-medium">{r.material}</td>
                  {SECTORS.map((s) => (
                    <td key={s} className="p-3 text-right tabular-nums">
                      {r.sectors[s] > 0 ? fmt(r.sectors[s]) : <span className="text-muted-foreground/40">—</span>}
                    </td>
                  ))}
                  <td className="p-3 text-right font-semibold tabular-nums">{fmt(r.total)}</td>
                </tr>
              ))}
              {view.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum registro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">Página {safePage + 1} de {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
