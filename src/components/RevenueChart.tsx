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

  if (data.length === 0) return <Card><CardHeader><CardTitle>Rendimiento de Ventas</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center text-muted-foreground"><p className="text-sm">No hay ventas registradas</p></div></CardContent></Card>;

  const renderCustomLegend = (value: string, entry: any) => {
    const { dataKey } = entry;
    const isCommissionEntry = dataKey === 'commission';
    const isInactive = isCommissionEntry && !isCommissionVisible;

    return (
      <span className="flex items-center gap-2 mr-4">
        <span style={{ color: isInactive ? '#888' : 'inherit' }}>{value}</span>
        
        {isCommissionEntry && (
          <span
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsCommissionVisible(!isCommissionVisible);
            }}
          >
            {isCommissionVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </span>
        )}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader><CardTitle>Rendimiento de Ventas (Últimos 7 días)</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `S/${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
              formatter={(value: number, name: string) => [`S/${value.toFixed(2)}`, name]}
              cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
            />
            <Legend verticalAlign="top" height={36} formatter={renderCustomLegend} />
            
            <Line 
              type="natural"
              dataKey="revenue" 
              name="Ganancia Total"
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
            />

            {/* ===== CAMBIO CLAVE: La línea siempre se renderiza, pero su opacidad cambia ===== */}
            <Line 
              type="natural" 
              dataKey="commission"
              name="Comisión"
              stroke="hsl(142 71% 45%)"
              strokeWidth={2}
              dot={false}
              strokeOpacity={isCommissionVisible ? 1 : 0} // <--- ¡AQUÍ ESTÁ LA MAGIA!
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
// --- END OF FILE src/components/RevenueChart.tsx ---