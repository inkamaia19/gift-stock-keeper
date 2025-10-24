// --- START OF FILE src/components/BundleSaleDialog.tsx ---

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";
import { Item } from "@/types/inventory";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { NumberStepper } from "@/components/ui/number-stepper";

interface CartItem {
  item: Item;
  quantity: number;
}

interface BundleSaleDialogProps {
  allItems: Item[];
  onConfirm: (bundle: { cartItems: CartItem[]; finalPrice: number; commissionAmount: number; date: string; }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BundleSaleDialog = ({ allItems, onConfirm, open, onOpenChange }: BundleSaleDialogProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [finalPrice, setFinalPrice] = useState("");
  const [commissionMode, setCommissionMode] = useState<'percent' | 'fixed'>('percent');
  const [commissionValue, setCommissionValue] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [comboOpen, setComboOpen] = useState(false);
  const [comboValue, setComboValue] = useState("");

  const availableItems = useMemo(() => allItems.filter(item => !cartItems.some(cartItem => cartItem.item.id === item.id)), [allItems, cartItems]);

  const handleAddItem = (itemId: string) => {
    const itemToAdd = allItems.find(item => item.id === itemId);
    if (itemToAdd) {
      setCartItems([...cartItems, { item: itemToAdd, quantity: 1 }]);
    }
    setComboValue("");
    setComboOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(cartItems.filter(cartItem => cartItem.item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setCartItems(cartItems.map(cartItem => cartItem.item.id === itemId ? { ...cartItem, quantity: Math.max(1, newQuantity) } : cartItem));
  };
  
  const { finalCommissionAmount } = useMemo(() => {
    const price = parseFloat(finalPrice) || 0;
    const value = parseFloat(commissionValue) || 0;
    if (price === 0 || value === 0) return { finalCommissionAmount: 0 };
    if (commissionMode === 'percent') { return { finalCommissionAmount: price * (value / 100) }; } 
    else { return { finalCommissionAmount: value }; }
  }, [finalPrice, commissionValue, commissionMode]);

  const handleSubmit = () => {
    const schema = z.object({
      cartItems: z.array(z.object({ quantity: z.number().int().positive(), id: z.string().min(1) })).min(1, "Agrega al menos un ítem"),
      finalPrice: z.number().positive("El precio total debe ser mayor a 0"),
      commission: z.number().min(0, "La comisión no puede ser negativa"),
      date: z.date(),
    });
    const parsed = schema.safeParse({
      cartItems: cartItems.map(ci => ({ quantity: ci.quantity, id: ci.item.id })),
      finalPrice: parseFloat(finalPrice || '0'),
      commission: finalCommissionAmount,
      date: date!,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast({ title: "Datos inválidos", description: first.message, variant: "destructive" });
      return;
    }
    if (!date) {
      toast({ title: "Fecha requerida", description: "Selecciona una fecha válida", variant: "destructive" });
      return;
    }
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes);
    
    onConfirm({
      cartItems,
      finalPrice: parseFloat(finalPrice),
      commissionAmount: finalCommissionAmount,
      date: combinedDate.toISOString(),
    });
    setCartItems([]); setFinalPrice(""); setCommissionValue(""); setDate(new Date()); setTime(format(new Date(), "HH:mm")); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Record Bundle Sale</DialogTitle><DialogDescription>Register a sale of multiple items for a final offer price.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          
          <div className="space-y-2">
            <Label>Items in Sale</Label>
            <Popover open={comboOpen} onOpenChange={setComboOpen}><PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={comboOpen} className="w-full justify-between"><span className="truncate">{comboValue ? allItems.find(i => i.id === comboValue)?.name : "Search and add an item..."}</span><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
            </PopoverTrigger><PopoverContent className="w-[450px] p-0"><Command>
              <CommandInput placeholder="Search item..." />
              <CommandList><CommandEmpty>No item found.</CommandEmpty><CommandGroup>
                {availableItems.map((item) => (<CommandItem key={item.id} value={item.id} onSelect={(currentValue) => { setComboValue(currentValue === comboValue ? "" : currentValue); handleAddItem(currentValue); }}>
                  <Check className={cn("mr-2 h-4 w-4", comboValue === item.id ? "opacity-100" : "opacity-0")} />{item.name}
                </CommandItem>))}
              </CommandGroup></CommandList>
            </Command></PopoverContent></Popover>
            <div className="space-y-2 mt-2">
              {cartItems.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.type === 'product' && (
                    <NumberStepper
                      value={quantity}
                      onChange={(n) => handleQuantityChange(item.id, n)}
                      min={1}
                      size="sm"
                    />
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(item.id)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              {cartItems.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">Add items to the bundle</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="final-price">Final Offer Price (S/)</Label>
            <Input id="final-price" type="number" placeholder="e.g., 65.00" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} />
          </div>

          <div className="space-y-2"><Label>Commission Earned</Label>
            <div className="flex items-center space-x-2"><Label className="text-sm">Percentage (%)</Label><Switch checked={commissionMode === 'fixed'} onCheckedChange={(c) => setCommissionMode(c ? 'fixed' : 'percent')} /><Label className="text-sm">Fixed Amount (S/)</Label></div>
            <Input id="commission" type="number" min="0" placeholder={commissionMode === 'percent' ? "e.g., 15" : "e.g., 10.00"} value={commissionValue} onChange={(e) => setCommissionValue(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Date of Transaction</Label>
            <div className="flex items-center gap-2">
              <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP", { locale: es }) : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es} /></PopoverContent></Popover>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={cartItems.length === 0 || !finalPrice}>Confirm Sale</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
