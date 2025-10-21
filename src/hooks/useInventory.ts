import { useState, useEffect } from "react";
import { Product, ProductWithCalculated } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "inventory_products";

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProducts(parsed);
      } catch (error) {
        console.error("Failed to parse stored inventory:", error);
        // Initialize with example data
        const exampleProduct: Product = {
          id: crypto.randomUUID(),
          name: "T-Shirt Size M",
          initialStock: 10,
          sold: 2,
        };
        setProducts([exampleProduct]);
      }
    } else {
      // Initialize with example data
      const exampleProduct: Product = {
        id: crypto.randomUUID(),
        name: "T-Shirt Size M",
        initialStock: 10,
        sold: 2,
      };
      setProducts([exampleProduct]);
    }
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  const getProductsWithCalculated = (): ProductWithCalculated[] => {
    return products
      .map((product) => {
        const currentStock = product.initialStock - product.sold;
        const status: "Available" | "Out of Stock" = currentStock > 0 ? "Available" : "Out of Stock";
        return {
          ...product,
          currentStock,
          status,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const addProduct = (name: string, initialStock: number, imageUrl?: string) => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return false;
    }

    if (initialStock < 0 || !Number.isInteger(initialStock)) {
      toast({
        title: "Error",
        description: "Initial stock must be a positive integer",
        variant: "destructive",
      });
      return false;
    }

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      initialStock,
      sold: 0,
      imageUrl,
    };

    setProducts((prev) => [...prev, newProduct]);
    toast({
      title: "Success",
      description: `Added ${name} to inventory`,
    });
    return true;
  };

  const sellProduct = (id: string, quantity: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      });
      return false;
    }

    const currentStock = product.initialStock - product.sold;

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      toast({
        title: "Error",
        description: "Quantity must be a positive integer",
        variant: "destructive",
      });
      return false;
    }

    if (quantity > currentStock) {
      toast({
        title: "Error",
        description: `Only ${currentStock} units available`,
        variant: "destructive",
      });
      return false;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, sold: p.sold + quantity } : p
      )
    );

    toast({
      title: "Success",
      description: `Sold ${quantity} units of ${product.name}`,
    });
    return true;
  };

  const clearAll = () => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Success",
      description: "All inventory cleared",
    });
  };

  const getTotalProducts = () => products.length;
  const getTotalStock = () =>
    products.reduce((sum, p) => sum + (p.initialStock - p.sold), 0);
  const getTotalSold = () => products.reduce((sum, p) => sum + p.sold, 0);

  return {
    products: getProductsWithCalculated(),
    addProduct,
    sellProduct,
    clearAll,
    getTotalProducts,
    getTotalStock,
    getTotalSold,
  };
};
