import { getDb } from '../db';

export type SyncOperation = 'CHECKOUT' | 'CREATE_PRODUCT' | 'UPDATE_PRODUCT' | 'UPDATE_STOCK';

export interface SyncQueueItem {
  id: string;
  payload: string;
  deviceId: string;
  status: string;
  createdAt: Date;
}

export async function enqueue(
  operation: SyncOperation,
  payload: object,
  deviceId: string = 'local',
): Promise<SyncQueueItem> {
  const db = getDb();
  const entry = await db.syncQueue.create({
    data: {
      payload: JSON.stringify({ operation, ...payload }),
      deviceId,
      status: 'PENDING',
    },
  });
  return entry;
}

export async function dequeue(): Promise<SyncQueueItem | null> {
  const db = getDb();
  const entry = await db.syncQueue.findFirst({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });
  if (entry) {
    await db.syncQueue.update({
      where: { id: entry.id },
      data: { status: 'SYNCING' },
    });
  }
  return entry;
}

export async function markSynced(id: string): Promise<void> {
  const db = getDb();
  await db.syncQueue.update({
    where: { id },
    data: { status: 'SYNCED' },
  });
}

export async function markFailed(id: string): Promise<void> {
  const db = getDb();
  await db.syncQueue.update({
    where: { id },
    data: { status: 'FAILED' },
  });
}

export async function getPending(): Promise<SyncQueueItem[]> {
  const db = getDb();
  return db.syncQueue.findMany({
    where: { status: { in: ['PENDING', 'SYNCING', 'FAILED'] } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function clearSynced(before?: Date): Promise<number> {
  const db = getDb();
  const result = await db.syncQueue.deleteMany({
    where: {
      status: 'SYNCED',
      ...(before ? { createdAt: { lte: before } } : {}),
    },
  });
  return result.count;
}
