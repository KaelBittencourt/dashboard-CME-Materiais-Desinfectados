import { createFileRoute } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { RefreshCw, Moon, Sun, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { fetchCMEData, applyFilters, uniqueSorted, SECTORS, MONTH_NAMES_PT, type Filters } from "@/lib/cme-data";
import { MultiSelect } from "@/components/cme/MultiSelect";
import { KPIs } from "@/components/cme/KPIs";
import {
  MonthlyEvolution, MaterialProduction, SectorParticipation,
  Top10Materials, HeatmapMatrix, QuarterlyEvolution, SectorComparison,
} from "@/components/cme/Charts";
import { MaterialsTable, MovementsTable } from "@/components/cme/Tables";
import { Insights } from "@/components/cme/Insights";

const cmeQuery = queryOptions({
  queryKey: ["cme-data"],
  queryFn: fetchCMEData,
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CME | Materiais Desinfectados | Analytics" },
      { name: "description", content: "Monitoramento executivo dos materiais desinfectados pelo Centro de Material e Esterilização." },
    ],
  }),
  component: Dashboard,
});

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("cme-theme");
    const isDark = stored ? stored === "dark" : false;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const nd = !d;
      document.documentElement.classList.toggle("dark", nd);
      localStorage.setItem("cme-theme", nd ? "dark" : "light");
      return nd;
    });
  };
  return { dark, toggle };
}

function Dashboard() {
  const { data = [], isLoading, isFetching, refetch, error } = useQuery(cmeQuery);
  const { dark, toggle } = useDarkMode();

  const [filters, setFilters] = useState<Filters>({ years: [], months: [], materials: [], sectors: [] });

  const yearOpts = useMemo(() => uniqueSorted(data.map((r) => r.year)).map((y) => ({ label: String(y), value: String(y) })), [data]);
  const monthOpts = useMemo(() => MONTH_NAMES_PT.map((m, i) => ({ label: m, value: String(i + 1) })), []);
  const materialOpts = useMemo(() => uniqueSorted(data.map((r) => r.material)).map((m) => ({ label: m, value: m })), [data]);
  const sectorOpts = useMemo(() => SECTORS.map((s) => ({ label: s, value: s })), []);

  const filtered = useMemo(() => applyFilters(data, filters), [data, filters]);

  const handleRefresh = async () => {
    const res = await refetch();
    if (res.error) toast.error("Erro ao atualizar dados");
    else toast.success("Dados atualizados com sucesso");
  };

  const clearFilters = () =>
    setFilters({ years: [], months: [], materials: [], sectors: [] });

  const activeFiltersCount =
    filters.years.length + filters.months.length + filters.materials.length + filters.sectors.length;

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-md">
              <Activity className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold leading-tight">CME | Materiais Desinfectados | Analytics</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Análise de Materiais Desinfectados</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end sm:justify-start">
            <Button variant="outline" size="sm" onClick={toggle} aria-label="Alternar tema">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button onClick={handleRefresh} disabled={isFetching} size="sm" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar Dados</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <MultiSelect label="Ano" options={yearOpts}
                selected={filters.years.map(String)}
                onChange={(v) => setFilters((f) => ({ ...f, years: v.map(Number) }))} />
              <MultiSelect label="Mês" options={monthOpts}
                selected={filters.months.map(String)}
                onChange={(v) => setFilters((f) => ({ ...f, months: v.map(Number) }))} />
              <MultiSelect label="Material" options={materialOpts}
                selected={filters.materials}
                onChange={(v) => setFilters((f) => ({ ...f, materials: v }))} />
              <MultiSelect label="Setor" options={sectorOpts}
                selected={filters.sectors}
                onChange={(v) => setFilters((f) => ({ ...f, sectors: v as any }))} />
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                  Limpar filtros <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
                </Button>
              )}
              <div className="w-full sm:w-auto sm:ml-auto text-xs text-muted-foreground text-left sm:text-right pt-2 sm:pt-0">
                {isFetching && !isLoading && <span className="inline-flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Sincronizando...</span>}
                {!isFetching && data.length > 0 && (
                  <span>{filtered.length.toLocaleString("pt-BR")} de {data.length.toLocaleString("pt-BR")} registros</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              Falha ao carregar a planilha. Verifique se ela está compartilhada publicamente e tente novamente.
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-28 animate-pulse bg-muted/40" />
            ))}
          </div>
        ) : (
          <>
            <KPIs filtered={filtered} all={data} />
            <Insights data={filtered} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyEvolution data={filtered} />
              <SectorParticipation data={filtered} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Top10Materials data={filtered} />
              <QuarterlyEvolution data={filtered} />
            </div>

            <SectorComparison data={filtered} />
            <HeatmapMatrix data={filtered} />
            <MaterialProduction data={filtered} />

            <MaterialsTable data={filtered} />
            <MovementsTable data={filtered} />
          </>
        )}

        <footer className="text-center text-xs text-muted-foreground py-6">
          CME | Materiais Desinfectados | Analytics · Dados em tempo real do Google Sheets
        </footer>
      </main>
    </div>
  );
}
