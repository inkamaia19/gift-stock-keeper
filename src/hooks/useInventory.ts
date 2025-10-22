// --- START OF FILE src/hooks/useInventory.ts ---

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Product, ProductWithCalculated, Sale } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

// ... (las funciones fetchProducts, addProductDB, updateProductDB, deleteProductDB no cambian) ...
const fetchProducts = async (): Promise<Product[]> => db.products.orderBy("name").toArray();
const addProductDB = async (data: { name: string; initialStock: number; imageUrl?: string }) => { const { name, initialStock, imageUrl } = data; if (!name.trim()) throw new Error("Product name is required"); if (initialStock < 0 || !Number.isInteger(initialStock)) throw new Error("Initial stock must be a positive integer"); const newProduct: Product = { id: crypto.randomUUID(), name: name.trim(), initialStock, sold: 0, imageUrl }; await db.products.add(newProduct); return newProduct; };
const updateProductDB = async (data: { id: string; name: string; initialStock: number; imageUrl?: string }) => { const { id, name, initialStock, imageUrl } = data; if (!name.trim()) throw new Error("Product name is required"); if (initialStock < 0 || !Number.isInteger(initialStock)) throw new Error("Initial stock must be a positive integer"); const product = await db.products.get(id); if (!product) throw new Error("Producto no encontrado"); if (initialStock < product.sold) throw new Error(`El stock inicial no puede ser menor a las ${product.sold} unidades ya vendidas.`); await db.products.update(id, { name: name.trim(), initialStock, imageUrl }); return { ...product, name, initialStock, imageUrl }; };
const deleteProductDB = async (id: string) => { const product = await db.products.get(id); if (!product) throw new Error("Producto no encontrado"); if (product.sold > 0) throw new Error("No se puede eliminar un producto con ventas registradas."); await db.products.delete(id); return id; };

const sellProductDB = async (data: { id: string; quantity: number; pricePerUnit: number; commissionAmount: number }) => {
  const { id, quantity, pricePerUnit, commissionAmount } = data;
  return db.transaction('rw', db.products, db.sales, async () => {
    const product = await db.products.get(id);
    if (!product) throw new Error("Producto no encontrado");
    const currentStock = product.initialStock - product.sold;
    if (quantity <= 0 || !Number.isInteger(quantity)) throw new Error("La cantidad debe ser un número entero positivo");
    if (pricePerUnit <= 0) throw new Error("El precio debe ser mayor a 0");
    if (commissionAmount < 0) throw new Error("La comisión no puede ser negativa");
    if (quantity > currentStock) throw new Error(`Solo hay ${currentStock} unidades disponibles`);
    await db.products.update(id, { sold: product.sold + quantity });
    const totalAmount = quantity * pricePerUnit;
    const newSale: Sale = { id: crypto.randomUUID(), productId: product.id, productName: product.name, quantity, pricePerUnit, totalAmount, commissionAmount, date: new Date().toISOString() };
    await db.sales.add(newSale);
    return { product, quantity, commissionAmount };
  });
};
const clearAllProductsDB = async () => db.products.clear();
export const useInventory = () => {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const addProductMutation = useMutation({ mutationFn: addProductDB, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast({ title: "Éxito", description: `Agregado ${data.name}` }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }) } });
  const updateProductMutation = useMutation({ mutationFn: updateProductDB, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast({ title: "Éxito", description: `"${data.name}" actualizado.` }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }) } });
  const deleteProductMutation = useMutation({ mutationFn: deleteProductDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast({ title: "Éxito", description: "Producto eliminado." }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }) } });
  const sellProductMutation = useMutation({
    mutationFn: sellProductDB,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      // ===== CAMBIO CLAVE: Moneda en el toast =====
      toast({ title: "Éxito", description: `Venta de ${data.product.name} registrada. Comisión: S/${data.commissionAmount.toFixed(2)}` });
    },
    onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }) },
  });
  const clearAllMutation = useMutation({ mutationFn: clearAllProductsDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast({ title: "Éxito", description: "Inventario limpiado." }); } });
  const productsWithCalculated = useMemo((): ProductWithCalculated[] => products.map((p) => ({ ...p, currentStock: p.initialStock - p.sold, status: p.initialStock - p.sold > 0 ? "Available" : "Out of Stock" })), [products]);
  const totalProducts = useMemo(() => products.length, [products]);
  const totalStock = useMemo(() => products.reduce((sum, p) => sum + (p.initialStock - p.sold), 0), [products]);
  const totalSold = useMemo(() => products.reduce((sum, p) => sum + p.sold, 0), [products]);
  return { products: productsWithCalculated, rawProducts: products, isLoading: isLoadingProducts, addProduct: addProductMutation.mutate, updateProduct: updateProductMutation.mutate, deleteProduct: deleteProductMutation.mutate, sellProduct: sellProductMutation.mutate, clearAll: clearAllMutation.mutate, getTotalProducts: () => totalProducts, getTotalStock: () => totalStock, getTotalSold: () => totalSold };
};
// --- END OF FILE src/hooks/useInventory.ts ---