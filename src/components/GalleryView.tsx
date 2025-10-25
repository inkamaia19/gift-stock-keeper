// --- START OF FILE src/components/GalleryView.tsx ---

import { useState } from "react";
import { Item, ItemWithCalculated } from "@/types/inventory";
import { ItemCard } from "./ItemCard";
import { ItemDetailDialog } from "./ItemDetailDialog";

interface GalleryViewProps {
  items: ItemWithCalculated[];
  onSellClick: (item: ItemWithCalculated) => void;
  onEditClick: (item: Item) => void;
  onDeleteClick?: (id: string) => void;
}

export const GalleryView = ({ items, onSellClick, onEditClick, onDeleteClick }: GalleryViewProps) => {
  const [detailItem, setDetailItem] = useState<ItemWithCalculated | null>(null);

  if (items.length === 0) {
    return <div className="text-center py-12 text-muted-foreground"><p className="text-base">No hay ítems que coincidan con los filtros.</p></div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onImageClick={() => setDetailItem(item)}
            onSellClick={() => onSellClick(item)}
          />
        ))}
      </div>
      {detailItem && (
        <ItemDetailDialog
          item={detailItem}
          open={!!detailItem}
          onOpenChange={(open) => !open && setDetailItem(null)}
          onSell={() => onSellClick(detailItem)}
          onEdit={() => onEditClick(detailItem)}
          onDelete={onDeleteClick ? () => onDeleteClick(detailItem.id) : undefined}
        />
      )}
    </>
  );
};
// --- END OF FILE src/components/GalleryView.tsx ---
