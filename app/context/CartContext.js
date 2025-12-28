"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from MongoDB or localStorage
  useEffect(() => {
    const loadCart = async () => {
      if (status === "loading") return;

      if (session?.user) {
        try {
          const res = await axios.get("/api/save?type=cart");
          setCart(res.data.items || []);
        } catch (err) {
          console.error("❌ Failed to load cart from DB:", err.message);
          setCart([]);
        }
      } else {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
      }

      setLoading(false);
    };

    loadCart();
  }, [session, status]);

  // Save to localStorage if not logged in
  useEffect(() => {
    if (!session?.user) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, session]);

  const syncCartToDB = async (updatedCart) => {
    if (!session?.user) return;
    try {
      await axios.post("/api/save", {
        type: "cart",
        data: updatedCart,
      });
    } catch (err) {
      console.error("❌ Error syncing to DB:", err.message);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updatedCart;

      if (existing) {
        updatedCart = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...prev, { ...product, quantity: 1 }];
      }

      syncCartToDB(updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const updatedCart = prev.filter((item) => item.id !== id);
      syncCartToDB(updatedCart);
      return updatedCart;
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) => {
      const updatedCart = prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      syncCartToDB(updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    cart.length = 0;
    cart = [];
    setCart([]);
    syncCartToDB([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
