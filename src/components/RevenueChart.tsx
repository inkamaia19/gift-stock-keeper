// --- START OF FILE src/components/RevenueChart.tsx (CORREGIDO) ---

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadialBarChart, RadialBar, LabelList, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import * as React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

interface RevenueChartProps {
  data: { dateISO: string; label: string; revenue: number; commission: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const { t } = useI18n();
  const [range, setRange] = React.useState<'90' | '30' | '7'>(() => {
    try {
      const v = localStorage.getItem('ui.chartRange');
      return v === '90' || v === '30' || v === '7' ? (v as '90' | '30' | '7') : '7';
    } catch {
      return '7';
    }
  });
  const [mode, setMode] = React.useState<'area' | 'radial'>(() => {
    try {
      const v = localStorage.getItem('ui.chartMode');
      return v === 'radial' ? 'radial' : 'area';
    } catch {
      return 'area';
    }
  });
  const display = React.useMemo(() => {
    const days = range === '90' ? 90 : range === '30' ? 30 : 7;
    const now = new Date();
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const filtered = data.filter(d => new Date(d.dateISO) >= cutoff);
    return filtered.map(d => ({ date: d.label, revenue: d.revenue, commission: d.commission }));
  }, [data, range]);
  const formatPEN = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);
  const [showAxisAmounts, setShowAxisAmounts] = React.useState<boolean>(() => {
    try { const v = localStorage.getItem('ui.showAxisAmounts'); return v !== '0'; } catch { return true; }
  });
  React.useEffect(() => { try { localStorage.setItem('ui.showAxisAmounts', showAxisAmounts ? '1' : '0'); } catch {} }, [showAxisAmounts]);
  React.useEffect(() => { try { localStorage.setItem('ui.chartRange', range); } catch {} }, [range]);
  React.useEffect(() => { try { localStorage.setItem('ui.chartMode', mode); } catch {} }, [mode]);
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base sm:text-lg md:text-xl">{t('card_total_revenue')}</CardTitle>
          <p className="text-xs text-muted-foreground sm:text-sm">{/* espacio para subtítulo si se requiere */}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <ToggleGroup type="single" value={mode} onValueChange={(v)=> v && setMode(v as any)} variant="outline" size="sm">
            <ToggleGroupItem value="area">{t('view_list')}</ToggleGroupItem>
            <ToggleGroupItem value="radial">Radial</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" value={range} onValueChange={(v)=> v && setRange(v as any)} variant="outline" size="sm">
            <ToggleGroupItem value="90">90</ToggleGroupItem>
            <ToggleGroupItem value="30">30</ToggleGroupItem>
            <ToggleGroupItem value="7">7</ToggleGroupItem>
          </ToggleGroup>
          <button
            type="button"
            onClick={() => setShowAxisAmounts(v => !v)}
            className="h-8 px-2 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={showAxisAmounts ? 'Hide amounts' : 'Show amounts'}
            title={showAxisAmounts ? 'Hide amounts' : 'Show amounts'}
          >
            {showAxisAmounts ? <span className="text-xs">S/</span> : <span className="text-xs">***</span>}
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full h-[220px] sm:h-[260px] md:h-[320px] lg:h-[380px]">
          {display.length > 0 ? (
            mode === 'radial' ? (
              // Radial minimalista basado en porcentajes
              <ChartContainer
                config={{ net: { label: 'Neto', color: '#ffffff' }, commission: { label: 'Comisión', color: '#bbbbbb' } }}
                className="mx-auto aspect-square max-h-[280px]"
              >
                {(() => {
                  const sumRevenue = display.reduce((s, d) => s + d.revenue, 0);
                  const sumCommission = display.reduce((s, d) => s + d.commission, 0);
                  const netAbs = Math.max(0, sumRevenue - sumCommission);
                  const total = sumRevenue || 1; // evitar div/0
                  const radialDataRaw = [
                    ...(showCommission ? [{ key: 'Comisión', value: Math.round((sumCommission / total) * 100), fill: '#bbbbbb' }] : []),
                    ...(showRevenue ? [{ key: 'Neto', value: Math.round((netAbs / total) * 100), fill: '#ffffff' }] : []),
                  ];
                  const radialData = radialDataRaw.length ? radialDataRaw : [{ key: 'Sin datos', value: 100, fill: '#444' }];
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart data={radialData} startAngle={-90} endAngle={380} innerRadius={30} outerRadius={110}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" valueFormatter={(v)=> `${v}%`} />} />
                        <RadialBar dataKey="value" background>
                          <LabelList position="insideStart" dataKey="key" className="fill-white capitalize mix-blend-luminosity" fontSize={11} />
                        </RadialBar>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </ChartContainer>
            ) : (
              // Área dual minimalista con la misma paleta
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={display} margin={{ top: 6, right: 12, left: 12, bottom: 8 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#bbbbbb" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#bbbbbb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="date" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.85)', fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={6} padding={{ left: 4, right: 4 }} />
                  <YAxis
                    stroke="transparent"
                    tick={showAxisAmounts ? { fill: 'rgba(255,255,255,0.85)', fontSize: 11 } : false as any}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickMargin={6}
                    tickFormatter={(value) => showAxisAmounts ? `${formatPEN(Number(value))}` : ''}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                    formatter={(value: number, name: string) => [
                      showAxisAmounts ? formatPEN(value) : '***',
                      name === 'revenue' ? t('card_total_revenue') : t('card_commissions'),
                    ]}
                    labelStyle={{ fontWeight: 'bold' }}
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Ingresos" stroke="#ffffff" strokeOpacity={0.95} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" activeDot={{ r: 3, fill: '#ffffff' }} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="commission" name="Comisiones" stroke="#bbbbbb" strokeOpacity={0.95} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" activeDot={{ r: 3, fill: '#bbbbbb' }} fillOpacity={1} fill="url(#colorCommission)" />
                </AreaChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs sm:text-sm"><p>{t('tx_history')} — 0</p></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
