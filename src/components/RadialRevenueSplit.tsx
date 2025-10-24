import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface RadialRevenueSplitProps {
  revenueTotal: number; // total ingresos
  commissionTotal: number; // total comisiones
}

export const RadialRevenueSplit = ({ revenueTotal, commissionTotal }: RadialRevenueSplitProps) => {
  const net = Math.max(0, revenueTotal - commissionTotal);
  const data = [
    { name: 'Comisión', value: commissionTotal },
    { name: 'Neto', value: net },
  ];
  const COLORS = ['#bbbbbb', '#ffffff'];
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle>Comisión vs Neto</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(v: number, n) => [new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v), n]} />
              <Pie data={data} innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" nameKey="name">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={index === 0 ? 0.9 : 0.95} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

