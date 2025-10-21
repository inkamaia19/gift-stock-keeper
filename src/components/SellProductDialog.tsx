import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SellProductDialogProps {
  productId: string;
  productName: string;
  currentStock: number;
  onSell: (quantity: number, pricePerUnit: number) => boolean;
}

export const SellProductDialog = ({
  productId,
  productName,
  currentStock,
  onSell,
}: SellProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = () => {
    const qty = parseInt(quantity, 10);
    const pricePerUnit = parseFloat(price);
    
    if (onSell(qty, pricePerUnit)) {
      setQuantity("");
      setPrice("");
      setOpen(false);
    }
  };

  const totalAmount = (parseInt(quantity) || 0) * (parseFloat(price) || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          Vender
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vender Producto</DialogTitle>
          <DialogDescription>
            ¿Cuántas unidades de {productName} quieres vender?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={currentStock}
              placeholder={`Máx: ${currentStock}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio por Unidad ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          {totalAmount > 0 && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-medium">
                Total: ${totalAmount.toFixed(2)}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Stock actual: {currentStock} unidades
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Confirmar Venta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
