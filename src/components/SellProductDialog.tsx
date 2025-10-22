// --- START OF FILE src/components/SellProductDialog.tsx ---

import { useState, useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SellProductDialogProps {
  productName: string;
  currentStock: number;
  onSell: (quantity: number, pricePerUnit: number, commissionAmount: number) => boolean;
}

export const SellProductDialog = ({ productName, currentStock, onSell }: SellProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [commissionMode, setCommissionMode] = useState<'percent' | 'fixed'>('percent');
  const [commissionValue, setCommissionValue] = useState("");

  const totalAmount = useMemo(() => (parseFloat(quantity) || 0) * (parseFloat(price) || 0), [quantity, price]);

  const { finalCommissionAmount, calculatedEquivalent } = useMemo(() => {
    const value = parseFloat(commissionValue) || 0;
    if (totalAmount === 0 || value === 0) return { finalCommissionAmount: 0, calculatedEquivalent: "" };
    if (commissionMode === 'percent') {
        const amount = totalAmount * (value / 100);
        // ===== CAMBIO CLAVE: Moneda en el diálogo =====
        return { finalCommissionAmount: amount, calculatedEquivalent: `Equivale a: S/${amount.toFixed(2)}` };
    } else {
        const percentage = (value / totalAmount) * 100;
        return { finalCommissionAmount: value, calculatedEquivalent: `Equivale a: ${percentage.toFixed(2)}%` };
    }
  }, [commissionValue, commissionMode, totalAmount]);

  const handleSubmit = () => { if (onSell(parseInt(quantity, 10), parseFloat(price), finalCommissionAmount)) { setQuantity(""); setPrice(""); setCommissionValue(""); setOpen(false); } };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-2"><ShoppingCart className="h-4 w-4" />Vender</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Vender Producto</DialogTitle><DialogDescription>Rellena los detalles de la venta de {productName}.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="quantity">Cantidad</Label><Input id="quantity" type="number" min="1" max={currentStock} placeholder={`Máx: ${currentStock}`} value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            {/* ===== CAMBIO CLAVE: Moneda en el diálogo ===== */}
            <div className="space-y-2"><Label htmlFor="price">Precio / Unidad (S/)</Label><Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Comisión Ganada</Label>
            {/* ===== CAMBIO CLAVE: Moneda en el diálogo ===== */}
            <div className="flex items-center space-x-2"><Label htmlFor="mode-percent" className="text-sm">Porcentaje (%)</Label><Switch id="commission-mode-switch" checked={commissionMode === 'fixed'} onCheckedChange={(c) => setCommissionMode(c ? 'fixed' : 'percent')} /><Label htmlFor="mode-fixed" className="text-sm">Monto Fijo (S/)</Label></div>
            <Input id="commission" type="number" min="0" placeholder={commissionMode === 'percent' ? "Ej: 15" : "Ej: 5.50"} value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} />
            {calculatedEquivalent && <p className="text-xs text-muted-foreground pt-1">{calculatedEquivalent}</p>}
          </div>
          {totalAmount > 0 && (
            <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
              {/* ===== CAMBIO CLAVE: Moneda en el diálogo ===== */}
              <div className="flex justify-between font-medium"><span>Total Venta:</span><span>S/{totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-green-400 font-semibold"><span>Comisión a ganar:</span><span>S/{finalCommissionAmount.toFixed(2)}</span></div>
            </div>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={handleSubmit}>Confirmar Venta</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// --- END OF FILE src/components/SellProductDialog.tsx ---