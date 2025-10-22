// --- START OF FILE src/hooks/useItems.ts ---

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Item, ProductItem, Sale, ItemWithCalculated } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

const fetchItems = async (): Promise<Item[]> => db.items.orderBy("name").toArray();
const addItemDB = async (item: Item) => { if (!item.name.trim()) throw new Error("Item name is required"); await db.items.add(item); return item; };
const updateItemDB = async (item: Item) => { if (!item.name.trim()) throw new Error("Item name is required"); await db.items.put(item); return item; };
const deleteItemDB = async (id: string) => { const salesCount = await db.sales.where({ itemId: id }).count(); if (salesCount > 0) { throw new Error("Cannot delete an item with recorded transactions."); } await db.items.delete(id); return id; };

const recordTransactionDB = async (data: { itemId: string; quantity: number; pricePerUnit: number; commissionAmount: number }) => {
  const { itemId, quantity, pricePerUnit, commissionAmount } = data;
  return db.transaction('rw', db.items, db.sales, async () => {
    const item = await db.items.get(itemId);
    if (!item) throw new Error("Item not found");
    if (item.type === 'product') {
      const currentStock = item.initialStock - item.sold;
      if (quantity > currentStock) throw new Error(`Only ${currentStock} units available`);
      item.sold += quantity;
      await db.items.put(item);
    }
    const totalAmount = quantity * pricePerUnit;
    const newSale: Sale = { id: crypto.randomUUID(), itemId, itemName: item.name, quantity, pricePerUnit, totalAmount, commissionAmount, date: new Date().toISOString() };
    await db.sales.add(newSale);
    return { item, quantity, commissionAmount };
  });
};

const recordBundleTransactionDB = async (bundle: { cartItems: { item: Item; quantity: number; }[]; finalPrice: number; commissionAmount: number; date: string; }) => {
  const { cartItems, finalPrice, commissionAmount, date } = bundle;
  const bundleId = crypto.randomUUID();
  const totalQuantity = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  return db.transaction('rw', db.items, db.sales, async () => {
    for (const cartItem of cartItems) {
      const { item, quantity } = cartItem;
      // Distribute price and commission based on quantity (simple distribution)
      const proportion = quantity / totalQuantity;
      const proportionalPrice = finalPrice * proportion;
      const proportionalCommission = commissionAmount * proportion;
      const pricePerUnit = quantity > 0 ? proportionalPrice / quantity : 0;
      
      const newSale: Sale = { id: crypto.randomUUID(), itemId: item.id, itemName: item.name, quantity, pricePerUnit, totalAmount: proportionalPrice, commissionAmount: proportionalCommission, date, bundleId };
      await db.sales.add(newSale);

      if (item.type === 'product') {
        const product = await db.items.get(item.id) as ProductItem | undefined;
        if (product) {
          product.sold += quantity;
          await db.items.put(product);
        }
      }
    }
  });
};

const clearAllItemsDB = async () => db.items.clear();

export const useItems = () => {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ['items'], queryFn: fetchItems });
  
  const addItemMutation = useMutation({ mutationFn: addItemDB, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['items'] }); toast({ title: "Success", description: `Added "${data.name}" to catalog.` }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); } });
  const updateItemMutation = useMutation({ mutationFn: updateItemDB, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['items'] }); toast({ title: "Success", description: `"${data.name}" has been updated.` }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); } });
  const deleteItemMutation = useMutation({ mutationFn: deleteItemDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); toast({ title: "Success", description: "Item has been deleted." }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); } });
  
  const recordTransactionMutation = useMutation({ mutationFn: recordTransactionDB, onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['items'] }); queryClient.invalidateQueries({ queryKey: ['sales'] }); toast({ title: "Success", description: `Transaction for "${data.item.name}" recorded. Commission: S/${data.commissionAmount.toFixed(2)}` }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }) } });
  
  const recordBundleTransactionMutation = useMutation({
    mutationFn: recordBundleTransactionDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({ title: "Success", description: "Bundle sale has been recorded." });
    },
    onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); },
  });
  
  const clearAllMutation = useMutation({ mutationFn: clearAllItemsDB, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); toast({ title: "Success", description: "Catalog has been cleared." }); }, onError: (error) => { toast({ title: "Error", description: error.message, variant: "destructive" }); } });
  
  const itemsWithCalculated = useMemo((): ItemWithCalculated[] => items.map(item => {
    if (item.type === 'product') { const p = item as ProductItem; return { ...p, currentStock: p.initialStock - p.sold, status: p.initialStock - p.sold > 0 ? "Available" : "Out of Stock" }; }
    return item;
  }), [items]);
  
  const totalStock = useMemo(() => items.filter((i): i is ProductItem => i.type === 'product').reduce((sum, p) => sum + (p.initialStock - p.sold), 0), [items]);
  const totalSold = useMemo(() => items.filter((i): i is ProductItem => i.type === 'product').reduce((sum, p) => sum + p.sold, 0), [items]);

  return { 
    allItems: items, 
    itemsWithCalculated, 
    isLoading, 
    addItem: addItemMutation.mutate, 
    updateItem: updateItemMutation.mutate, 
    deleteItem: deleteItemMutation.mutate, 
    recordTransaction: recordTransactionMutation.mutate, 
    recordBundleTransaction: recordBundleTransactionMutation.mutate,
    clearAll: clearAllMutation.mutate, 
    getTotalItems: () => items.length, 
    getTotalStock: () => totalStock, 
    getTotalSold: () => totalSold 
  };
};
// --- END OF FILE src/hooks/useItems.ts ---