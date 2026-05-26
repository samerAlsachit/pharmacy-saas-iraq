import { getDb } from '../db';

export interface ConflictRecord {
  localUpdatedAt: Date;
  remoteUpdatedAt: Date;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
}

export interface ResolveResult {
  winner: 'local' | 'remote';
  mergedData: Record<string, unknown>;
}

export function resolveConflict(record: ConflictRecord): ResolveResult {
  const winner = record.localUpdatedAt >= record.remoteUpdatedAt ? 'local' : 'remote';
  return {
    winner,
    mergedData: winner === 'local' ? record.localData : record.remoteData,
  };
}

export async function resolveProductConflict(
  productId: string,
  remoteProduct: { updatedAt: string | Date; stockQty?: number; [key: string]: unknown },
): Promise<'local' | 'remote'> {
  const db = getDb();
  const local = await db.product.findUnique({ where: { id: productId } });
  if (!local) return 'remote';

  const result = resolveConflict({
    localUpdatedAt: new Date(local.updatedAt),
    remoteUpdatedAt: new Date(remoteProduct.updatedAt),
    localData: local as unknown as Record<string, unknown>,
    remoteData: remoteProduct as unknown as Record<string, unknown>,
  });

  if (result.winner === 'remote') {
    await db.product.update({
      where: { id: productId },
      data: {
        nameAr: (remoteProduct.nameAr as string) ?? local.nameAr,
        nameEn: (remoteProduct.nameEn as string) ?? local.nameEn,
        barcode: (remoteProduct.barcode as string) ?? local.barcode,
        category: (remoteProduct.category as string) ?? local.category,
        stockQty: (remoteProduct.stockQty as number) ?? local.stockQty,
        minThreshold: (remoteProduct.minThreshold as number) ?? local.minThreshold,
        expiryDate: remoteProduct.expiryDate ? new Date(remoteProduct.expiryDate as string) : local.expiryDate,
        purchasePrice: (remoteProduct.purchasePrice as number) ?? local.purchasePrice,
        sellPrice: (remoteProduct.sellPrice as number) ?? local.sellPrice,
        isControlled: (remoteProduct.isControlled as boolean) ?? local.isControlled,
        supplier: (remoteProduct.supplier as string | null) ?? local.supplier,
      },
    });
  }

  try {
    await db.auditLog.create({
      data: {
        userId: 'local',
        action: 'CONFLICT_RESOLVED',
        details: `Product ${productId}: ${result.winner} won (local ${local.updatedAt.toISOString()} vs remote ${new Date(remoteProduct.updatedAt as string).toISOString()})`,
      },
    });
  } catch {
    console.warn(`[conflict] failed to log audit for product ${productId}`);
  }

  return result.winner;
}
