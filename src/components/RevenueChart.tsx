import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ganancias Brutas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No hay ventas registradas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganancias Brutas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Ganancia"]}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--foreground))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--foreground))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
