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

export interface CheckoutResponse {
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

export interface SyncQueueItem {
  id: string;
  payload: string;
  deviceId: string;
  status: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,

  login: (username: string, password: string): Promise<{ ok: boolean; user?: AuthUser; error?: string }> =>
    ipcRenderer.invoke('db:login', username, password),

  searchProducts: (query: string): Promise<Product[]> =>
    ipcRenderer.invoke('db:searchProducts', query),

  getProductByBarcode: (barcode: string): Promise<Product | null> =>
    ipcRenderer.invoke('db:getProductByBarcode', barcode),

  checkout: (items: { productId: string; qty: number; price: number }[]): Promise<CheckoutResponse> =>
    ipcRenderer.invoke('db:checkout', items),

  getPendingQueue: (): Promise<SyncQueueItem[]> =>
    ipcRenderer.invoke('sync:getPending'),

  clearSyncedQueue: (): Promise<number> =>
    ipcRenderer.invoke('sync:clearSynced'),

  checkConnection: (): Promise<boolean> =>
    ipcRenderer.invoke('sync:checkConnection'),

  getSyncStatus: (): Promise<{ online: boolean; pendingCount: number; consecutiveFailures: number }> =>
    ipcRenderer.invoke('sync:getStatus'),

  getAuditLogs: (limit?: number, offset?: number): Promise<{ logs: AuditEntry[]; total: number }> =>
    ipcRenderer.invoke('db:getAuditLogs', limit, offset),

  logAudit: (userId: string, action: string, details: string): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke('db:logAudit', userId, action, details),

  getDashboard: (): Promise<{
    todaySales: number;
    todayProfit: number;
    todayTxCount: number;
    lowStockCount: number;
    expiringSoonCount: number;
    dailySales: { date: string; total: number }[];
  }> => ipcRenderer.invoke('db:dashboard'),

  getRecentTransactions: (limit?: number): Promise<{ id: string; total: number; createdAt: string; items: { qty: number }[] }[]> =>
    ipcRenderer.invoke('db:getRecentTransactions', limit),
});
