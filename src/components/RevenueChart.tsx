// --- START OF FILE src/components/RevenueChart.tsx ---

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

interface RevenueChartProps {
  data: { date: string; revenue: number; commission: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales Performance</CardTitle>
          <p className="text-sm text-muted-foreground">Last 7 days data</p>
        </div>
        <div className="flex gap-1 rounded-md bg-secondary p-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Last 3 months</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Last 30 days</Button>
          <Button variant="secondary" size="sm" className="h-7 px-2 text-xs">Last 7 days</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                  formatter={(value: number, name: string) => [new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                  labelStyle={{ fontWeight: 'bold' }}
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground"><p>No sales recorded</p></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// --- END OF FILE src/components/RevenueChart.tsx ---