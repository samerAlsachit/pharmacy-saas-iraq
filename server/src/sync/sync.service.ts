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

  async pull(deviceId: string, lastSync: string) {
    const since = new Date(lastSync);
    const products = await this.prisma.product.findMany({
      where: { updatedAt: { gte: since } },
    });
    const transactions = await this.prisma.transaction.findMany({
      where: { createdAt: { gte: since } },
      include: { items: true },
    });
    return { products, transactions, serverTime: new Date().toISOString() };
  }

  async processQueue() {
    const pending = await this.prisma.syncQueue.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    for (const item of pending) {
      try {
        const payload = JSON.parse(item.payload);
        if (payload.operation === 'CHECKOUT') {
          await this.prisma.transaction.create({
            data: {
              id: payload.transactionId,
              total: payload.total,
              payment: 'CASH',
              cashierId: 'sync',
              items: {
                create: payload.items.map((i: any) => ({
                  productId: i.productId,
                  qty: i.qty,
                  price: i.price,
                })),
              },
            },
          });
        }
        await this.prisma.syncQueue.update({
          where: { id: item.id },
          data: { status: 'SYNCED', processedAt: new Date() },
        });
      } catch {
        await this.prisma.syncQueue.update({
          where: { id: item.id },
          data: { status: 'FAILED' },
        });
      }
    }

    return { processed: pending.length };
  }
}
