// --- START OF FILE src/components/SellItemDialog.tsx ---

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ItemWithCalculated, ProductWithCalculated } from "@/types/inventory";

interface SellItemDialogProps { item: ItemWithCalculated; onSell: (itemId: string, quantity: number, pricePerUnit: number, commissionAmount: number) => void; open: boolean; onOpenChange: (open: boolean) => void; }

export const SellItemDialog = ({ item, onSell, open, onOpenChange }: SellItemDialogProps) => {
  const isProduct = item.type === 'product';
  const productData = isProduct ? (item as ProductWithCalculated) : null;
  const [quantity, setQuantity] = useState(isProduct ? "" : "1");
  const [price, setPrice] = useState("");
  const [commissionMode, setCommissionMode] = useState<'percent' | 'fixed'>('percent');
  const [commissionValue, setCommissionValue] = useState("");
  const totalAmount = useMemo(() => (parseFloat(quantity) || 0) * (parseFloat(price) || 0), [quantity, price]);
  const { finalCommissionAmount, calculatedEquivalent } = useMemo(() => { const v = parseFloat(commissionValue) || 0; if (totalAmount === 0 || v === 0) return { finalCommissionAmount: 0, calculatedEquivalent: "" }; if (commissionMode === 'percent') { const a = totalAmount * (v / 100); return { finalCommissionAmount: a, calculatedEquivalent: `Equals: S/${a.toFixed(2)}` }; } else { const p = (v / totalAmount) * 100; return { finalCommissionAmount: v, calculatedEquivalent: `Equals: ${p.toFixed(2)}%` }; } }, [commissionValue, commissionMode, totalAmount]);
  const handleSubmit = () => { onSell(item.id, parseInt(quantity, 10), parseFloat(price), finalCommissionAmount); onOpenChange(false); };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Record Transaction</DialogTitle><DialogDescription>Fill in the details for "{item.name}".</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" min="1" max={productData?.currentStock} placeholder={isProduct ? `Max: ${productData?.currentStock}` : "Units"} value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={!isProduct} /></div>
            <div className="space-y-2"><Label htmlFor="price">Price / Unit (S/)</Label><Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Commission Earned</Label>
            <div className="flex items-center space-x-2"><Label className="text-sm">Percentage (%)</Label><Switch checked={commissionMode === 'fixed'} onCheckedChange={(c) => setCommissionMode(c ? 'fixed' : 'percent')} /><Label className="text-sm">Fixed Amount (S/)</Label></div>
            <Input id="commission" type="number" min="0" placeholder={commissionMode === 'percent' ? "e.g., 15" : "e.g., 5.50"} value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} />
            {calculatedEquivalent && <p className="text-xs text-muted-foreground pt-1">{calculatedEquivalent}</p>}
          </div>
          {totalAmount > 0 && (<div className="bg-muted rounded-lg p-3 space-y-1 text-sm"><div className="flex justify-between font-medium"><span>Total Transaction:</span><span>S/{totalAmount.toFixed(2)}</span></div><div className="flex justify-between text-green-400 font-semibold"><span>Commission to earn:</span><span>S/{finalCommissionAmount.toFixed(2)}</span></div></div>)}
        </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSubmit}>Confirm</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// --- END OF FILE src/components/SellItemDialog.tsx ---