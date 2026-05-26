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

interface CheckoutResponse {
  transaction: {
    id: string;
    total: number;
    payment: string;
    cashierId: string;
    createdAt: string;
    items: TransactionItemResult[];
  };
  syncQueueId: string;
}

interface SyncQueueItem {
  id: string;
  payload: string;
  deviceId: string;
  status: string;
  createdAt: string;
}

interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

interface Window {
  electronAPI: {
    platform: string;
    isElectron: boolean;
    login: (username: string, password: string) => Promise<{ ok: boolean; user?: AuthUser; error?: string }>;
    searchProducts: (query: string) => Promise<Product[]>;
    getProductByBarcode: (barcode: string) => Promise<Product | null>;
    checkout: (items: { productId: string; qty: number; price: number }[]) => Promise<CheckoutResponse>;
    getPendingQueue: () => Promise<SyncQueueItem[]>;
    clearSyncedQueue: () => Promise<number>;
    checkConnection: () => Promise<boolean>;
    getSyncStatus: () => Promise<{ online: boolean; pendingCount: number; consecutiveFailures: number }>;
  };
}
