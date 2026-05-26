import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dailySales(date?: string) {
    const start = date ? new Date(date) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const tx = await this.prisma.transaction.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { items: true },
    });

    const totalSales = tx.reduce((s, t) => s + t.total, 0);
    const totalCost = tx.reduce((s, t) =>
      s + t.items.reduce((si, i) => si + i.price * i.qty, 0), 0);

    return {
      date: start.toISOString().slice(0, 10),
      transactionCount: tx.length,
      totalSales,
      totalProfit: totalSales - totalCost,
    };
  }

  async lowStock(threshold = 10) {
    return this.prisma.product.findMany({
      where: { stockQty: { lte: threshold } },
      orderBy: { stockQty: 'asc' },
    });
  }

  async expiringSoon(days = 30) {
    const limit = new Date();
    limit.setDate(limit.getDate() + days);
    return this.prisma.product.findMany({
      where: { expiryDate: { lte: limit } },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
