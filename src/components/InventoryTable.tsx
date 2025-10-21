import { ProductWithCalculated } from "@/types/inventory";
import { SellProductDialog } from "./SellProductDialog";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InventoryTableProps {
  products: ProductWithCalculated[];
  onSell: (id: string, quantity: number, pricePerUnit: number) => boolean;
}

export const InventoryTable = ({ products, onSell }: InventoryTableProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No hay productos en el inventario</p>
        <p className="text-sm mt-2">Agrega tu primer producto para comenzar</p>
      </div>
    );
  }

  return (
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
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-center">{product.initialStock}</TableCell>
              <TableCell className="text-center">{product.sold}</TableCell>
              <TableCell className="text-center font-semibold">
                {product.currentStock}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={product.status === "Available" ? "default" : "secondary"}
                >
                  {product.status === "Available" ? "Disponible" : "Agotado"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {product.currentStock > 0 && (
                  <SellProductDialog
                    productId={product.id}
                    productName={product.name}
                    currentStock={product.currentStock}
                    onSell={(qty, price) => onSell(product.id, qty, price)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
