// --- START OF FILE src/types/inventory.ts ---

interface BaseItem {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ProductItem extends BaseItem {
  type: 'product';
  initialStock: number;
  sold: number;
}

export interface ServiceItem extends BaseItem {
  type: 'service';
}

export type Item = ProductItem | ServiceItem;

export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  commissionAmount: number;
  date: string;
  bundleId?: string; // ===== CAMBIO CLAVE AQUÍ =====
}

export interface ProductWithCalculated extends ProductItem {
  currentStock: number;
  status: "Available" | "Out of Stock";
}

export type ItemWithCalculated = ProductWithCalculated | ServiceItem;
// --- END OF FILE src/types/inventory.ts ---