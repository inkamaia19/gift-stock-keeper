// --- START OF FILE src/components/ItemDetailDialog.tsx ---

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItemWithCalculated, ProductWithCalculated } from "@/types/inventory";
import { Package, Wrench, Trash2 } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { Progress } from "@/components/ui/progress";
import { useActions } from "@/contexts/ActionContext";

interface ItemDetailDialogProps {
  item: ItemWithCalculated;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSell: () => void;
  onEdit: () => void;
  onDelete?: () => void; // opcional, se muestra si no tiene ventas
}

export const ItemDetailDialog = ({ item, open, onOpenChange, onSell, onEdit, onDelete }: ItemDetailDialogProps) => {
  const isProduct = item.type === 'product';
  const productData = isProduct ? (item as ProductWithCalculated) : null;
  const canSell = isProduct ? productData.currentStock > 0 : true;
  const { sales } = useSales();
  const itemSales = sales.filter(s => s.itemId === item.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,5);
  const hasSales = itemSales.length > 0;
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const { setIsBundleSaleOpen } = useActions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalle del ítem</DialogTitle>
        </DialogHeader>
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
                <Badge variant={isProduct ? (productData.status === 'Available' ? 'outline' : 'secondary') : 'outline'}>
                  {isProduct ? (productData.status === 'Available' ? 'Disponible' : 'Agotado') : 'Servicio'}
                </Badge>
              </div>
              {isProduct && (
                <>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Stock inicial</span><span className="font-medium">{productData.initialStock}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Unidades vendidas</span><span className="font-medium">{productData.sold}</span></div>
                  <div className="flex justify-between items-center border-t pt-4 mt-4"><span className="text-muted-foreground font-bold">Stock actual</span><span className="font-bold text-lg">{productData.currentStock}</span></div>
                  {/* Indicador de progreso de stock */}
                  <div className="mt-2 space-y-1">
                    <Progress value={Math.min(100, Math.max(0, (productData.sold / Math.max(1, productData.initialStock)) * 100))} />
                    <p className="text-[11px] text-muted-foreground">{Math.round((productData.sold / Math.max(1, productData.initialStock)) * 100)}% vendido</p>
                  </div>
                </>
              )}
              {/* Mini historial de ventas (últimas 5) */}
              <div className="border-t pt-4 mt-4">
                <p className="text-muted-foreground mb-2">Últimas ventas</p>
                {hasSales ? (
                  <ul className="text-xs space-y-1">
                    {itemSales.map(s => (
                      <li key={s.id} className="flex justify-between">
                        <span>{new Date(s.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} · x{s.quantity}</span>
                        <span className="text-muted-foreground">S/{s.totalAmount.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">Sin ventas registradas para este ítem.</p>
                )}
              </div>
            </div>
            <DialogFooter className="mt-auto pt-6 gap-2">
              {onDelete && (
                <>
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    variant="destructive"
                    size="sm"
                    disabled={hasSales}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                  {hasSales && <span className="text-xs text-muted-foreground">No se puede eliminar con ventas.</span>}
                </>
              )}
              <Button onClick={() => { onEdit(); onOpenChange(false); }} variant="outline" size="sm">Editar ítem</Button>
              {canSell && <Button onClick={() => { onSell(); onOpenChange(false); }} size="sm">Vender</Button>}
              <Button onClick={() => { setIsBundleSaleOpen(true); onOpenChange(false); }} variant="ghost" size="sm">Venta agrupada</Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
      {onDelete && (
        <DeleteItemDialog
          itemName={item.name}
          onDelete={() => { onDelete(); setConfirmOpen(false); onOpenChange(false); }}
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
        />
      )}
    </Dialog>
  );
};
// --- END OF FILE src/components/ItemDetailDialog.tsx ---
