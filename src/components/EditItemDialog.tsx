// --- START OF FILE src/components/EditItemDialog.tsx ---

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Item } from "@/types/inventory";
import { Upload, X } from "lucide-react"; // Importamos iconos
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { NumberStepper } from "@/components/ui/number-stepper";

interface EditItemDialogProps { item: Item; onUpdate: (item: Item) => void; open: boolean; onOpenChange: (open: boolean) => void; }

export const EditItemDialog = ({ item, onUpdate, open, onOpenChange }: EditItemDialogProps) => {
  const [name, setName] = useState(item.name);
  const [initialStock, setInitialStock] = useState(item.type === 'product' ? String(item.initialStock) : "");
  
  // ===== LÓGICA DE IMAGEN AÑADIDA =====
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => { if (file && file.type.startsWith("image/")) { const reader = new FileReader(); reader.onload = (e) => setImageUrl(e.target?.result as string); reader.readAsDataURL(file); } };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFileChange(file); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  // ===================================

  useEffect(() => {
    setName(item.name);
    setImageUrl(item.imageUrl || "");
    if (item.type === 'product') { setInitialStock(String(item.initialStock)); }
  }, [item]);

  const handleSubmit = () => {
    const base = { name: name.trim() };
    const schema = z.object({ name: z.string().min(1, "El nombre es obligatorio") });
    if (item.type === 'product') {
      const parsed = schema.extend({ initialStock: z.number().int().min(0, "Stock debe ser ≥ 0") }).safeParse({ name: base.name, initialStock: parseInt(initialStock || '0', 10) });
      if (!parsed.success) { toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" }); return; }
      const updatedItem: Item = { ...item, name: base.name, imageUrl: imageUrl || undefined, initialStock: parsed.data.initialStock } as Item;
      onUpdate(updatedItem);
    } else {
      const parsed = schema.safeParse({ name: base.name });
      if (!parsed.success) { toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" }); return; }
      const updatedItem: Item = { ...item, name: base.name, imageUrl: imageUrl || undefined } as Item;
      onUpdate(updatedItem);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Item</DialogTitle><DialogDescription>Modify the details for "{item.name}".</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label htmlFor="name">Item Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          {item.type === 'product' && (
            <>
              <div className="space-y-3">
                <Label htmlFor="stock">Initial Stock</Label>
                <NumberStepper
                  value={parseInt(initialStock || '0', 10) || 0}
                  onChange={(n) => setInitialStock(String(Math.max(0, n)))}
                  min={0}
                />
              </div>
              {/* ===== CAMPO DE IMAGEN AÑADIDO ===== */}
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
        </div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={handleSubmit}>Save Changes</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// --- END OF FILE src/components/EditItemDialog.tsx ---
