// --- START OF FILE src/components/SellItemDialog.tsx ---

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ItemWithCalculated, ProductWithCalculated } from "@/types/inventory";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { NumberStepper } from "@/components/ui/number-stepper";

interface SellItemDialogProps { item: ItemWithCalculated; onSell: (itemId: string, quantity: number, pricePerUnit: number, commissionAmount: number) => void; open: boolean; onOpenChange: (open: boolean) => void; }

export const SellItemDialog = ({ item, onSell, open, onOpenChange }: SellItemDialogProps) => {
  const isProduct = item.type === 'product';
  const productData = isProduct ? (item as ProductWithCalculated) : null;
  const [quantity, setQuantity] = useState(isProduct ? "" : "1");
  // Modo de precio: por unidad (unit) o total (total)
  const [priceMode, setPriceMode] = useState<'unit' | 'total'>('unit');
  const [price, setPrice] = useState("");
  const [commissionMode, setCommissionMode] = useState<'percent' | 'fixed'>('percent');
  const [commissionValue, setCommissionValue] = useState("");
  const totalAmount = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(price) || 0;
    return priceMode === 'unit' ? q * p : p;
  }, [quantity, price, priceMode]);
  const { finalCommissionAmount, calculatedEquivalent } = useMemo(() => { const v = parseFloat(commissionValue) || 0; if (totalAmount === 0 || v === 0) return { finalCommissionAmount: 0, calculatedEquivalent: "" }; if (commissionMode === 'percent') { const a = totalAmount * (v / 100); return { finalCommissionAmount: a, calculatedEquivalent: `Equals: S/${a.toFixed(2)}` }; } else { const p = (v / totalAmount) * 100; return { finalCommissionAmount: v, calculatedEquivalent: `Equals: ${p.toFixed(2)}%` }; } }, [commissionValue, commissionMode, totalAmount]);
  const handleSubmit = () => {
    const q = parseInt(quantity, 10);
    const p = parseFloat(price);

    const schema = z.object({
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
      commission: z.number().min(0),
    }).superRefine((val, ctx) => {
      if (isProduct && productData) {
        if (val.quantity > productData.currentStock) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Solo ${productData.currentStock} unidades disponibles`, path: ["quantity"] });
        }
      }
      if (commissionMode === 'percent' && val.commission > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El porcentaje no puede exceder 100%", path: ["commission"] });
      }
    });

    const res = schema.safeParse({ quantity: q, price: p, commission: parseFloat(commissionValue || '0') });
    if (!res.success) {
      const first = res.error.issues[0];
      toast({ title: "Datos inválidos", description: first.message, variant: "destructive" });
      return;
    }

    const pricePerUnit = priceMode === 'unit' ? p : (q > 0 ? (p / q) : 0);
    onSell(item.id, q, pricePerUnit, finalCommissionAmount);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Registrar transacción</DialogTitle><DialogDescription>Completa los detalles para "{item.name}".</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <NumberStepper
                value={parseInt(quantity || '0') || 1}
                onChange={(n) => setQuantity(String(n))}
                min={1}
                max={isProduct ? (productData?.currentStock ?? 1) : undefined}
                disabled={!isProduct}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price">{priceMode === 'unit' ? 'Precio / Unidad (S/)' : 'Precio total (S/)'}</Label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Unidad</span>
                  <Switch checked={priceMode === 'total'} onCheckedChange={(c)=> setPriceMode(c ? 'total' : 'unit')} />
                  <span>Total</span>
                </div>
              </div>
              <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2"><Label>Comisión</Label>
            <div className="flex items-center space-x-2"><Label className="text-sm">Porcentaje (%)</Label><Switch checked={commissionMode === 'fixed'} onCheckedChange={(c) => setCommissionMode(c ? 'fixed' : 'percent')} /><Label className="text-sm">Monto fijo (S/)</Label></div>
            <Input id="commission" type="number" min="0" placeholder={commissionMode === 'percent' ? "Ej: 15" : "Ej: 5.50"} value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} />
            {calculatedEquivalent && <p className="text-xs text-muted-foreground pt-1">{calculatedEquivalent}</p>}
          </div>
          {totalAmount > 0 && (
            <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between font-medium"><span>Total:</span><span>S/{totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground font-semibold"><span>Comisión:</span><span>S/{finalCommissionAmount.toFixed(2)}</span></div>
            </div>
          )}
        </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={handleSubmit}>Confirmar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// --- END OF FILE src/components/SellItemDialog.tsx ---
