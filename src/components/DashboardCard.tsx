// --- START OF FILE src/components/DashboardCard.tsx ---

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
}

export const DashboardCard = ({ title, value, description }: DashboardCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground pt-2">{description}</p>
      </CardContent>
    </Card>
  );
};

// --- END OF FILE src/components/DashboardCard.tsx ---