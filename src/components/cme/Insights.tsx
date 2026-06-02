import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, TrendingDown, Award, Target } from "lucide-react";
import { useMemo } from "react";
import type { Record as CMERecord } from "@/lib/cme-data";
import { SECTORS } from "@/lib/cme-data";

function fmt(n: number, d = 0) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });
}

export function Insights({ data }: { data: CMERecord[] }) {
  const insights = useMemo(() => {
    if (!data.length) return [];
    const total = data.reduce((a, r) => a + r.total, 0);

    // Top material
    const mats = new Map<string, number>();
    data.forEach((r) => mats.set(r.material, (mats.get(r.material) || 0) + r.total));
    const top = [...mats.entries()].sort((a, b) => b[1] - a[1])[0];

    // Top sector
    const sec = new Map<string, number>();
    SECTORS.forEach((s) => sec.set(s, data.reduce((a, r) => a + r.sectors[s], 0)));
    const topSec = [...sec.entries()].sort((a, b) => b[1] - a[1])[0];

    // Growth
    const months = Array.from(new Set(data.map((r) => r.monthKey))).sort();
    const lastM = months[months.length - 1];
    const prevM = months[months.length - 2];
    const sum = (mk?: string) => mk ? data.filter((r) => r.monthKey === mk).reduce((a, r) => a + r.total, 0) : 0;
    const growth = prevM ? ((sum(lastM) - sum(prevM)) / sum(prevM)) * 100 : 0;

    // 3-month trend per sector
    const last3 = months.slice(-3);
    const trends = SECTORS.map((s) => {
      const vals = last3.map((mk) => data.filter((r) => r.monthKey === mk).reduce((a, r) => a + r.sectors[s], 0));
      const rising = vals.length >= 2 && vals[vals.length - 1] > vals[0];
      return { sector: s, rising, vals };
    });
    const risingSector = trends.find((t) => t.rising);

    const items: { icon: any; tone: string; text: string }[] = [];
    if (top) items.push({
      icon: Award, tone: "text-chart-1",
      text: `O material **${top[0]}** representa **${((top[1] / total) * 100).toFixed(1)}%** da produção total (${fmt(top[1])} unidades).`,
    });
    if (topSec) items.push({
      icon: Target, tone: "text-chart-2",
      text: `O setor **${topSec[0]}** recebeu **${((topSec[1] / total) * 100).toFixed(1)}%** dos materiais processados.`,
    });
    if (prevM) items.push({
      icon: growth >= 0 ? TrendingUp : TrendingDown,
      tone: growth >= 0 ? "text-success" : "text-destructive",
      text: `Houve ${growth >= 0 ? "**crescimento**" : "**queda**"} de **${fmt(Math.abs(growth), 1)}%** em relação ao mês anterior.`,
    });
    if (risingSector) items.push({
      icon: TrendingUp, tone: "text-chart-3",
      text: `**${risingSector.sector}** apresentou aumento de demanda nos últimos 3 meses.`,
    });

    // Most active day of week
    const dow = new Map<string, number>();
    data.forEach((r) => dow.set(r.weekday, (dow.get(r.weekday) || 0) + r.total));
    const topDow = [...dow.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topDow) items.push({
      icon: Lightbulb, tone: "text-chart-4",
      text: `**${topDow[0]}** é o dia da semana com maior volume processado.`,
    });

    return items;
  }, [data]);

  return (
    <Card className="shadow-sm bg-gradient-to-br from-accent/30 to-card border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" /> Insights Automáticos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((it, i) => {
            const Icon = it.icon;
            const parts = it.text.split(/\*\*(.+?)\*\*/g);
            return (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-card/60 border border-border/50">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${it.tone}`} />
                <p className="text-sm leading-relaxed">
                  {parts.map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="text-foreground font-semibold">{p}</strong> : <span key={idx} className="text-muted-foreground">{p}</span>)}
                </p>
              </div>
            );
          })}
          {insights.length === 0 && <p className="text-sm text-muted-foreground">Sem dados suficientes.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
