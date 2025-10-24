// --- START OF FILE src/components/RevenueChart.tsx (CORREGIDO) ---

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadialBarChart, RadialBar, LabelList, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import * as React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface RevenueChartProps {
  data: { date: string; revenue: number; commission: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const [range, setRange] = React.useState<'90' | '30' | '7'>('90');
  const [mode, setMode] = React.useState<'area' | 'radial'>('area');
  const [showRevenue, setShowRevenue] = React.useState(true);
  const [showCommission, setShowCommission] = React.useState(true);
  const display = React.useMemo(() => {
    const n = range === '90' ? 90 : range === '30' ? 30 : 7;
    return data.slice(-n);
  }, [data, range]);
  const formatPEN = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);
  const [showAxisAmounts, setShowAxisAmounts] = React.useState<boolean>(() => {
    try { const v = localStorage.getItem('ui.showAxisAmounts'); return v !== '0'; } catch { return true; }
  });
  React.useEffect(() => { try { localStorage.setItem('ui.showAxisAmounts', showAxisAmounts ? '1' : '0'); } catch {} }, [showAxisAmounts]);
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Ingresos Totales</CardTitle>
          <p className="text-sm text-muted-foreground">Total de los últimos 3 meses</p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={mode} onValueChange={(v)=> v && setMode(v as any)} variant="outline" size="sm">
            <ToggleGroupItem value="area">Área</ToggleGroupItem>
            <ToggleGroupItem value="radial">Radial</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" value={range} onValueChange={(v)=> v && setRange(v as any)} variant="outline" size="sm">
            <ToggleGroupItem value="90">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30">Últimos 30 días</ToggleGroupItem>
            <ToggleGroupItem value="7">Últimos 7 días</ToggleGroupItem>
          </ToggleGroup>
          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={() => setShowRevenue(v => !v)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={showRevenue ? 'Ocultar ingresos' : 'Mostrar ingresos'}
              title={showRevenue ? 'Ocultar ingresos' : 'Mostrar ingresos'}
            >
              {showRevenue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowCommission(v => !v)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={showCommission ? 'Ocultar comisiones' : 'Mostrar comisiones'}
              title={showCommission ? 'Ocultar comisiones' : 'Mostrar comisiones'}
            >
              {showCommission ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowAxisAmounts(v => !v)}
              className="h-8 px-2 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={showAxisAmounts ? 'Ocultar montos del eje' : 'Mostrar montos del eje'}
              title={showAxisAmounts ? 'Ocultar montos del eje' : 'Mostrar montos del eje'}
            >
              {showAxisAmounts ? <span className="text-xs">S/</span> : <span className="text-xs">***</span>}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full h-[300px]">
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
                <AreaChart data={display} margin={{ top: 8, right: 24, left: 24, bottom: 16 }}>
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
                  <XAxis dataKey="date" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.85)', fontSize: 12 }} tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 8, right: 8 }} />
                  <YAxis
                    stroke="transparent"
                    tick={showAxisAmounts ? { fill: 'rgba(255,255,255,0.85)', fontSize: 12 } : false as any}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickMargin={8}
                    tickFormatter={(value) => showAxisAmounts ? `${formatPEN(Number(value))}` : ''}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                    formatter={(value: number, name: string) => [
                      showAxisAmounts ? formatPEN(value) : '***',
                      name === 'revenue' ? 'Ingresos' : 'Comisiones',
                    ]}
                    labelStyle={{ fontWeight: 'bold' }}
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  {showRevenue && (
                    <Area type="monotone" dataKey="revenue" name="Ingresos" stroke="#ffffff" strokeOpacity={0.95} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" activeDot={{ r: 3, fill: '#ffffff' }} fillOpacity={1} fill="url(#colorRevenue)" />
                  )}
                  {showCommission && (
                    <Area type="monotone" dataKey="commission" name="Comisiones" stroke="#bbbbbb" strokeOpacity={0.95} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" activeDot={{ r: 3, fill: '#bbbbbb' }} fillOpacity={1} fill="url(#colorCommission)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground"><p>Sin ventas registradas</p></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
