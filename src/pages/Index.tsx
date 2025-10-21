import { Package, TrendingUp, ShoppingBag } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { DashboardCard } from "@/components/DashboardCard";
import { InventoryTable } from "@/components/InventoryTable";
import { AddProductDialog } from "@/components/AddProductDialog";
import { ClearInventoryDialog } from "@/components/ClearInventoryDialog";

const Index = () => {
  const {
    products,
    addProduct,
    sellProduct,
    clearAll,
    getTotalProducts,
    getTotalStock,
    getTotalSold,
  } = useInventory();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Gestor de Inventario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus productos de segunda mano para marketplace
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Panel de Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard
              title="Total Productos"
              value={getTotalProducts()}
              icon={Package}
              iconColor="bg-muted text-foreground"
            />
            <DashboardCard
              title="Stock Disponible"
              value={getTotalStock()}
              icon={ShoppingBag}
              iconColor="bg-muted text-foreground"
            />
            <DashboardCard
              title="Unidades Vendidas"
              value={getTotalSold()}
              icon={TrendingUp}
              iconColor="bg-muted text-foreground"
            />
          </div>
        </section>

        {/* Inventory Table */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">Inventario</h2>
            <div className="flex gap-2">
              <AddProductDialog onAdd={addProduct} />
              {products.length > 0 && <ClearInventoryDialog onClear={clearAll} />}
            </div>
          </div>
          <InventoryTable products={products} onSell={sellProduct} />
        </section>
      </main>

      <footer className="border-t mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Gestor de Inventario. Todos los datos se guardan localmente.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
