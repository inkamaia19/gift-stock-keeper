// --- START OF FILE src/components/InventoryTable.tsx ---

import { useState } from "react";
import { Product, ProductWithCalculated } from "@/types/inventory";
import { SellProductDialog } from "./SellProductDialog";
import { Badge } from "@/components/ui/badge";
import { Package, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditProductDialog } from "./EditProductDialog";
import { DeleteProductDialog } from "./DeleteProductDialog";

interface InventoryTableProps {
  products: ProductWithCalculated[];
  rawProducts: Product[];
  // ===== CORRECCIÓN AQUÍ: Añadido commissionPercent =====
  onSell: (id: string, quantity: number, pricePerUnit: number, commissionPercent: number) => boolean;
  onUpdate: (id: string, name: string, initialStock: number, imageUrl?: string) => void;
  onDelete: (id: string) => void;
}

export const InventoryTable = ({ products, rawProducts, onSell, onUpdate, onDelete }: InventoryTableProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No hay productos en el inventario</p>
        <p className="text-sm mt-2">Agrega tu primer producto para comenzar</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Stock Inicial</TableHead>
              <TableHead className="text-center">Vendidos</TableHead>
              <TableHead className="text-center">Stock Actual</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? ( <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> ) : ( <Package className="h-5 w-5 text-muted-foreground" /> )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-center">{product.initialStock}</TableCell>
                <TableCell className="text-center">{product.sold}</TableCell>
                <TableCell className="text-center font-semibold">{product.currentStock}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={product.status === "Available" ? "default" : "secondary"}>
                    {product.status === "Available" ? "Disponible" : "Agotado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {product.currentStock > 0 && (
                      <SellProductDialog productId={product.id} productName={product.name} currentStock={product.currentStock} onSell={(qty, price, commission) => onSell(product.id, qty, price, commission)} />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingProduct(rawProducts.find(p => p.id === product.id) || null)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingProduct(product)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          onUpdate={onUpdate}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        />
      )}

      {deletingProduct && (
        <DeleteProductDialog
          productName={deletingProduct.name}
          onDelete={() => onDelete(deletingProduct.id)}
          open={!!deletingProduct}
          onOpenChange={(open) => !open && setDeletingProduct(null)}
        />
      )}
    </>
  );
};
// --- END OF FILE src/components/InventoryTable.tsx ---