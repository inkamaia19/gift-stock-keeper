import { useState, useEffect } from "react";
import { Sale } from "@/types/inventory";

const STORAGE_KEY = "inventory_sales";

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSales(parsed);
      } catch (error) {
        console.error("Failed to parse stored sales:", error);
        setSales([]);
      }
    }
  }, []);

  // Save to localStorage whenever sales change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  }, [sales]);

  const addSale = (
    productId: string,
    productName: string,
    quantity: number,
    pricePerUnit: number
  ) => {
    const newSale: Sale = {
      id: crypto.randomUUID(),
      productId,
      productName,
      quantity,
      pricePerUnit,
      totalAmount: quantity * pricePerUnit,
      date: new Date().toISOString(),
    };

    setSales((prev) => [...prev, newSale]);
    return true;
  };

  const getTotalRevenue = () => {
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  };

  const getSalesByDate = () => {
    const salesByDate: { [key: string]: number } = {};
    
    sales.forEach((sale) => {
      const date = new Date(sale.date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
      salesByDate[date] = (salesByDate[date] || 0) + sale.totalAmount;
    });

    return Object.entries(salesByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-7); // Last 7 entries
  };

  const clearAll = () => {
    setSales([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    sales,
    addSale,
    getTotalRevenue,
    getSalesByDate,
    clearAll,
  };
};
