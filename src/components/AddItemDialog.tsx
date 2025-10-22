// --- START OF FILE src/components/AddItemDialog.tsx ---

import { useState, useRef } from "react";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Item } from "@/types/inventory";

interface AddItemDialogProps { onAdd: (item: Item) => void; }

export const AddItemDialog = ({ onAdd }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<'product' | 'service'>('product');
  const [initialStock, setInitialStock] = useState("");
  
  // ===== LÓGICA DE IMAGEN AÑADIDA =====
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => { if (file && file.type.startsWith("image/")) { const reader = new FileReader(); reader.onload = (e) => setImageUrl(e.target?.result as string); reader.readAsDataURL(file); } };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFileChange(file); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  // ===================================

  const handleSubmit = () => {
    let newItem: Item;
    if (type === 'product') {
      newItem = { id: crypto.randomUUID(), type: 'product', name: name.trim(), initialStock: parseInt(initialStock, 10) || 0, sold: 0, imageUrl: imageUrl || undefined };
    } else {
      newItem = { id: crypto.randomUUID(), type: 'service', name: name.trim() };
    }
    onAdd(newItem);
    setName(""); setInitialStock(""); setType('product'); setImageUrl(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Item</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add to Catalog</DialogTitle><DialogDescription>Add a new product (with stock) or service (no stock).</DialogDescription></DialogHeader>
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
              <div className="space-y-2"><Label htmlFor="stock">Initial Stock</Label><Input id="stock" type="number" min="0" placeholder="Number of units" value={initialStock} onChange={(e) => setInitialStock(e.target.value)} /></div>
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
        </div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// --- END OF FILE src/components/AddItemDialog.tsx ---