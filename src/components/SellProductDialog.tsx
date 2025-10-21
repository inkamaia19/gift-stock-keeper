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
          Sell
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell Product</DialogTitle>
          <DialogDescription>
            How many units of {productName} do you want to sell?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={currentStock}
              placeholder={`Max: ${currentStock}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Current stock: {currentStock} units
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Confirm Sale</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
