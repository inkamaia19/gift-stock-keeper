export interface Product {
  id: string;
  name: string;
  initialStock: number;
  sold: number;
  imageUrl?: string;
}

export interface ProductWithCalculated extends Product {
  currentStock: number;
  status: "Available" | "Out of Stock";
}
