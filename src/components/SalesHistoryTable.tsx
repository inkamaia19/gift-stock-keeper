// --- START OF FILE src/components/SalesHistoryTable.tsx ---

import { useState, useMemo, Fragment } from "react";
import { Sale } from "@/types/inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "./ui/button";
import { Pencil, Trash2, ChevronDown, ChevronRight, ShoppingBasket } from "lucide-react";
import { EditSaleDialog } from "./EditSaleDialog";

interface SalesHistoryTableProps {
  sales: Sale[];
  onUpdateSale: (id: string, updates: Partial<Sale>) => void;
  onDeleteSale: (id: string) => void;
  onDeleteBundle: (bundleId: string) => void;
}

type GroupedSale = {
  isBundle: true;
  bundleId: string;
  sales: Sale[];
  totalAmount: number;
  totalCommission: number;
  date: string;
} | {
  isBundle: false;
  sale: Sale;
};

export const SalesHistoryTable = ({ sales, onUpdateSale, onDeleteSale, onDeleteBundle }: SalesHistoryTableProps) => {
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const groupedSales = useMemo((): GroupedSale[] => {
    const bundles: Record<string, Sale[]> = {};
    const singleSales: Sale[] = [];
    sales.forEach(sale => {
      if (sale.bundleId) {
        if (!bundles[sale.bundleId]) bundles[sale.bundleId] = [];
        bundles[sale.bundleId].push(sale);
      } else {
        singleSales.push(sale);
      }
    });
    const grouped: GroupedSale[] = Object.values(bundles).map(bundleSales => ({
      isBundle: true,
      bundleId: bundleSales[0].bundleId!,
      sales: bundleSales,
      totalAmount: bundleSales.reduce((sum, s) => sum + s.totalAmount, 0),
      totalCommission: bundleSales.reduce((sum, s) => sum + s.commissionAmount, 0),
      date: bundleSales[0].date,
    }));
    singleSales.forEach(sale => grouped.push({ isBundle: false, sale }));
    return grouped.sort((a, b) => {
      const dateA = a.isBundle ? a.date : a.sale.date;
      const dateB = b.isBundle ? b.date : b.sale.date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [sales]);

  const toggleBundle = (bundleId: string) => {
    const newSet = new Set(expandedBundles);
    if (newSet.has(bundleId)) newSet.delete(bundleId);
    else newSet.add(bundleId);
    setExpandedBundles(newSet);
  };

  const handleConfirmDelete = (id: string) => {
    if (confirmingDelete === id) {
      if (id.startsWith('bundle-')) {
        onDeleteBundle(id.replace('bundle-', ''));
      } else {
        onDeleteSale(id);
      }
      setConfirmingDelete(null);
    } else {
      setConfirmingDelete(id);
      setTimeout(() => setConfirmingDelete(null), 3000);
    }
  };

  if (sales.length === 0) return <div className="text-center py-12 text-muted-foreground rounded-lg border bg-card"><p className="text-lg">No transactions recorded</p></div>;
  
  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-12"></TableHead><TableHead>Item / Bundle</TableHead><TableHead className="text-center">Total Sale</TableHead><TableHead className="text-center">Commission Earned</TableHead><TableHead className="text-center">Date</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {groupedSales.map((group) => {
              if (group.isBundle) {
                const isExpanded = expandedBundles.has(group.bundleId);
                const deleteId = `bundle-${group.bundleId}`;
                return (
                  <Fragment key={group.bundleId}>
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell><Button variant="ghost" size="icon" onClick={() => toggleBundle(group.bundleId)}>{isExpanded ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}</Button></TableCell>
                      <TableCell><div className="flex items-center gap-2"><ShoppingBasket className="h-4 w-4"/><span>Bundle Sale ({group.sales.length} items)</span></div></TableCell>
                      <TableCell className="text-center">S/{group.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-green-400">S/{group.totalCommission.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-xs">{new Date(group.date).toLocaleString('es-ES', {dateStyle:'short', timeStyle:'short'})}</TableCell>
                      <TableCell className="text-right">
                        {/* ===== CORRECCIÓN CLAVE AQUÍ ===== */}
                        <Button variant={confirmingDelete === deleteId ? "destructive" : "ghost"} size={confirmingDelete === deleteId ? "sm" : "icon"} onClick={() => handleConfirmDelete(deleteId)}>
                          {confirmingDelete === deleteId ? "Confirm?" : <Trash2 className="h-4 w-4"/>}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && group.sales.map(sale => (
                      <TableRow key={sale.id} className="bg-background">
                        <TableCell></TableCell>
                        <TableCell className="pl-12 text-muted-foreground">{sale.itemName} <span className="text-xs"> (x{sale.quantity})</span></TableCell>
                        <TableCell className="text-center text-muted-foreground">S/{sale.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-center text-muted-foreground">S/{sale.commissionAmount.toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                )
              } else {
                const { sale } = group; 
                const deleteId = sale.id;
                return (
                  <TableRow key={sale.id}>
                    <TableCell></TableCell>
                    <TableCell className="font-medium">{sale.itemName}<span className="text-muted-foreground text-xs block">({sale.quantity} x S/{sale.pricePerUnit.toFixed(2)})</span></TableCell>
                    <TableCell className="text-center">S/{sale.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-center font-semibold text-green-400">S/{(sale.commissionAmount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-center text-muted-foreground text-xs">{new Date(sale.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditingSale(sale)}><Pencil className="h-4 w-4" /></Button>
                      {/* ===== CORRECCIÓN CLAVE AQUÍ ===== */}
                      <Button variant={confirmingDelete === deleteId ? "destructive" : "ghost"} size={confirmingDelete === deleteId ? "sm" : "icon"} onClick={() => handleConfirmDelete(deleteId)}>
                        {confirmingDelete === deleteId ? "Confirm?" : <Trash2 className="h-4 w-4"/>}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              }
            })}
          </TableBody>
        </Table>
      </div>
      {editingSale && <EditSaleDialog sale={editingSale} onUpdate={onUpdateSale} open={!!editingSale} onOpenChange={(open) => !open && setEditingSale(null)} />}
    </>
  );
};
// --- END OF FILE src/components/SalesHistoryTable.tsx ---