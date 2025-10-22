// --- START OF FILE src/components/RevenueChart.tsx ---

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Eye, EyeOff } from "lucide-react";

interface RevenueChartProps {
  data: { date: string; revenue: number; commission: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const [isCommissionVisible, setIsCommissionVisible] = useState(true);

  if (data.length === 0) return <Card><CardHeader><CardTitle>Sales Performance</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center text-muted-foreground"><p className="text-sm">No sales recorded</p></div></CardContent></Card>;

  const renderCustomLegend = (value: string, entry: any) => {
    const { dataKey } = entry;
    const isCommissionEntry = dataKey === 'commission';
    const isInactive = isCommissionEntry && !isCommissionVisible;

    return (
      <span className="flex items-center gap-2 mr-4">
        <span style={{ color: isInactive ? '#888' : 'inherit' }}>{value}</span>
        {isCommissionEntry && (<span className="cursor-pointer text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setIsCommissionVisible(!isCommissionVisible); }}>{isCommissionVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</span>)}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader><CardTitle>Sales Performance (Last 7 Days)</CardTitle></CardHeader>
      <CardContent>
        {/* ===== CORRECCIÓN CLAVE AQUÍ: Añadimos un contenedor con padding para la leyenda ===== */}
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `S/${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                formatter={(value: number, name: string) => [`S/${value.toFixed(2)}`, name]}
                cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
              />
              <Legend verticalAlign="top" wrapperStyle={{ top: -10 }} formatter={renderCustomLegend} />
              <Line type="natural" dataKey="revenue" name="Total Revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="natural" dataKey="commission" name="Commission" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} strokeOpacity={isCommissionVisible ? 1 : 0} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
// --- END OF FILE src/components/RevenueChart.tsx ---