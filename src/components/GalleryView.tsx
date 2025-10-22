// --- START OF FILE src/components/GalleryView.tsx ---

import { useState } from "react";
import { Item, ItemWithCalculated } from "@/types/inventory";
import { ItemCard } from "./ItemCard";
import { ItemDetailDialog } from "./ItemDetailDialog";

interface GalleryViewProps {
  items: ItemWithCalculated[];
  onSellClick: (item: ItemWithCalculated) => void;
  onEditClick: (item: Item) => void;
}

export const GalleryView = ({ items, onSellClick, onEditClick }: GalleryViewProps) => {
  const [detailItem, setDetailItem] = useState<ItemWithCalculated | null>(null);

  if (items.length === 0) {
    return <div className="text-center py-16 text-muted-foreground"><p className="text-lg">No items match the current filters.</p></div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
        />
      )}
    </>
  );
};
// --- END OF FILE src/components/GalleryView.tsx ---