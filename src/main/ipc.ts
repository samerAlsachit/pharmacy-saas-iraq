import { ipcMain } from 'electron';
import { getDb } from '../db';
import { verifyPassword } from '../db/auth';
import { enqueue, getPending, clearSynced } from '../sync/queue';
import { checkConnection } from '../sync/connection';
import { getConsecutiveFailures } from '../sync/scheduler';

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

    const transaction = await db.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`المنتج غير موجود: ${item.productId}`);
        if (product.stockQty < item.qty) throw new Error(`رصيد غير كافٍ: ${product.nameAr} (المتبقي ${product.stockQty})`);
      }

      const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

      const txRecord = await tx.transaction.create({
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
          details: `عملية بيع ${txRecord.id}: ${items.length} صنف، المجموع ${total}`,
        },
      });

      return txRecord;
    });

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const syncEntry = await enqueue('CHECKOUT', {
      transactionId: transaction.id,
      total,
      items: items.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price })),
    });

    return { transaction, syncQueueId: syncEntry.id };
  });

  ipcMain.handle('db:login', async (_event, username: string, password: string) => {
    const db = getDb();
    const user = await db.user.findUnique({ where: { username } });
    if (!user) return { ok: false, error: 'المستخدم غير موجود' };
    if (!user.isActive) return { ok: false, error: 'الحساب غير نشط' };

    if (user.pinHash && verifyPassword(password, user.pinHash)) {
      return { ok: true, user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } };
    }

    if (!verifyPassword(password, user.password)) {
      return { ok: false, error: 'كلمة المرور خاطئة' };
    }

    return { ok: true, user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } };
  });

  ipcMain.handle('sync:getPending', async () => {
    return getPending();
  });

  ipcMain.handle('sync:clearSynced', async () => {
    return clearSynced();
  });

  ipcMain.handle('sync:checkConnection', async () => {
    return checkConnection();
  });

  ipcMain.handle('sync:getStatus', async () => {
    const pending = await getPending();
    const online = await checkConnection();
    return {
      online,
      pendingCount: pending.length,
      consecutiveFailures: getConsecutiveFailures(),
    };
  });
}
