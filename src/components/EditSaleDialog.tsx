// --- START OF FILE src/components/EditSaleDialog.tsx ---

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Sale } from "@/types/inventory";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";

interface EditSaleDialogProps { sale: Sale; onUpdate: (id: string, updates: Partial<Sale>) => void; open: boolean; onOpenChange: (open: boolean) => void; }

export const EditSaleDialog = ({ sale, onUpdate, open, onOpenChange }: EditSaleDialogProps) => {
  const [quantity, setQuantity] = useState(String(sale.quantity));
  const [price, setPrice] = useState(String(sale.pricePerUnit));
  const initialCommissionPercent = sale.totalAmount > 0 ? (sale.commissionAmount / sale.totalAmount) * 100 : 0;
  const [commissionMode, setCommissionMode] = useState<'percent' | 'fixed'>('percent');
  const [commissionValue, setCommissionValue] = useState(String(initialCommissionPercent.toFixed(2)));
  const saleDateObject = new Date(sale.date);
  const [date, setDate] = useState<Date | undefined>(saleDateObject);
  const [time, setTime] = useState(format(saleDateObject, "HH:mm"));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
  const handleSubmit = () => { if (!date) return; const [hours, minutes] = time.split(':').map(Number); const combinedDate = new Date(date); combinedDate.setHours(hours, minutes); const updates: Partial<Sale> = { quantity: parseInt(quantity, 10), pricePerUnit: parseFloat(price), totalAmount, commissionAmount: finalCommissionAmount, date: combinedDate.toISOString() }; onUpdate(sale.id, updates); onOpenChange(false); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar Venta</DialogTitle><DialogDescription>Modifica los detalles de la venta de "{sale.itemName}".</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="quantity">Cantidad</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            {/* ===== CAMBIO CLAVE: Moneda en el diálogo ===== */}
            <div className="space-y-2"><Label htmlFor="price">Precio / Unidad</Label><Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Comisión Ganada</Label>
            {/* ===== CAMBIO CLAVE: Moneda en el diálogo ===== */}
            <div className="flex items-center space-x-2"><Label htmlFor="mode-percent" className="text-sm">Porcentaje (%)</Label><Switch id="commission-mode-switch" checked={commissionMode === 'fixed'} onCheckedChange={(c) => setCommissionMode(c ? 'fixed' : 'percent')} /><Label htmlFor="mode-fixed" className="text-sm">Monto Fijo (S/)</Label></div>
            <Input id="commission" type="number" min="0" placeholder={commissionMode === 'percent' ? "Ej: 15" : "Ej: 5.50"} value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} />
            {calculatedEquivalent && <p className="text-xs text-muted-foreground pt-1">{calculatedEquivalent}</p>}
          </div>
          <div className="space-y-2"><Label>Fecha y Hora de la Venta</Label>
            <div className="flex items-center gap-2">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setIsCalendarOpen(false); }} initialFocus locale={es} /></PopoverContent></Popover>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={handleSubmit}>Guardar Cambios</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// --- END OF FILE src/components/EditSaleDialog.tsx ---
