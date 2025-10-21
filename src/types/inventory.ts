export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  date: string;
}

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
