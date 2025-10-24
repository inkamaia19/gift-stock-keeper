// --- START OF FILE src/components/ItemDetailDialog.tsx ---

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItemWithCalculated, ProductWithCalculated } from "@/types/inventory";
import { Package, Wrench } from "lucide-react";

interface ItemDetailDialogProps {
  item: ItemWithCalculated;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSell: () => void;
  onEdit: () => void;
}

export const ItemDetailDialog = ({ item, open, onOpenChange, onSell, onEdit }: ItemDetailDialogProps) => {
  const isProduct = item.type === 'product';
  const productData = isProduct ? (item as ProductWithCalculated) : null;
  const canSell = isProduct ? productData.currentStock > 0 : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="flex flex-col items-center">
            <AspectRatio ratio={1/1} className="w-full max-w-sm bg-muted rounded-lg overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {isProduct ? <Package className="h-24 w-24 text-muted-foreground" /> : <Wrench className="h-24 w-24 text-muted-foreground" />}
                </div>
              )}
            </AspectRatio>
          </div>
          <div className="flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold mb-2">{item.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant={isProduct ? (productData.status === 'Available' ? 'default' : 'secondary') : 'outline'}>
                  {isProduct ? (productData.status === 'Available' ? 'Disponible' : 'Agotado') : 'Servicio'}
                </Badge>
              </div>
              {isProduct && (
                <>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Stock inicial</span><span className="font-medium">{productData.initialStock}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Unidades vendidas</span><span className="font-medium">{productData.sold}</span></div>
                  <div className="flex justify-between items-center border-t pt-4 mt-4"><span className="text-muted-foreground font-bold">Stock actual</span><span className="font-bold text-lg">{productData.currentStock}</span></div>
                </>
              )}
            </div>
            <DialogFooter className="mt-auto pt-6 gap-2">
              <Button onClick={() => { onEdit(); onOpenChange(false); }} variant="outline">Editar ítem</Button>
              {canSell && <Button onClick={() => { onSell(); onOpenChange(false); }}>Vender</Button>}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
// --- END OF FILE src/components/ItemDetailDialog.tsx ---
