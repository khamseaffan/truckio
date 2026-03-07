import { logger } from '@/shared/utils/logger';

/**
 * Offline write queue — queues writes when offline, flushes when online.
 * Phase 1: stub only. Fully implemented in Phase 2.
 */

interface QueuedWrite {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
}

const queue: QueuedWrite[] = [];

export function enqueue(write: Omit<QueuedWrite, 'id' | 'timestamp'>) {
  queue.push({
    ...write,
    id: Date.now().toString(),
    timestamp: Date.now(),
  });
  logger.debug('Queued write:', write.table, write.action);
}

export function getPendingCount() {
  return queue.length;
}

export async function flush() {
  // TODO Phase 2: Process queued writes against Supabase
  logger.info(`Flushing ${queue.length} queued writes`);
  queue.length = 0;
}
