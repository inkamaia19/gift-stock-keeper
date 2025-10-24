// --- START OF FILE src/hooks/useSales.ts ---

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Sale } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

const fetchSales = async (): Promise<Sale[]> => db.sales.toArray();
const clearAllSalesDB = async () => db.sales.clear();
const updateSaleDB = async ({ id, updates }: { id: string, updates: Partial<Sale> }) => { await db.sales.update(id, updates); return { id, updates }; };
const deleteSaleDB = async (saleId: string) => {
  return db.transaction('rw', db.sales, db.items, async () => {
    const saleToDelete = await db.sales.get(saleId);
    if (!saleToDelete) throw new Error("Sale not found");
    const item = await db.items.get(saleToDelete.itemId);
    if (item && item.type === 'product') { item.sold -= saleToDelete.quantity; await db.items.put(item); }
    await db.sales.delete(saleId);
    return saleId;
  });
};
const deleteBundleDB = async (bundleId: string) => {
  return db.transaction('rw', db.sales, db.items, async () => {
    const salesInBundle = await db.sales.where({ bundleId }).toArray();
    if (salesInBundle.length === 0) throw new Error("Bundle not found");
    for (const sale of salesInBundle) {
      const item = await db.items.get(sale.itemId);
      if (item && item.type === 'product') { item.sold -= sale.quantity; await db.items.put(item); }
    }
    await db.sales.where({ bundleId }).delete();
    return bundleId;
  });
};

export const useSales = () => {
    const queryClient = useQueryClient();
    const { data: sales = [], isLoading: isLoadingSales } = useQuery({ queryKey: ['sales'], queryFn: fetchSales });
    const updateSaleMutation = useMutation({ mutationFn: updateSaleDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales'] }); toast({ title: "Success", description: "Sale updated successfully." }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); }, });
    const deleteSaleMutation = useMutation({ mutationFn: deleteSaleDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales'] }); queryClient.invalidateQueries({ queryKey: ['items'] }); toast({ title: "Success", description: "Sale deleted." }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); }, });
    const deleteBundleMutation = useMutation({ mutationFn: deleteBundleDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales'] }); queryClient.invalidateQueries({ queryKey: ['items'] }); toast({ title: "Success", description: "Bundle sale deleted." }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); }, });
    const clearAllMutation = useMutation({ mutationFn: clearAllSalesDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales'] }); toast({ title: "Success", description: "Sales history has been cleared." }); } });
    
    // Totales agregados
    const totalCommissions = useMemo(() => sales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0), [sales]);
    const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0), [sales]);
    
    // ===== CORRECCIÓN CLAVE AQUÍ (Añadimos [sales]) =====
    const chartDataByDate = useMemo(() => {
        const salesMap: { [key: string]: { revenue: number, commission: number, originalDate: Date } } = {};
        sales.forEach((sale) => {
            const dateObj = new Date(sale.date);
            const dateKey = dateObj.toISOString().split('T')[0];
            if (!salesMap[dateKey]) { salesMap[dateKey] = { revenue: 0, commission: 0, originalDate: dateObj }; }
            salesMap[dateKey].revenue += sale.totalAmount;
            salesMap[dateKey].commission += (sale.commissionAmount || 0);
        });
        return Object.entries(salesMap)
            .sort(([, a], [, b]) => a.originalDate.getTime() - b.originalDate.getTime())
            .map(([_, data]) => ({ date: data.originalDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }), revenue: data.revenue, commission: data.commission }))
            .slice(-7);
    }, [sales]);

    // Dataset completo (sin recorte) para que los componentes puedan decidir el rango
    const chartDataFull = useMemo(() => {
        const salesMap: { [key: string]: { revenue: number, commission: number, originalDate: Date } } = {};
        sales.forEach((sale) => {
            const dateObj = new Date(sale.date);
            const dateKey = dateObj.toISOString().split('T')[0];
            if (!salesMap[dateKey]) { salesMap[dateKey] = { revenue: 0, commission: 0, originalDate: dateObj }; }
            salesMap[dateKey].revenue += sale.totalAmount;
            salesMap[dateKey].commission += (sale.commissionAmount || 0);
        });
        return Object.entries(salesMap)
            .sort(([, a], [, b]) => a.originalDate.getTime() - b.originalDate.getTime())
            .map(([_, data]) => ({ dateISO: data.originalDate.toISOString(), label: data.originalDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }), revenue: data.revenue, commission: data.commission }));
    }, [sales]);

    return { sales, isLoading: isLoadingSales, getTotalCommissions: () => totalCommissions, getTotalRevenue: () => totalRevenue, getChartDataByDate: () => chartDataByDate, getChartDataFull: () => chartDataFull, updateSale: updateSaleMutation.mutate, deleteSale: deleteSaleMutation.mutate, deleteBundle: deleteBundleMutation.mutate, clearAll: clearAllMutation.mutate };
};
// --- END OF FILE src/hooks/useSales.ts ---
