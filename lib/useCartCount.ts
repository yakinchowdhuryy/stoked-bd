"use client";

import { useEffect, useState } from "react";

const CART_KEY = "stoked-cart";

export function readCartCount(): number {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (!saved) return 0;

    const cart = JSON.parse(saved);
    if (!Array.isArray(cart)) return 0;

    return cart.reduce(
      (total: number, item: any) => total + Number(item?.quantity || 0),
      0
    );
  } catch {
    return 0;
  }
}

export default function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readCartCount());

    update();

    window.addEventListener("cart-updated", update);
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    window.addEventListener("pageshow", update);

    return () => {
      window.removeEventListener("cart-updated", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
      window.removeEventListener("pageshow", update);
    };
  }, []);

  return count;
}