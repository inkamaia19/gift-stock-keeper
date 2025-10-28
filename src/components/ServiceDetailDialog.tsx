import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ItemWithCalculated } from "@/types/inventory"
import { Wrench, Trash2 } from "lucide-react"
import { useSales } from "@/hooks/useSales"
import { DeleteItemDialog } from "./DeleteItemDialog"

interface ServiceDetailDialogProps {
  item: ItemWithCalculated
  open: boolean
  onOpenChange: (open: boolean) => void
  onSell: () => void
  onEdit: () => void
  onDelete?: () => void
}

export const ServiceDetailDialog = ({ item, open, onOpenChange, onSell, onEdit, onDelete }: ServiceDetailDialogProps) => {
  const { sales } = useSales()
  const itemSales = sales
    .filter((s) => s.itemId === item.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
  const hasSales = itemSales.length > 0
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[620px] sm:max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 p-0 sm:p-2">
          {/* Izquierda: bloque compacto */}
          <div className="md:col-span-6">
            <div className="w-full h-48 sm:h-56 md:h-72 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <Wrench className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Derecha: contenido */}
          <div className="md:col-span-6 flex flex-col min-h-[18rem]">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-semibold tracking-tight">{item.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant="outline">Servicio</Badge>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-muted-foreground mb-2">Últimas ventas</p>
                {hasSales ? (
                  <ul className="text-xs space-y-1">
                    {itemSales.map((s) => (
                      <li key={s.id} className="grid grid-cols-2">
                        <span>{new Date(s.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} · x{s.quantity}</span>
                        <span className="text-muted-foreground text-right">S/{s.totalAmount.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">Sin ventas registradas para este ítem.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Footer a nivel de todo el dialog para evitar solapes entre columnas */}
        <DialogFooter className="pt-2 gap-2 justify-end">
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
              {hasSales && (
                <span className="text-xs text-muted-foreground">No se puede eliminar con ventas.</span>
              )}
            </>
          )}
          <Button onClick={() => { onEdit(); onOpenChange(false) }} variant="outline" size="sm">Editar ítem</Button>
          <Button onClick={() => { onSell(); onOpenChange(false) }} size="sm">Vender</Button>
        </DialogFooter>
      </DialogContent>

      {onDelete && (
        <DeleteItemDialog
          itemName={item.name}
          onDelete={() => { onDelete(); setConfirmOpen(false); onOpenChange(false) }}
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
        />
      )}
    </Dialog>
  )
}
