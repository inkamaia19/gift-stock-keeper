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
          <h1 className="text-3xl font-bold text-primary">My Inventory Manager</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your gifted products inventory
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard
              title="Total Products"
              value={getTotalProducts()}
              icon={Package}
              iconColor="bg-primary/10 text-primary"
            />
            <DashboardCard
              title="Total Stock Available"
              value={getTotalStock()}
              icon={ShoppingBag}
              iconColor="bg-accent/10 text-accent"
            />
            <DashboardCard
              title="Total Units Sold"
              value={getTotalSold()}
              icon={TrendingUp}
              iconColor="bg-warning/10 text-warning"
            />
          </div>
        </section>

        {/* Inventory Table */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">Inventory</h2>
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
          <p>© 2025 My Inventory Manager. All data stored locally on your device.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
