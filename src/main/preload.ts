import { contextBridge, ipcRenderer } from 'electron';

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

export interface TransactionItemResult {
  id: string;
  qty: number;
  price: number;
  product: Product;
}

export interface CheckoutResult {
  id: string;
  total: number;
  payment: string;
  cashierId: string;
  createdAt: string;
  items: TransactionItemResult[];
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  searchProducts: (query: string): Promise<Product[]> =>
    ipcRenderer.invoke('db:searchProducts', query),
  getProductByBarcode: (barcode: string): Promise<Product | null> =>
    ipcRenderer.invoke('db:getProductByBarcode', barcode),
  checkout: (items: { productId: string; qty: number; price: number }[]): Promise<CheckoutResult> =>
    ipcRenderer.invoke('db:checkout', items),
});
