/// <reference types="vite/client" />

interface Product {
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

interface TransactionItemResult {
  id: string;
  qty: number;
  price: number;
  product: Product;
}

interface CheckoutResult {
  id: string;
  total: number;
  payment: string;
  cashierId: string;
  createdAt: string;
  items: TransactionItemResult[];
}

interface Window {
  electronAPI: {
    platform: string;
    isElectron: boolean;
    searchProducts: (query: string) => Promise<Product[]>;
    getProductByBarcode: (barcode: string) => Promise<Product | null>;
    checkout: (items: { productId: string; qty: number; price: number }[]) => Promise<CheckoutResult>;
  };
}
