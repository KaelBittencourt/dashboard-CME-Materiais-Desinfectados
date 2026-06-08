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
          <AreaChart data={chart} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="gAreaMonth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} dy={5} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString("pt-BR")} dx={-5} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString("pt-BR"), "Quantidade"]} />
            <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={3} fill="url(#gAreaMonth)"
              dot={{ r: 4, fill: "var(--chart-1)" }} activeDot={{ r: 6 }} />
          </AreaChart>
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
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chart} layout="vertical" margin={{ left: 10, right: 35, top: 10, bottom: 10 }}>
            <XAxis type="number" hide={true} />
            <YAxis type="category" dataKey="material" stroke="var(--muted-foreground)" fontSize={11} width={100} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={16}>
              <LabelList dataKey="value" position="right" formatter={(v: number) => v.toLocaleString("pt-BR")} style={{ fontSize: 10, fill: "var(--muted-foreground)", fontWeight: 500 }} />
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

export function QuarterlyEvolution({ data }: Props) {
  const chart = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((r) => {
      const key = `${r.year}-Q${r.quarter}`;
      m.set(key, (m.get(key) || 0) + r.total);
    });

    return [...m.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => {
        const [year, q] = k.split("-Q");
        return { year: `${q}T/${year.slice(2)}`, value: v };
      });
  }, [data]);

  return (
    <Card className="shadow-sm">
      <CardHeader><CardTitle className="text-base">Evolução Trimestral</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chart} margin={{ top: 20, right: 25, left: 25, bottom: 5 }}>
            <defs>
              <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} dy={5} />
            <YAxis hide={true} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString("pt-BR"), "Quantidade"]} />
            <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#gArea)">
              <LabelList dataKey="value" position="top" offset={10} formatter={(v: number) => v.toLocaleString("pt-BR")} style={{ fontSize: 10, fill: "var(--muted-foreground)", fontWeight: 600 }} />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const SectorTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-md text-xs space-y-1.5 min-w-[150px]">
        <p className="font-semibold text-foreground border-b border-border/50 pb-1 mb-1">{label}</p>
        {[...payload].reverse().map((item: any, index: number) => {
          const sectorIndex = SECTORS.indexOf(item.name as any);
          const color = sectorIndex !== -1 ? COLORS[sectorIndex] : item.color;
          return (
            <div key={index} className="flex items-center justify-between gap-4 font-medium" style={{ color }}>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                {item.name}
              </span>
              <span className="font-bold text-foreground">
                {Number(item.value).toLocaleString("pt-BR")}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

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
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chart} margin={{ top: 15, right: 15, left: 10, bottom: 5 }} barSize={32}>
            <defs>
              <linearGradient id="colorSector0" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.95} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.65} />
              </linearGradient>
              <linearGradient id="colorSector1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.95} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.65} />
              </linearGradient>
              <linearGradient id="colorSector2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.95} />
                <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.65} />
              </linearGradient>
              <linearGradient id="colorSector3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.95} />
                <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} dy={5} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString("pt-BR")} dx={-5} />
            <Tooltip content={<SectorTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" />
            {SECTORS.map((s, i) => (
              <Bar key={s} dataKey={s} stackId="a" fill={`url(#colorSector${i})`} radius={i === SECTORS.length - 1 ? [6, 6, 0, 0] : 0} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
