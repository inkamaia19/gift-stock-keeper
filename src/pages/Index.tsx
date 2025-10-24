// --- START OF FILE src/pages/Index.tsx (CORRECCIÓN FINAL) ---

import React, { useState } from "react";
import { Loader2, Plus, BookOpen } from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useSales } from "@/hooks/useSales";
import { Item, ItemWithCalculated } from "@/types/inventory";
import { useActions } from "@/contexts/ActionContext";
import { DashboardCard } from "@/components/DashboardCard";
import { AddItemDialog } from "@/components/AddItemDialog";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesHistoryTable } from "@/components/SalesHistoryTable";
import { BundleSaleDialog } from "@/components/BundleSaleDialog";
import { CatalogView } from "@/components/CatalogView";
import { EditItemDialog } from "@/components/EditItemDialog";
import { SellItemDialog } from "@/components/SellItemDialog";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const { allItems, itemsWithCalculated, addItem, updateItem, deleteItem, recordTransaction, recordBundleTransaction, getTotalItems, getTotalStock, isLoading: isLoadingItems } = useItems();
  const { sales, updateSale, deleteSale, deleteBundle, getChartDataFull, getTotalRevenue, getTotalCommissions, isLoading: isLoadingSales } = useSales();
  const { isCatalogOpen, setIsCatalogOpen, isBundleSaleOpen, setIsBundleSaleOpen } = useActions();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [sellingItem, setSellingItem] = useState<ItemWithCalculated | null>(null);
  const [hideRevenueAmount, setHideRevenueAmount] = useState<boolean>(() => {
    try { const v = localStorage.getItem('ui.hideRevenueAmount'); return v === '1'; } catch { return false; }
  });
  const [hideCommissionAmount, setHideCommissionAmount] = useState<boolean>(() => {
    try { const v = localStorage.getItem('ui.hideCommissionAmount'); return v === '1'; } catch { return false; }
  });

  // Persist preferences
  React.useEffect(() => { try { localStorage.setItem('ui.hideRevenueAmount', hideRevenueAmount ? '1' : '0'); } catch {} }, [hideRevenueAmount]);
  React.useEffect(() => { try { localStorage.setItem('ui.hideCommissionAmount', hideCommissionAmount ? '1' : '0'); } catch {} }, [hideCommissionAmount]);

  if (isLoadingItems || isLoadingSales) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;
  }

  const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  const totalRevenue = getTotalRevenue();
  const totalCommission = getTotalCommissions();
  const salesCount = sales.length;

  return (
    <>
      <div className="flex h-full flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
          <div className="flex h-16 items-center justify-between px-6 sm:px-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Panel</h1>
            </div>
            <div className="flex items-center gap-2" />
          </div>
        </header>
        
        {/* Usamos la estructura original que ocupa todo el ancho */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* ELIMINAMOS el div con max-w-7xl para que el contenido se expanda */}
          <div className="space-y-8">
            <section className="space-y-3">
              <div className="flex items-center justify-end">
                <span className="text-xs text-muted-foreground">*** PEN</span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                  title="Ingresos Totales"
                  value={currencyFormatter.format(totalRevenue)}
                  trend=""
                  mainText="Acumulado período actual"
                  secondaryText="Basado en ventas registradas"
                  hideable
                  hidden={hideRevenueAmount}
                  onToggleHidden={() => setHideRevenueAmount(v => !v)}
                />
                <DashboardCard
                  title="Comisiones"
                  value={currencyFormatter.format(totalCommission)}
                  trend=""
                  mainText="Comisiones acumuladas"
                  secondaryText="Todas las ventas"
                  hideable
                  hidden={hideCommissionAmount}
                  onToggleHidden={() => setHideCommissionAmount(v => !v)}
                />
                <DashboardCard title="Ventas registradas" value={salesCount} trend="" mainText="Conteo de transacciones" secondaryText="Incluye paquetes" />
                <DashboardCard title="Stock disponible" value={getTotalStock()} trend="" mainText="Inventario restante" secondaryText="Solo productos" />
              </div>
            </section>

            <section>
              <RevenueChart data={getChartDataFull()} />
            </section>
            
            
            
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-2xl font-semibold tracking-tight">Historial de transacciones</h3>
                <div className="flex gap-4">
                  <AddItemDialog onAdd={addItem}>
                    <Button variant="ghost" className="gap-2"><Plus className="h-4 w-4" />Agregar ítem</Button>
                  </AddItemDialog>
                  <Button variant="ghost" onClick={() => setIsCatalogOpen(true)} className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Ver catálogo completo ({getTotalItems()} ítems)
                  </Button>
                  <Button variant="ghost" onClick={() => setIsBundleSaleOpen(true)} className="gap-2">
                    Venta agrupada
                  </Button>
                </div>
              </div>
              <SalesHistoryTable sales={sales} onUpdateSale={(id, updates) => { updateSale({ id, updates }); }} onDeleteSale={deleteSale} onDeleteBundle={deleteBundle}/>
            </section>
          </div>
        </main>
      </div>

      <CatalogView open={isCatalogOpen} onOpenChange={setIsCatalogOpen} allItems={allItems} itemsWithCalculated={itemsWithCalculated} onSell={setSellingItem} onUpdate={setEditingItem} onDelete={deleteItem} />
      <BundleSaleDialog allItems={allItems} onConfirm={recordBundleTransaction} open={isBundleSaleOpen} onOpenChange={setIsBundleSaleOpen} />
      {sellingItem && <SellItemDialog item={sellingItem} onSell={(itemId, quantity, pricePerUnit, commissionAmount) => { recordTransaction({ itemId, quantity, pricePerUnit, commissionAmount }); }} open={!!sellingItem} onOpenChange={(open) => !open && setSellingItem(null)} />}
      {editingItem && <EditItemDialog item={editingItem} onUpdate={updateItem} open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)} />}
    </>
  );
};

export default Index;
