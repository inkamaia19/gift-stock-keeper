// --- START OF FILE src/components/EditProductDialog.tsx ---

import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/inventory";

interface EditProductDialogProps {
  product: Product;
  onUpdate: (id: string, name: string, initialStock: number, imageUrl?: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProductDialog = ({ product, onUpdate, open, onOpenChange }: EditProductDialogProps) => {
  const [name, setName] = useState(product.name);
  const [initialStock, setInitialStock] = useState(String(product.initialStock));
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar el estado si el producto cambia
  useEffect(() => {
    if (product) {
      setName(product.name);
      setInitialStock(String(product.initialStock));
      setImageUrl(product.imageUrl || "");
    }
  }, [product]);


  const handleSubmit = () => {
    const stock = parseInt(initialStock, 10);
    onUpdate(product.id, name, stock, imageUrl);
    onOpenChange(false);
  };

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setImageUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFileChange(file); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifica los detalles de "{product.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial</Label>
                <Input id="stock" type="number" min="0" value={initialStock} onChange={(e) => setInitialStock(e.target.value)} />
            </div>
            <div className="space-y-2">
            <Label>Foto del Producto</Label>
            <div
              onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${ isDragging ? "border-primary bg-muted" : "border-border hover:border-primary/50" }`}
            >
              {imageUrl ? (
                <div className="relative"><img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => setImageUrl("")}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra una imagen o{" "}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary hover:underline">selecciona un archivo</button>
                  </p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileChange(file); }} />
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
// --- END OF FILE src/components/EditProductDialog.tsx ---