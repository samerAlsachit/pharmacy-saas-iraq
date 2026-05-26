import { checkConnection } from './connection';
import { dequeue, markSynced, markFailed } from './queue';

const RETRY_DELAYS = [5_000, 10_000, 30_000, 60_000, 300_000];
const POLL_INTERVAL = 15_000;

export interface SyncProcessor {
  (item: { id: string; payload: string }): Promise<boolean>;
}

let timer: ReturnType<typeof setInterval> | null = null;
let consecutiveFailures = 0;

export function startSyncScheduler(processItem: SyncProcessor): void {
  if (timer) return;

  timer = setInterval(async () => {
    const online = await checkConnection();
    if (!online) {
      consecutiveFailures++;
      return;
    }

    const retryDelay = RETRY_DELAYS[Math.min(consecutiveFailures, RETRY_DELAYS.length - 1)];
    if (consecutiveFailures > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }

    const item = await dequeue();
    if (!item) {
      consecutiveFailures = 0;
      return;
    }

    try {
      const ok = await processItem(item);
      if (ok) {
        await markSynced(item.id);
        consecutiveFailures = 0;
      } else {
        await markFailed(item.id);
        consecutiveFailures++;
      }
    } catch {
      await markFailed(item.id);
      consecutiveFailures++;
    }
  }, POLL_INTERVAL);
}

export function stopSyncScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export function getConsecutiveFailures(): number {
  return consecutiveFailures;
}
