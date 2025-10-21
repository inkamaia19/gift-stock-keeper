// --- START OF FILE src/hooks/useSales.ts ---

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Sale } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

// --- Funciones de Acceso a Datos ---

const fetchSales = async (): Promise<Sale[]> => {
  return db.sales.toArray();
};

const clearAllSalesDB = async () => {
    await db.sales.clear();
};

// --- Hook de React ---

export const useSales = () => {
    const queryClient = useQueryClient();

    const { data: sales = [], isLoading: isLoadingSales } = useQuery({
        queryKey: ['sales'],
        queryFn: fetchSales,
    });

    const clearAllMutation = useMutation({
        mutationFn: clearAllSalesDB,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            toast({ title: "Éxito", description: "Historial de ventas limpiado." });
        }
    });

    const totalRevenue = useMemo(() => {
        return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    }, [sales]);

    const salesByDate = useMemo(() => {
        const salesMap: { [key: string]: number } = {};
        sales.forEach((sale) => {
            const date = new Date(sale.date).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
            });
            salesMap[date] = (salesMap[date] || 0) + sale.totalAmount;
        });

        return Object.entries(salesMap)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ordenar por fecha
            .slice(-7); // Últimos 7 días con actividad
    }, [sales]);

    return {
        sales,
        isLoading: isLoadingSales,
        getTotalRevenue: () => totalRevenue,
        getSalesByDate: () => salesByDate,
        clearAll: clearAllMutation.mutate,
    };
};
// --- END OF FILE src/hooks/useSales.ts ---