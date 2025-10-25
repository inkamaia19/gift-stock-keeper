// --- START OF FILE src/components/ItemsTable.tsx ---

import { useState } from "react";
import { Item, ItemWithCalculated, ProductWithCalculated } from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
import { Package, Wrench, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SellItemDialog } from "./SellItemDialog";
import { EditItemDialog } from "./EditItemDialog";
import { DeleteItemDialog } from "./DeleteItemDialog";

interface ItemsTableProps {
  items: ItemWithCalculated[];
  rawItems: Item[];
  onSell: (itemId: string, quantity: number, pricePerUnit: number, commissionAmount: number) => void;
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
}

export const ItemsTable = ({ items, rawItems, onSell, onUpdate, onDelete }: ItemsTableProps) => {
  const [sellingItem, setSellingItem] = useState<ItemWithCalculated | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  if (items.length === 0) return <div className="text-center py-12 text-muted-foreground rounded-lg border bg-card"><p className="text-base">Tu catálogo está vacío</p><p className="text-xs mt-2">Agrega tu primer ítem para comenzar</p></div>;

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-16"></TableHead>
              <TableHead>Ítem</TableHead>
              <TableHead className="text-center">Stock inicial</TableHead>
              <TableHead className="text-center">Vendido</TableHead>
              <TableHead className="text-center">Stock actual</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isProduct = item.type === 'product';
              const productData = isProduct ? (item as ProductWithCalculated) : null;
              // ===== CORRECCIÓN CLAVE AQUÍ: Lógica para mostrar el botón de vender =====
              const canSell = isProduct ? productData.currentStock > 0 : true;

              return (
                <TableRow key={item.id} className="text-sm">
                  <TableCell><div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : (isProduct ? <Package className="h-5 w-5 text-muted-foreground" /> : <Wrench className="h-5 w-5 text-muted-foreground" />)}</div></TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{productData?.initialStock ?? '—'}</TableCell>
                  <TableCell className="text-center">{productData?.sold ?? '—'}</TableCell>
                  <TableCell className="text-center font-semibold">{productData?.currentStock ?? '—'}</TableCell>
                  <TableCell className="text-center"><Badge variant={isProduct ? (productData.status === 'Available' ? 'outline' : 'secondary') : 'outline'}>{isProduct ? (productData.status === 'Available' ? 'Disponible' : 'Agotado') : 'Servicio'}</Badge></TableCell>
                  <TableCell className="text-right"><div className="flex items-center justify-end gap-1.5">
                    {/* ===== CORRECCIÓN CLAVE AQUÍ: Renderizado condicional del botón ===== */}
                    {canSell && <Button variant="outline" size="sm" className="h-8" onClick={() => setSellingItem(item)}>Vender</Button>}
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingItem(rawItems.find(i => i.id === item.id) || null)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                    </DropdownMenuContent></DropdownMenu>
                  </div></TableCell>
                </TableRow>
              );})}
          </TableBody>
        </Table>
      </div>
      {sellingItem && <SellItemDialog item={sellingItem} onSell={onSell} open={!!sellingItem} onOpenChange={(open) => !open && setSellingItem(null)} />}
      {editingItem && <EditItemDialog item={editingItem} onUpdate={onUpdate} open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)} />}
      {deletingItem && <DeleteItemDialog itemName={deletingItem.name} onDelete={() => onDelete(deletingItem.id)} open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)} />}
    </>
  );
};
// --- END OF FILE src/components/ItemsTable.tsx ---
