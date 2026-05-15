import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CART_KEY = "store_cart_v1";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsHydrated(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY && e.newValue) {
        setItems(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    
    const handleCustom = () => {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved));
    };
    window.addEventListener("store_cart_change", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("store_cart_change", handleCustom);
    };
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new CustomEvent("store_cart_change"));
  };

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      const qty = item.quantity || 1;
      let newItems;
      if (existing) {
        newItems = prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i);
      } else {
        newItems = [...prev, { ...item, quantity: qty }];
      }
      localStorage.setItem(CART_KEY, JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent("store_cart_change"));
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => {
      const newItems = prev.map(i => i.productId === productId ? { ...i, quantity } : i);
      localStorage.setItem(CART_KEY, JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent("store_cart_change"));
      return newItems;
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.productId !== productId);
      localStorage.setItem(CART_KEY, JSON.stringify(newItems));
      window.dispatchEvent(new CustomEvent("store_cart_change"));
      return newItems;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new CustomEvent("store_cart_change"));
  }, []);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, addItem, updateQuantity, removeItem, clear, totalPrice, totalItems, isHydrated };
}
