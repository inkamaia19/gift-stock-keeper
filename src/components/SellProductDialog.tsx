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
  productName: string;
  currentStock: number;
  onSell: (quantity: number) => boolean;
}

export const SellProductDialog = ({
  productName,
  currentStock,
  onSell,
}: SellProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");

  const handleSubmit = () => {
    const qty = parseInt(quantity, 10);
    if (onSell(qty)) {
      setQuantity("");
      setOpen(false);
    }
  };

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
            <p className="text-sm text-muted-foreground">
              Stock actual: {currentStock} unidades
            </p>
          </div>
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
