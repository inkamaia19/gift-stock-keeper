// --- START OF FILE src/pages/Index.tsx ---

import { useState } from "react";
import { Loader2, ListOrdered, BookOpen, Plus } from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useSales } from "@/hooks/useSales";
import { DashboardCard } from "@/components/DashboardCard";
import { AddItemDialog } from "@/components/AddItemDialog";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesHistoryTable } from "@/components/SalesHistoryTable";
import { BundleSaleDialog } from "@/components/BundleSaleDialog";
import { Button } from "@/components/ui/button";
import { CatalogView } from "@/components/CatalogView";
import { EditItemDialog } from "@/components/EditItemDialog";
import { SellItemDialog } from "@/components/SellItemDialog";
import { Item, ItemWithCalculated } from "@/types/inventory";
import { ClearInventoryDialog } from "@/components/ClearInventoryDialog";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const { allItems, itemsWithCalculated, addItem, updateItem, deleteItem, recordTransaction, recordBundleTransaction, clearAll: clearItems, getTotalItems, getTotalStock, getTotalSold, isLoading: isLoadingItems } = useItems();
  const { sales, getTotalCommissions, getChartDataByDate, updateSale, deleteSale, deleteBundle, clearAll: clearSales, isLoading: isLoadingSales } = useSales();
  
  const [isBundleSaleOpen, setIsBundleSaleOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [sellingItem, setSellingItem] = useState<ItemWithCalculated | null>(null);

  const handleClearAll = () => { clearItems(); clearSales(); };
  if (isLoadingItems || isLoadingSales) return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;

  const currencyFormatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <>
      <div className="flex h-full flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            {/* Botón principal ahora es naranja */}
            <Button onClick={() => {}}><Plus className="mr-2 h-4 w-4" /> Quick Create</Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto space-y-8 px-4 py-8">
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard title="Total Revenue" value={currencyFormatter.format(totalRevenue)} description="Total income from all sales" />
              <DashboardCard title="Total Commissions" value={currencyFormatter.format(getTotalCommissions())} description="Total commissions earned" />
              <DashboardCard title="Units Sold" value={getTotalSold()} description="Total products sold" />
              <DashboardCard title="Items in Catalog" value={getTotalItems()} description={`${getTotalStock()} units currently in stock`} />
            </section>

            <section>
              <RevenueChart data={getChartDataByDate()} />
            </section>
            
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-2xl font-semibold tracking-tight">Transaction History</h3>
                <Button variant="secondary" onClick={() => setIsCatalogOpen(true)} className="gap-2 w-full sm:w-auto">
                  <BookOpen className="h-4 w-4" />
                  View Full Catalog ({getTotalItems()} items)
                </Button>
              </div>
              <SalesHistoryTable sales={sales} onUpdateSale={(id, updates) => { updateSale({ id, updates }); }} onDeleteSale={deleteSale} onDeleteBundle={deleteBundle} />
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

// --- END OF FILE src/pages/Index.tsx ---