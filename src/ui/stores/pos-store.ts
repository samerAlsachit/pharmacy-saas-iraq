import { create } from 'zustand';

export interface Product {
  id: string;
  barcode: string;
  nameAr: string;
  nameEn: string;
  category: string;
  stockQty: number;
  minThreshold: number;
  expiryDate: string;
  purchasePrice: number;
  sellPrice: number;
  isControlled: boolean;
  supplier: string | null;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  price: number;
}

interface PosStore {
  query: string;
  results: Product[];
  selectedIndex: number;
  isSearching: boolean;
  cart: CartItem[];
  setQuery: (q: string) => void;
  setResults: (r: Product[]) => void;
  setSelectedIndex: (i: number) => void;
  setIsSearching: (s: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
}

export const usePosStore = create<PosStore>()((set, get) => ({
  query: '',
  results: [],
  selectedIndex: -1,
  isSearching: false,
  cart: [],

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
  setIsSearching: (isSearching) => set({ isSearching }),

  addToCart: (product) => {
    const { cart } = get();
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        ),
      });
    } else {
      set({ cart: [...cart, { product, qty: 1, price: product.sellPrice }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) });
  },

  updateCartQty: (productId, qty) => {
    if (qty <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId ? { ...item, qty } : item,
      ),
    });
  },

  clearCart: () => set({ cart: [] }),
}));

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}
