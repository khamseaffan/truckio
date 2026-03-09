import { logger } from '@/shared/utils/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

interface QueuedWrite {
  id: string;
  table: string;
  recordId: string;
  operation: 'upsert' | 'delete';
  data?: Record<string, unknown>;
  retryCount: number;
  timestamp: number;
}

const queue: QueuedWrite[] = [];

export function enqueue(write: {
  table: string;
  recordId: string;
  operation: 'upsert' | 'delete';
  data?: Record<string, unknown>;
}) {
  // Deduplicate: if same table+recordId already queued, update in place
  const existing = queue.find(q => q.table === write.table && q.recordId === write.recordId);
  if (existing) {
    existing.data = write.data;
    existing.operation = write.operation;
    existing.timestamp = Date.now();
  } else {
    queue.push({
      ...write,
      id: `${Date.now()}-${Math.random()}`,
      retryCount: 0,
      timestamp: Date.now(),
    });
  }
  logger.debug(`Queued ${write.operation} on ${write.table}:${write.recordId}`);
}

export function getPendingCount() {
  return queue.length;
}

export async function flush(supabase: SupabaseClient): Promise<void> {
  if (queue.length === 0) return;

  logger.info(`Flushing ${queue.length} queued writes to Supabase`);
  const pending = [...queue];

  for (const write of pending) {
    try {
      if (write.operation === 'delete') {
        const { error } = await supabase.from(write.table).delete().eq('id', write.recordId);
        if (error) throw error;
      } else if (write.data) {
        const { error } = await supabase.from(write.table).upsert(write.data);
        if (error) throw error;
      }
      // Remove from queue on success
      const idx = queue.findIndex(q => q.id === write.id);
      if (idx >= 0) queue.splice(idx, 1);
      logger.debug(`Flushed ${write.operation} on ${write.table}:${write.recordId}`);
    } catch (err) {
      write.retryCount += 1;
      logger.error(`Flush failed for ${write.table}:${write.recordId} (retry ${write.retryCount}):`, err);
    }
  }
}
