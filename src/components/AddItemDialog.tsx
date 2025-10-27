// --- START OF FILE src/components/AddItemDialog.tsx ---

import { useState, useRef } from "react";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Item } from "@/types/inventory";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { NumberStepper } from "@/components/ui/number-stepper";

// Aceptamos children para el trigger personalizado
interface AddItemDialogProps { onAdd: (item: Item) => void; children?: React.ReactNode; }

export const AddItemDialog = ({ onAdd, children }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<'product' | 'service'>('product');
  const [initialStock, setInitialStock] = useState("");
  
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => { if (file && file.type.startsWith("image/")) { const reader = new FileReader(); reader.onload = (e) => setImageUrl(e.target?.result as string); reader.readAsDataURL(file); } };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFileChange(file); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = () => {
    const base = { name: name.trim() };
    const schema = z.object({ name: z.string().min(1, "El nombre es obligatorio") });
    const productSchema = schema.extend({ initialStock: z.number().int().min(0, "Stock debe ser ≥ 0") });

    if (type === 'product') {
      const parsed = productSchema.safeParse({ name: base.name, initialStock: parseInt(initialStock || '0', 10) });
      if (!parsed.success) { toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" }); return; }
      const newItem: Item = { id: crypto.randomUUID(), type: 'product', name: base.name, initialStock: parsed.data.initialStock, sold: 0, imageUrl: imageUrl || undefined };
      onAdd(newItem);
    } else {
      const parsed = schema.safeParse({ name: base.name });
      if (!parsed.success) { toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" }); return; }
      const newItem: Item = { id: crypto.randomUUID(), type: 'service', name: base.name };
      onAdd(newItem);
    }
    setName(""); setInitialStock(""); setType('product'); setImageUrl(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Usamos el children como trigger si se proporciona, sino usamos el botón por defecto */}
      <DialogTrigger asChild>
        {children || <Button className="gap-2"><Plus className="h-4 w-4" />Add Item</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold tracking-tight">Add to Catalog</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">Add a new product (with stock) or service (no stock).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Item Type</Label>
            <RadioGroup value={type} onValueChange={(v: 'product' | 'service') => setType(v)} className="flex gap-4 pt-1">
              <div className="flex items-center space-x-2"><RadioGroupItem value="product" id="r1" /><Label htmlFor="r1">Product</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="service" id="r2" /><Label htmlFor="r2">Service</Label></div>
            </RadioGroup>
          </div>
          <div className="space-y-2"><Label htmlFor="name">Item Name</Label><Input id="name" placeholder={type === 'product' ? "e.g., T-Shirt Size M" : "e.g., Sales Consulting"} value={name} onChange={(e) => setName(e.target.value)} /></div>
          {type === 'product' && (
            <>
              <div className="space-y-3">
                <Label htmlFor="stock">Initial Stock</Label>
                <NumberStepper
                  value={parseInt(initialStock || '0', 10) || 0}
                  onChange={(n) => setInitialStock(String(Math.max(0, n)))}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Item Photo</Label>
                <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${ isDragging ? "border-primary bg-muted" : "border-border hover:border-primary/50" }`}>
                  {imageUrl ? (
                    <div className="relative"><img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" /><Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => setImageUrl("")}><X className="h-4 w-4" /></Button></div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drag an image here or{" "}<button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary hover:underline">select a file</button></p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileChange(file); }} />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
