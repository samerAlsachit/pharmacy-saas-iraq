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

interface Window {
  electronAPI: {
    platform: string;
    isElectron: boolean;
    searchProducts: (query: string) => Promise<Product[]>;
    getProductByBarcode: (barcode: string) => Promise<Product | null>;
  };
}
