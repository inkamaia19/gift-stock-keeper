// --- START OF FILE src/components/DeleteItemDialog.tsx ---

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DeleteItemDialogProps {
  itemName: string;
  onDelete: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteItemDialog = ({ itemName, onDelete, open, onOpenChange }: DeleteItemDialogProps) => {
  const handleConfirm = () => { onDelete(); onOpenChange(false); };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle><AlertDialogDescription>
            Esta acción eliminará permanentemente el ítem "{itemName}" del catálogo. Si tiene transacciones registradas, no podrá ser eliminado. Esta acción no se puede deshacer.
        </AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
// --- END OF FILE src/components/DeleteItemDialog.tsx ---