import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async push(deviceId: string, payload: any) {
    const entry = await this.prisma.syncQueue.create({
      data: { deviceId, payload: JSON.stringify(payload) },
    });
    return { ok: true, id: entry.id };
  }

  async pull(deviceId: string, lastSync?: string) {
    const since = lastSync ? new Date(lastSync) : new Date(0);

    await this.prisma.syncCursor.upsert({
      where: { deviceId },
      update: { lastSync: new Date() },
      create: { deviceId, lastSync: new Date() },
    });

    const [products, transactions, pending] = await Promise.all([
      this.prisma.product.findMany({
        where: { updatedAt: { gte: since } },
      }),
      this.prisma.transaction.findMany({
        where: { createdAt: { gte: since } },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.syncQueue.findMany({
        where: { deviceId, status: 'PENDING', createdAt: { gte: since } },
      }),
    ]);

    return {
      products,
      transactions,
      pendingCommands: pending.map((p) => JSON.parse(p.payload)),
      serverTime: new Date().toISOString(),
    };
  }

  async processQueue() {
    const pending = await this.prisma.syncQueue.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    let processed = 0;

    for (const item of pending) {
      try {
        const payload = JSON.parse(item.payload);
        if (payload.operation === 'CHECKOUT' && payload.transactionId) {
          const exists = await this.prisma.transaction.findUnique({
            where: { id: payload.transactionId },
          });
          if (!exists) {
            await this.prisma.transaction.create({
              data: {
                id: payload.transactionId,
                total: payload.total ?? 0,
                payment: 'CASH',
                cashierId: 'sync',
                items: {
                  create: (payload.items ?? []).map((i: any) => ({
                    productId: i.productId,
                    qty: i.qty,
                    price: i.price,
                  })),
                },
              },
            });
          }
        }
        await this.prisma.syncQueue.update({
          where: { id: item.id },
          data: { status: 'SYNCED', processedAt: new Date() },
        });
        processed++;
      } catch {
        await this.prisma.syncQueue.update({
          where: { id: item.id },
          data: { status: 'FAILED' },
        });
      }
    }

    return { processed, total: pending.length };
  }
}
