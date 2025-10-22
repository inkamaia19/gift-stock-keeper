// --- START OF FILE src/pages/Index.tsx ---

import { Package, TrendingUp, ShoppingBag, DollarSign, Loader2, ListOrdered } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useSales } from "@/hooks/useSales";
import { DashboardCard } from "@/components/DashboardCard";
import { InventoryTable } from "@/components/InventoryTable";
import { AddProductDialog } from "@/components/AddProductDialog";
import { ClearInventoryDialog } from "@/components/ClearInventoryDialog";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesHistoryTable } from "@/components/SalesHistoryTable";

const Index = () => {
  const { products, rawProducts, addProduct, updateProduct, deleteProduct, sellProduct, clearAll: clearProducts, getTotalProducts, getTotalStock, getTotalSold, isLoading: isLoadingInventory } = useInventory();
  const { sales, getTotalCommissions, getChartDataByDate, updateSale, clearAll: clearSales, isLoading: isLoadingSales } = useSales();

  const handleClearAll = () => { clearProducts(); clearSales(); };

  if (isLoadingInventory || isLoadingSales) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card shadow-md">
        <div className="container mx-auto px-4 py-6"><h1 className="text-3xl font-bold">Gestor de Inventario</h1><p className="text-muted-foreground mt-1">Gestiona tus productos de segunda mano para marketplace</p></div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Panel de Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Total Productos" value={getTotalProducts()} icon={Package} iconColor="bg-muted text-foreground" />
            <DashboardCard title="Stock Disponible" value={getTotalStock()} icon={ShoppingBag} iconColor="bg-muted text-foreground" />
            <DashboardCard title="Unidades Vendidas" value={getTotalSold()} icon={TrendingUp} iconColor="bg-muted text-foreground" />
            {/* ===== CAMBIO CLAVE: Moneda en el Dashboard ===== */}
            <DashboardCard title="Comisiones Totales" value={`S/${getTotalCommissions().toFixed(2)}`} icon={DollarSign} iconColor="bg-muted text-foreground" />
          </div>
        </section>

        <section><RevenueChart data={getChartDataByDate()} /></section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">Inventario</h2>
            <div className="flex gap-2">
              <AddProductDialog onAdd={(name, initialStock, imageUrl) => { addProduct({ name, initialStock, imageUrl }); return true; }} />
              {products.length > 0 && <ClearInventoryDialog onClear={handleClearAll} />}
            </div>
          </div>
          <InventoryTable products={products} rawProducts={rawProducts}
            onSell={(id, quantity, pricePerUnit, commissionAmount) => { sellProduct({ id, quantity, pricePerUnit, commissionAmount }); return true; }}
            onUpdate={(id, name, initialStock, imageUrl) => { updateProduct({ id, name, initialStock, imageUrl }); }} 
            onDelete={deleteProduct} />
        </section>
        
        <section>
          <div className="flex items-center gap-3 mb-6"><ListOrdered className="h-6 w-6" /><h2 className="text-2xl font-semibold">Historial de Ventas</h2></div>
          <SalesHistoryTable sales={sales} onUpdateSale={(id, updates) => { updateSale({ id, updates }); }} />
        </section>
      </main>
      <footer className="border-t mt-16 py-6"><div className="container mx-auto px-4 text-center text-sm text-muted-foreground"><p>© 2025 Gestor de Inventario. Todos los datos se guardan localmente.</p></div></footer>
    </div>
  );
};
export default Index;
// --- END OF FILE src/pages/Index.tsx ---