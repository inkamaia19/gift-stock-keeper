// --- START OF FILE src/components/SalesHistoryTable.tsx ---

import { useState } from "react";
import { Sale } from "@/types/inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { EditSaleDialog } from "./EditSaleDialog";

interface SalesHistoryTableProps {
  sales: Sale[];
  onUpdateSale: (id: string, updates: Partial<Sale>) => void;
}

export const SalesHistoryTable = ({ sales, onUpdateSale }: SalesHistoryTableProps) => {
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  if (sales.length === 0) return <div className="text-center py-12 text-muted-foreground rounded-lg border bg-card"><p className="text-lg">No hay ventas registradas</p><p className="text-sm mt-2">Cuando vendas un producto, aparecerá aquí.</p></div>;
  
  const sortedSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Total Venta</TableHead>
              <TableHead className="text-center">Comisión Ganada</TableHead>
              <TableHead className="text-center">Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSales.map((sale) => (
              <TableRow key={sale.id}>
                {/* ===== CAMBIO CLAVE: Moneda en la tabla ===== */}
                <TableCell className="font-medium">{sale.productName}<span className="text-muted-foreground text-xs block">({sale.quantity} x S/{sale.pricePerUnit.toFixed(2)})</span></TableCell>
                <TableCell className="text-center">S/{sale.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-center font-semibold text-green-400">S/{(sale.commissionAmount || 0).toFixed(2)}</TableCell>
                <TableCell className="text-center text-muted-foreground text-xs">{new Date(sale.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditingSale(sale)}><Pencil className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editingSale && (
        <EditSaleDialog sale={editingSale} onUpdate={onUpdateSale} open={!!editingSale} onOpenChange={(open) => !open && setEditingSale(null)} />
      )}
    </>
  );
};
// --- END OF FILE src/components/SalesHistoryTable.tsx ---