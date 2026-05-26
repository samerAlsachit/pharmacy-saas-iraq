import { ipcMain } from 'electron';
import { getDb } from '../db';

export function registerIpcHandlers(): void {
  ipcMain.handle('db:searchProducts', async (_event, query: string) => {
    if (!query || query.length < 1) return [];

    const db = getDb();

    const products = await db.product.findMany({
      where: {
        OR: [
          { barcode: { contains: query } },
          { nameAr: { contains: query } },
          { nameEn: { contains: query } },
        ],
      },
      orderBy: { nameAr: 'asc' },
      take: 20,
    });

    return products;
  });

  ipcMain.handle('db:getProductByBarcode', async (_event, barcode: string) => {
    const db = getDb();
    return db.product.findUnique({ where: { barcode } });
  });
}
