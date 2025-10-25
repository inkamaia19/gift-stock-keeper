// --- START OF FILE src/hooks/useItems.ts ---

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Item, ProductItem, ItemWithCalculated } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

const listItems = async (): Promise<Item[]> => {
  const res = await fetch('/api/items');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
const addItemDB = async (item: Item) => {
  if (!item.name.trim()) throw new Error("Item name is required");
  const res = await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: item.name, type: item.type, imageUrl: (item as any).imageUrl, initialStock: (item as any).initialStock })});
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
const updateItemDB = async (item: Item) => {
  if (!item.name.trim()) throw new Error("Item name is required");
  const res = await fetch(`/api/items/${(item as any).id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: item.name, imageUrl: (item as any).imageUrl, initialStock: (item as any).initialStock })});
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
const deleteItemDB = async (id: string) => { const res = await fetch(`/api/items/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(await res.text()); return id; };

const recordTransactionDB = async (data: { itemId: string; quantity: number; pricePerUnit: number; commissionAmount: number }) => {
  const res = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, date: new Date().toISOString() }) });
  if (!res.ok) throw new Error(await res.text());
  return true as any;
};

const recordBundleTransactionDB = async (bundle: { cartItems: { item: Item; quantity: number; }[]; finalPrice: number; commissionAmount: number; date: string; }) => {
  const payload = { items: bundle.cartItems.map(ci => ({ itemId: ci.item.id, quantity: ci.quantity })), finalPrice: bundle.finalPrice, commissionAmount: bundle.commissionAmount, date: bundle.date };
  const res = await fetch('/api/sales/bundle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await res.text());
  return true as any;
};

const clearAllItemsDB = async () => db.items.clear();

export const useItems = () => {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ['items'], queryFn: listItems });
  
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
  
  const clearAllMutation = useMutation({ mutationFn: async () => {}, onSuccess: () => {}, onError: () => {} });
  
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
