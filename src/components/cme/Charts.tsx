import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList,
} from "recharts";
import { useMemo } from "react";
import type { Record as CMERecord } from "@/lib/cme-data";
import { SECTORS, MONTH_NAMES_PT } from "@/lib/cme-data";

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)",
];

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--popover-foreground)",
  fontSize: "13px",
};

interface Props { data: CMERecord[]; }

export function MonthlyEvolution({ data }: Props) {
  const chart = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((r) => m.set(r.monthKey, (m.get(r.monthKey) || 0) + r.total));
    return [...m.entries()]
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([k, v]) => {
        const [y, mm] = k.split("-");
        return { label: `${MONTH_NAMES_PT[Number(mm) - 1].slice(0, 3)}/${y.slice(2)}`, value: v };
      });
  }, [data]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={3}
              dot={{ r: 4, fill: "var(--chart-1)" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MaterialProduction({ data }: Props) {
  const chart = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((r) => m.set(r.material, (m.get(r.material) || 0) + r.total));
    return [...m.entries()]
      .map(([material, value]) => ({ material, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Produção por Material</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(280, chart.length * 26)}>
          <BarChart data={chart} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis type="category" dataKey="material" stroke="var(--muted-foreground)" fontSize={11} width={140} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SectorParticipation({ data }: Props) {
  const chart = useMemo(() => {
    return SECTORS.map((s, i) => ({
      name: s,
      value: data.reduce((a, r) => a + r.sectors[s], 0),
      color: COLORS[i],
    })).filter((x) => x.value > 0);
  }, [data]);
  const total = chart.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Participação dos Setores</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={chart} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
              {chart.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle}
              formatter={(v: number) => [`${v.toLocaleString("pt-BR")} (${((v / total) * 100).toFixed(1)}%)`, "Total"]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function Top10Materials({ data }: Props) {
  const chart = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((r) => m.set(r.material, (m.get(r.material) || 0) + r.total));
    return [...m.entries()].map(([material, value]) => ({ material, value }))
      .sort((a, b) => b.value - a.value).slice(0, 10);
  }, [data]);

  return (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Top 10 Materiais</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="material" stroke="var(--muted-foreground)" fontSize={11}
              angle={-35} textAnchor="end" interval={0} height={70} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HeatmapMatrix({ data }: Props) {
  const { materials, matrix, max } = useMemo(() => {
    const mset = new Map<string, number>();
    data.forEach((r) => mset.set(r.material, (mset.get(r.material) || 0) + r.total));
    const materials = [...mset.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([m]) => m);
    const matrix: Record<string, Record<string, number>> = {};
    materials.forEach((m) => {
      matrix[m] = {};
      SECTORS.forEach((s) => (matrix[m][s] = 0));
    });
    data.forEach((r) => {
      if (!materials.includes(r.material)) return;
      SECTORS.forEach((s) => (matrix[r.material][s] += r.sectors[s]));
    });
    let max = 0;
    materials.forEach((m) => SECTORS.forEach((s) => (max = Math.max(max, matrix[m][s]))));
    return { materials, matrix, max: max || 1 };
  }, [data]);

  return (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Heatmap · Material × Setor</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-xs border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-left p-2 text-muted-foreground font-medium">Material</th>
                {SECTORS.map((s) => (
                  <th key={s} className="text-center p-2 text-muted-foreground font-medium">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m}>
                  <td className="p-2 font-medium whitespace-nowrap">{m}</td>
                  {SECTORS.map((s) => {
                    const v = matrix[m][s];
                    const intensity = v / max;
                    return (
                      <td key={s}
                        className="p-3 text-center rounded-md font-medium"
                        style={{
                          backgroundColor: v === 0 ? "var(--muted)" :
                            `color-mix(in oklab, var(--chart-1) ${10 + intensity * 80}%, transparent)`,
                          color: intensity > 0.5 ? "white" : "var(--foreground)",
                        }}>
                        {v.toLocaleString("pt-BR")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function YearlyEvolution({ data }: Props) {
  const chart = useMemo(() => {
    const m = new Map<number, number>();
    data.forEach((r) => m.set(r.year, (m.get(r.year) || 0) + r.total));
    return [...m.entries()].sort(([a], [b]) => a - b).map(([k, v]) => ({ year: String(k), value: v }));
  }, [data]);

  return (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Evolução Anual</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chart}>
            <defs>
              <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.7} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill="url(#gArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SectorComparison({ data }: Props) {
  const chart = useMemo(() => {
    const m = new Map<string, Record<string, number>>();
    data.forEach((r) => {
      const cur = m.get(r.monthKey) || Object.fromEntries(SECTORS.map((s) => [s, 0]));
      SECTORS.forEach((s) => (cur[s] += r.sectors[s]));
      m.set(r.monthKey, cur);
    });
    return [...m.entries()].sort(([a], [b]) => (a > b ? 1 : -1)).map(([k, v]) => {
      const [y, mm] = k.split("-");
      return { label: `${MONTH_NAMES_PT[Number(mm) - 1].slice(0, 3)}/${y.slice(2)}`, ...v };
    });
  }, [data]);

  return (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Comparativo de Setores</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SECTORS.map((s, i) => (
              <Bar key={s} dataKey={s} stackId="a" fill={COLORS[i]} radius={i === SECTORS.length - 1 ? [6, 6, 0, 0] : 0} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
