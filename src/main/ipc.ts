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

  ipcMain.handle('db:checkout', async (_event, items: { productId: string; qty: number; price: number }[]) => {
    const db = getDb();

    return db.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`المنتج غير موجود: ${item.productId}`);
        if (product.stockQty < item.qty) throw new Error(`رصيد غير كافٍ: ${product.nameAr} (المتبقي ${product.stockQty})`);
      }

      const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

      const transaction = await tx.transaction.create({
        data: {
          total,
          payment: 'CASH',
          cashierId: 'local',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              qty: item.qty,
              price: item.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.qty } },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: 'local',
          action: 'CHECKOUT',
          details: `عملية بيع ${transaction.id}: ${items.length} صنف، المجموع ${total}`,
        },
      });

      return transaction;
    });
  });
}
