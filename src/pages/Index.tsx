// --- START OF FILE src/pages/Index.tsx ---

import { useState } from "react";
import { Library, Package, TrendingUp, DollarSign, Loader2, ListOrdered, ShoppingBasket } from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useSales } from "@/hooks/useSales";
import { DashboardCard } from "@/components/DashboardCard";
import { AddItemDialog } from "@/components/AddItemDialog";
import { ClearInventoryDialog } from "@/components/ClearInventoryDialog";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesHistoryTable } from "@/components/SalesHistoryTable";
import { ItemsTable } from "@/components/ItemsTable";
import { BundleSaleDialog } from "@/components/BundleSaleDialog";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { allItems, itemsWithCalculated, addItem, updateItem, deleteItem, recordTransaction, recordBundleTransaction, clearAll: clearItems, getTotalItems, getTotalStock, getTotalSold, isLoading: isLoadingItems } = useItems();
  const { sales, getTotalCommissions, getChartDataByDate, updateSale, deleteSale, deleteBundle, clearAll: clearSales, isLoading: isLoadingSales } = useSales();
  const [isBundleSaleOpen, setIsBundleSaleOpen] = useState(false);
  const handleClearAll = () => { clearItems(); clearSales(); };
  if (isLoadingItems || isLoadingSales) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-card shadow-md">
          <div className="container mx-auto px-4 py-6"><h1 className="text-3xl font-bold">Business Manager</h1><p className="text-muted-foreground mt-1">Manage your products, services, and commissions</p></div>
        </header>
        <main className="container mx-auto px-4 py-8 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard title="Catalog Items" value={getTotalItems()} icon={Library} iconColor="bg-muted text-foreground" />
              <DashboardCard title="Product Stock" value={getTotalStock()} icon={Package} iconColor="bg-muted text-foreground" />
              <DashboardCard title="Units Sold" value={getTotalSold()} icon={TrendingUp} iconColor="bg-muted text-foreground" />
              <DashboardCard title="Total Commissions" value={`S/${getTotalCommissions().toFixed(2)}`} icon={DollarSign} iconColor="bg-muted text-foreground" />
            </div>
          </section>
          <section><RevenueChart data={getChartDataByDate()} /></section>
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold">Catalog (Products & Services)</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsBundleSaleOpen(true)} className="gap-2"><ShoppingBasket className="h-4 w-4" />Record Bundle Sale</Button>
                <AddItemDialog onAdd={addItem} />
                {allItems.length > 0 && <ClearInventoryDialog onClear={handleClearAll} />}
              </div>
            </div>
            <ItemsTable items={itemsWithCalculated} rawItems={allItems} onSell={(itemId, quantity, pricePerUnit, commissionAmount) => { recordTransaction({ itemId, quantity, pricePerUnit, commissionAmount }); }} onUpdate={updateItem} onDelete={deleteItem} />
          </section>
          <section>
            <div className="flex items-center gap-3 mb-6"><ListOrdered className="h-6 w-6" /><h2 className="text-2xl font-semibold">Transaction History</h2></div>
            <SalesHistoryTable sales={sales} onUpdateSale={(id, updates) => { updateSale({ id, updates }); }} onDeleteSale={deleteSale} onDeleteBundle={deleteBundle} />
          </section>
        </main>
        <footer className="border-t mt-16 py-6"><div className="container mx-auto px-4 text-center text-sm text-muted-foreground"><p>© 2025 Business Manager. All data is saved locally.</p></div></footer>
      </div>
      <BundleSaleDialog allItems={allItems} onConfirm={recordBundleTransaction} open={isBundleSaleOpen} onOpenChange={setIsBundleSaleOpen} />
    </>
  );
};
export default Index;
// --- END OF FILE src/pages/Index.tsx ---