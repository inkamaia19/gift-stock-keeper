// --- START OF FILE src/components/DashboardCard.tsx (REDiseñado) ---

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, HelpCircle, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  trend: string;
  mainText: string;
  secondaryText: string;
  hideable?: boolean;
  hidden?: boolean;
  onToggleHidden?: () => void;
}

export const DashboardCard = ({ title, value, trend, mainText, secondaryText, hideable = false, hidden = false, onToggleHidden }: DashboardCardProps) => {
  const isNegativeTrend = trend.startsWith('-');
  const TrendIcon = isNegativeTrend ? TrendingDown : TrendingUp;

  return (
    <Card className="border border-border shadow-sm bg-card p-2 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Badge
          variant="secondary"
          className={cn(
            "px-2 py-0.5 text-xs font-semibold bg-transparent flex items-center gap-1",
            "text-muted-foreground border border-border"
          )}
        >
          <TrendIcon className="h-3 w-3 text-muted-foreground" />
          {trend}
        </Badge>
        {hideable && (
          <button
            type="button"
            onClick={onToggleHidden}
            className="ml-2 h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={hidden ? 'Mostrar valor' : 'Ocultar valor'}
            title={hidden ? 'Mostrar valor' : 'Ocultar valor'}
          >
            {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
      </CardHeader>
      
      <CardContent className="flex flex-col items-start">
        <div className="text-3xl font-bold">{hidden ? 'S/ ***' : value}</div>
        <p className="text-sm font-medium pt-4 flex items-center gap-1.5">
          {mainText}
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </p>
        <p className="text-xs text-muted-foreground">{secondaryText}</p>
      </CardContent>
    </Card>
  );
};
