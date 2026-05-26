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

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  searchProducts: (query: string): Promise<Product[]> =>
    ipcRenderer.invoke('db:searchProducts', query),
  getProductByBarcode: (barcode: string): Promise<Product | null> =>
    ipcRenderer.invoke('db:getProductByBarcode', barcode),
});
