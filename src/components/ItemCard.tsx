// --- START OF FILE src/components/ItemCard.tsx ---

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItemWithCalculated, ProductWithCalculated } from "@/types/inventory";
import { Package, Wrench } from "lucide-react";

interface ItemCardProps {
  item: ItemWithCalculated;
  onImageClick: () => void;
  onSellClick: () => void;
}

export const ItemCard = ({ item, onImageClick, onSellClick }: ItemCardProps) => {
  const isProduct = item.type === 'product';
  const productData = isProduct ? (item as ProductWithCalculated) : null;
  const canSell = isProduct ? productData.currentStock > 0 : true;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-4">
        <AspectRatio ratio={1 / 1}>
          <button onClick={onImageClick} className="w-full h-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              isProduct ? <Package className="h-12 w-12 text-muted-foreground" /> : <Wrench className="h-12 w-12 text-muted-foreground" />
            )}
          </button>
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <CardTitle className="text-base font-medium truncate">{item.name}</CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          {isProduct ? (
            <>
              <span>Stock: {productData.currentStock}</span>
              <Badge variant={productData.status === 'Available' ? 'default' : 'secondary'}>{productData.status}</Badge>
            </>
          ) : (
            <Badge variant="outline">Servicio</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {canSell && (
          <Button onClick={onSellClick} variant="outline" size="sm" className="w-full">Vender</Button>
        )}
      </CardFooter>
    </Card>
  );
};
// --- END OF FILE src/components/ItemCard.tsx ---
