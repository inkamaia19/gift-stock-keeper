// --- START OF FILE src/pages/Index.tsx (CORRECCIÓN FINAL) ---

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useSales } from "@/hooks/useSales";
import { Item, ItemWithCalculated } from "@/types/inventory";
import { useActions } from "@/contexts/ActionContext";
import { DashboardCard } from "@/components/DashboardCard";
import { RevenueChart } from "@/components/RevenueChart";
import { SalesHistoryTable } from "@/components/SalesHistoryTable";
import { BundleSaleDialog } from "@/components/BundleSaleDialog";
import { CatalogView } from "@/components/CatalogView";
import { EditItemDialog } from "@/components/EditItemDialog";
import { SellItemDialog } from "@/components/SellItemDialog";
// import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useI18n } from "@/contexts/I18nContext";

const Index = () => {
  const { allItems, itemsWithCalculated, addItem, updateItem, deleteItem, recordTransaction, recordBundleTransaction, getTotalItems, getTotalStock, isLoading: isLoadingItems } = useItems();
  const { sales, updateSale, deleteSale, deleteBundle, getChartDataFull, getTotalRevenue, getTotalCommissions, isLoading: isLoadingSales } = useSales();
  const { isCatalogOpen, setIsCatalogOpen, isBundleSaleOpen, setIsBundleSaleOpen } = useActions();
  const { t } = useI18n();
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
    return (
      <div className="flex h-full flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
          <div className="flex h-16 items-center justify-between px-6 sm:px-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="flex items-center gap-2" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="mt-4 h-10 w-32 bg-muted rounded animate-pulse" />
                <div className="mt-2 h-3 w-40 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </section>
          <section>
            <div className="h-[220px] sm:h-[260px] md:h-[320px] w-full rounded-xl border border-border bg-card animate-pulse" />
          </section>
          <section>
            <div className="h-6 w-48 bg-muted rounded mb-4 animate-pulse" />
            <div className="w-full rounded-lg border border-border bg-card overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 border-b border-border last:border-0 bg-muted/20 animate-pulse" />
              ))}
            </div>
          </section>
        </main>
      </div>
    );
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
              <h1 className="text-xl font-semibold">{t('app_title')}</h1>
            </div>
            <div className="flex items-center gap-2" />
          </div>
        </header>
        
        <main className="page-content flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="space-y-4 pt-0 [&>*:first-child]:mt-0 [&>*:first-child]:pt-0">
            <section className="mt-0 pt-0 space-y-3">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                  title={t('card_total_revenue')}
                  value={currencyFormatter.format(totalRevenue)}
                  trend=""
                  mainText={t('card_total_revenue_desc')}
                  secondaryText=""
                  hideable
                  hidden={hideRevenueAmount}
                  onToggleHidden={() => setHideRevenueAmount(v => !v)}
                />
                <DashboardCard
                  title={t('card_commissions')}
                  value={currencyFormatter.format(totalCommission)}
                  trend=""
                  mainText={t('card_commissions_desc')}
                  secondaryText=""
                  hideable
                  hidden={hideCommissionAmount}
                  onToggleHidden={() => setHideCommissionAmount(v => !v)}
                />
                <DashboardCard title={t('card_sales_count')} value={salesCount} trend="" mainText={t('card_sales_count_desc')} secondaryText="" />
                <DashboardCard title={t('card_stock')} value={getTotalStock()} trend="" mainText={t('card_stock_desc')} secondaryText="" />
              </div>
            </section>

            <section className="">
              <RevenueChart data={getChartDataFull()} />
            </section>
            
            
            
            <section className="">
              <div className="mb-3 sm:mb-4">
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">{t('tx_history')}</h3>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <SalesHistoryTable sales={sales} onUpdateSale={(id, updates) => { updateSale({ id, updates }); }} onDeleteSale={deleteSale} onDeleteBundle={deleteBundle}/>
              </div>
            </section>
          </div>
        </main>
      </div>

      <CatalogView open={isCatalogOpen} onOpenChange={setIsCatalogOpen} allItems={allItems} itemsWithCalculated={itemsWithCalculated} onSell={setSellingItem} onUpdate={setEditingItem} onDelete={deleteItem} onAdd={addItem} />
      <BundleSaleDialog allItems={allItems} onConfirm={recordBundleTransaction} open={isBundleSaleOpen} onOpenChange={setIsBundleSaleOpen} />
      {sellingItem && <SellItemDialog item={sellingItem} onSell={(itemId, quantity, pricePerUnit, commissionAmount) => { recordTransaction({ itemId, quantity, pricePerUnit, commissionAmount }); }} open={!!sellingItem} onOpenChange={(open) => !open && setSellingItem(null)} />}
      {editingItem && <EditItemDialog item={editingItem} onUpdate={updateItem} open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)} />}
    </>
  );
};

export default Index;
