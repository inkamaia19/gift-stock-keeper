// --- START OF FILE src/hooks/useInventory.ts ---

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Product, ProductWithCalculated, Sale } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

// --- Funciones de Acceso a Datos (separadas del hook) ---

const fetchProducts = async (): Promise<Product[]> => {
  return db.products.orderBy("name").toArray();
};

const addProductDB = async (newProductData: { name: string; initialStock: number; imageUrl?: string }): Promise<Product> => {
  const { name, initialStock, imageUrl } = newProductData;
  if (!name.trim()) throw new Error("Product name is required");
  if (initialStock < 0 || !Number.isInteger(initialStock)) throw new Error("Initial stock must be a positive integer");

  const newProduct: Product = {
    id: crypto.randomUUID(),
    name: name.trim(),
    initialStock,
    sold: 0,
    imageUrl,
  };
  await db.products.add(newProduct);
  return newProduct;
};

const sellProductDB = async (saleData: { id: string; quantity: number; pricePerUnit: number }) => {
  const { id, quantity, pricePerUnit } = saleData;

  return db.transaction('rw', db.products, db.sales, async () => {
    const product = await db.products.get(id);
    if (!product) throw new Error("Producto no encontrado");

    const currentStock = product.initialStock - product.sold;
    if (quantity <= 0 || !Number.isInteger(quantity)) throw new Error("La cantidad debe ser un número entero positivo");
    if (pricePerUnit <= 0) throw new Error("El precio debe ser mayor a 0");
    if (quantity > currentStock) throw new Error(`Solo hay ${currentStock} unidades disponibles`);

    // 1. Actualizar el producto
    await db.products.update(id, { sold: product.sold + quantity });

    // 2. Crear el registro de venta
    const newSale: Sale = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity,
      pricePerUnit,
      totalAmount: quantity * pricePerUnit,
      date: new Date().toISOString(),
    };
    await db.sales.add(newSale);
    
    return { product, quantity, pricePerUnit };
  });
};

const clearAllProductsDB = async () => {
  await db.products.clear();
};

// --- Hook de React ---

export const useInventory = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const addProductMutation = useMutation({
    mutationFn: addProductDB,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Éxito", description: `Agregado ${data.name} al inventario` });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sellProductMutation = useMutation({
    mutationFn: sellProductDB,
    onSuccess: (data) => {
      // Invalidar ambas queries porque una venta afecta a productos y a ventas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Éxito",
        description: `Vendidas ${data.quantity} unidades de ${data.product.name} por $${(data.quantity * data.pricePerUnit).toFixed(2)}`,
      });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const clearAllMutation = useMutation({
      mutationFn: clearAllProductsDB,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          toast({ title: "Éxito", description: "Inventario de productos limpiado." });
      }
  });


  const productsWithCalculated = useMemo((): ProductWithCalculated[] => {
    return products.map((product) => ({
      ...product,
      currentStock: product.initialStock - product.sold,
      status: product.initialStock - product.sold > 0 ? "Available" : "Out of Stock",
    }));
  }, [products]);

  const totalProducts = useMemo(() => products.length, [products]);
  const totalStock = useMemo(() => products.reduce((sum, p) => sum + (p.initialStock - p.sold), 0), [products]);
  const totalSold = useMemo(() => products.reduce((sum, p) => sum + p.sold, 0), [products]);

  return {
    products: productsWithCalculated,
    isLoading: isLoadingProducts,
    addProduct: addProductMutation.mutate,
    sellProduct: sellProductMutation.mutate,
    clearAll: clearAllMutation.mutate,
    getTotalProducts: () => totalProducts,
    getTotalStock: () => totalStock,
    getTotalSold: () => totalSold,
  };
};
// --- END OF FILE src/hooks/useInventory.ts ---