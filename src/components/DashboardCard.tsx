import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
}

export const DashboardCard = ({ title, value, icon: Icon, iconColor }: DashboardCardProps) => {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
