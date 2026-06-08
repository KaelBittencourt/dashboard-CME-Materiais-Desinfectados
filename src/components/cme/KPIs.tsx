import { Card, CardContent } from "@/components/ui/card";
import { Activity, TrendingUp, Calendar, Package, Building2, Hash, BarChart3, Zap } from "lucide-react";
import type { Record as CMERecord } from "@/lib/cme-data";
import { SECTORS } from "@/lib/cme-data";
import { useMemo } from "react";

interface Props {
  filtered: CMERecord[];
  all: CMERecord[];
}

function fmt(n: number, d = 0) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });
}

export function KPIs({ filtered, all }: Props) {
  const stats = useMemo(() => {
    const total = filtered.reduce((a, r) => a + r.total, 0);
    const count = filtered.length;
    const uniqueDays = new Set(filtered.map((r) => r.dateKey)).size || 1;
    const uniqueMonths = new Set(filtered.map((r) => r.monthKey)).size || 1;

    const materialTotals = new Map<string, number>();
    const sectorTotals = new Map<string, number>();
    filtered.forEach((r) => {
      materialTotals.set(r.material, (materialTotals.get(r.material) || 0) + r.total);
      SECTORS.forEach((s) => sectorTotals.set(s, (sectorTotals.get(s) || 0) + r.sectors[s]));
    });
    const topMaterial = [...materialTotals.entries()].sort((a, b) => b[1] - a[1])[0];
    const topSector = [...sectorTotals.entries()].sort((a, b) => b[1] - a[1])[0];

    // Growth: compare last month present in filtered vs previous (across all data)
    const months = Array.from(new Set(all.map((r) => r.monthKey))).sort();
    const lastMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2];
    const sumByMonth = (mk: string | undefined) =>
      mk ? all.filter((r) => r.monthKey === mk).reduce((a, r) => a + r.total, 0) : 0;
    const cur = sumByMonth(lastMonth);
    const prev = sumByMonth(prevMonth);
    const growth = prev > 0 ? ((cur - prev) / prev) * 100 : 0;

    return {
      total,
      count,
      dailyAvg: total / uniqueDays,
      monthlyAvg: total / uniqueMonths,
      topMaterial: topMaterial?.[0] || "—",
      topMaterialQty: topMaterial?.[1] || 0,
      topSector: topSector?.[0] || "—",
      topSectorQty: topSector?.[1] || 0,
      growth,
      avgPerRecord: count ? total / count : 0,
    };
  }, [filtered, all]);

  const items = [
    { icon: Package, label: "Total Desinfectados", value: fmt(stats.total), accent: "from-primary/15 to-primary/5", iconColor: "text-primary" },
    { icon: Hash, label: "Total de Registros", value: fmt(stats.count), accent: "from-chart-2/15 to-chart-2/5", iconColor: "text-chart-2" },
    { icon: Calendar, label: "Média Diária", value: fmt(stats.dailyAvg, 1), accent: "from-chart-3/15 to-chart-3/5", iconColor: "text-chart-3" },
    { icon: BarChart3, label: "Média Mensal", value: fmt(stats.monthlyAvg, 1), accent: "from-chart-4/15 to-chart-4/5", iconColor: "text-chart-4" },
    { icon: Activity, label: "Material Líder", value: stats.topMaterial, sub: `${fmt(stats.topMaterialQty)} und`, accent: "from-chart-5/15 to-chart-5/5", iconColor: "text-chart-5" },
    { icon: Building2, label: "Setor Líder", value: stats.topSector, sub: `${fmt(stats.topSectorQty)} und`, accent: "from-primary/15 to-primary/5", iconColor: "text-primary" },
    {
      icon: TrendingUp,
      label: "Crescimento Mês Anterior",
      value: `${stats.growth >= 0 ? "+" : ""}${fmt(stats.growth, 1)}%`,
      accent: stats.growth >= 0 ? "from-success/15 to-success/5" : "from-destructive/15 to-destructive/5",
      iconColor: stats.growth >= 0 ? "text-success" : "text-destructive",
    },
    { icon: Zap, label: "Média por Registro", value: fmt(stats.avgPerRecord, 1), accent: "from-chart-2/15 to-chart-2/5", iconColor: "text-chart-2" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.label} className={`bg-gradient-to-br ${it.accent} border-border/50 shadow-sm hover:shadow-md transition-all`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
                {it.label}
              </span>
              <it.icon className={`h-5 w-5 ${it.iconColor}`} />
            </div>
            <div className="text-2xl font-bold text-foreground truncate" title={String(it.value)}>
              {it.value}
            </div>
            {it.sub && <div className="text-xs text-muted-foreground mt-1">{it.sub}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
