// --- START OF FILE src/hooks/useSales.ts ---

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Sale } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

const fetchSales = async (): Promise<Sale[]> => db.sales.toArray();
const clearAllSalesDB = async () => db.sales.clear();
const updateSaleDB = async ({ id, updates }: { id: string, updates: Partial<Sale> }) => {
    await db.sales.update(id, updates);
    return { id, updates };
};

export const useSales = () => {
    const queryClient = useQueryClient();
    const { data: sales = [], isLoading: isLoadingSales } = useQuery({ queryKey: ['sales'], queryFn: fetchSales });

    const updateSaleMutation = useMutation({
        mutationFn: updateSaleDB,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            toast({ title: "Éxito", description: "Venta actualizada correctamente." });
        },
        onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }) },
    });
    
    const clearAllMutation = useMutation({ mutationFn: clearAllSalesDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales'] }); toast({ title: "Éxito", description: "Historial de ventas limpiado." }); } });

    const totalCommissions = useMemo(() => {
        return sales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);
    }, [sales]);

    // ===== CAMBIO CLAVE AQUÍ: Preparamos datos para ambas líneas del gráfico =====
    const chartDataByDate = useMemo(() => {
        const salesMap: { [key: string]: { revenue: number, commission: number } } = {};
        sales.forEach((sale) => {
            const date = new Date(sale.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
            if (!salesMap[date]) {
                salesMap[date] = { revenue: 0, commission: 0 };
            }
            salesMap[date].revenue += sale.totalAmount;
            salesMap[date].commission += (sale.commissionAmount || 0);
        });
        
        return Object.entries(salesMap)
            .map(([date, data]) => ({ 
                date, 
                revenue: data.revenue, 
                commission: data.commission 
            }))
            .slice(-7);
    }, [sales]);

    return {
        sales,
        isLoading: isLoadingSales,
        getTotalCommissions: () => totalCommissions,
        getChartDataByDate: () => chartDataByDate, // Exportamos la nueva función
        updateSale: updateSaleMutation.mutate,
        clearAll: clearAllMutation.mutate,
    };
};
// --- END OF FILE src/hooks/useSales.ts ---