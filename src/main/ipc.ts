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

    const logFail = (error: string) => {
      db.auditLog.create({
        data: { userId: 'system', action: 'LOGIN_FAILED', details: `محاولة دخول فاشلة للمستخدم ${username}: ${error}` },
      }).catch(() => {});
    };

    const user = await db.user.findUnique({ where: { username } });
    if (!user) { logFail('غير موجود'); return { ok: false, error: 'المستخدم غير موجود' }; }
    if (!user.isActive) { logFail('غير نشط'); return { ok: false, error: 'الحساب غير نشط' }; }

    const valid = user.pinHash
      ? verifyPassword(password, user.pinHash)
      : verifyPassword(password, user.password);

    if (!valid) { logFail('كلمة مرور خاطئة'); return { ok: false, error: 'كلمة المرور خاطئة' }; }

    await db.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', details: `تسجيل دخول: ${user.displayName || user.username}` },
    });

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

  ipcMain.handle('db:getAuditLogs', async (_event, limit = 100, offset = 0) => {
    const db = getDb();
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.auditLog.count(),
    ]);
    return { logs, total };
  });

  ipcMain.handle('db:logAudit', async (_event, userId: string, action: string, details: string) => {
    const db = getDb();
    await db.auditLog.create({ data: { userId, action, details } });
    return { ok: true };
  });

  ipcMain.handle('db:getRecentTransactions', async (_event, limit = 10) => {
    const db = getDb();
    return db.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { items: true },
    });
  });

  ipcMain.handle('db:dashboard', async () => {
    const db = getDb();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const thirtyDays = new Date(now.getTime() + 30 * 86400000);

    const [todayTxs, lowStock, expiring, last7TxGroups] = await Promise.all([
      db.transaction.findMany({
        where: { createdAt: { gte: todayStart, lt: todayEnd } },
        include: {
          items: {
            include: { product: { select: { purchasePrice: true } } },
          },
        },
      }),
      db.$queryRawUnsafe<{ c: number }[]>('SELECT COUNT(*) as c FROM Product WHERE stockQty < minThreshold').then(r => Number(r[0].c)),
      db.product.count({ where: { expiryDate: { lte: thirtyDays, gt: now } } }),
      db.$queryRawUnsafe<{ date: string; total: number }[]>(
        `SELECT DATE(createdAt) as date, SUM(total) as total
         FROM Transaction
         WHERE createdAt >= datetime('now', '-7 days')
         GROUP BY DATE(createdAt)
         ORDER BY date ASC`
      ),
    ]);

    const todaySales = todayTxs.reduce((s, t) => s + t.total, 0);
    let todayProfit = 0;
    for (const tx of todayTxs) {
      for (const item of tx.items) {
        todayProfit += (item.price - item.product.purchasePrice) * item.qty;
      }
    }

    return {
      todaySales,
      todayProfit,
      todayTxCount: todayTxs.length,
      lowStockCount: lowStock,
      expiringSoonCount: expiring,
      dailySales: (last7TxGroups as { date: string; total: number }[]).map(r => ({
        date: r.date,
        total: Number(r.total),
      })),
    };
  });
}
