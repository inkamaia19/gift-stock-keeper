import { ProductWithCalculated } from "@/types/inventory";
import { SellProductDialog } from "./SellProductDialog";
import { Badge } from "@/components/ui/badge";
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
  onSell: (id: string, quantity: number) => boolean;
}

export const InventoryTable = ({ products, onSell }: InventoryTableProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No products in inventory</p>
        <p className="text-sm mt-2">Add your first product to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead className="text-center">Initial Stock</TableHead>
            <TableHead className="text-center">Sold</TableHead>
            <TableHead className="text-center">Current Stock</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-center">{product.initialStock}</TableCell>
              <TableCell className="text-center">{product.sold}</TableCell>
              <TableCell className="text-center font-semibold">
                {product.currentStock}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={product.status === "Available" ? "default" : "destructive"}
                  className={
                    product.status === "Available"
                      ? "bg-accent hover:bg-accent/90"
                      : ""
                  }
                >
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {product.currentStock > 0 && (
                  <SellProductDialog
                    productName={product.name}
                    currentStock={product.currentStock}
                    onSell={(qty) => onSell(product.id, qty)}
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
