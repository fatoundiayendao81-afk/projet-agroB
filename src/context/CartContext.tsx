// context/CartContext.tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.id === product.id
          );
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            cartItems: [...state.cartItems, { ...product, quantity: 1 }],
          };
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;

        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ cartItems: [] });
      },

      getCartTotal: () => {
        const { cartItems } = get();
        return cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getCartItemsCount: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
