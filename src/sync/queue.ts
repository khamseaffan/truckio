import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/shared/utils/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'trukio_sync_queue';

interface QueuedWrite {
  id: string;
  table: string;
  recordId: string;
  operation: 'upsert' | 'delete';
  data?: Record<string, unknown>;
  retryCount: number;
  timestamp: number;
}

async function loadQueue(): Promise<QueuedWrite[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedWrite[]) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedWrite[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    logger.error('Failed to persist sync queue:', err);
  }
}

export async function enqueue(write: {
  table: string;
  recordId: string;
  operation: 'upsert' | 'delete';
  data?: Record<string, unknown>;
}): Promise<void> {
  const queue = await loadQueue();
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
  await saveQueue(queue);
  logger.debug(`Queued ${write.operation} on ${write.table}:${write.recordId}`);
}

export async function getPendingCount(): Promise<number> {
  const queue = await loadQueue();
  return queue.length;
}

export async function flush(supabase: SupabaseClient): Promise<void> {
  const queue = await loadQueue();
  if (queue.length === 0) return;

  logger.info(`Flushing ${queue.length} queued writes to Supabase`);
  const flushedIds: string[] = [];

  for (const write of queue) {
    try {
      if (write.operation === 'delete') {
        const { error } = await supabase.from(write.table).delete().eq('id', write.recordId);
        if (error) throw error;
      } else if (write.data) {
        const { error } = await supabase.from(write.table).upsert(write.data);
        if (error) throw error;
      }
      flushedIds.push(write.id);
      logger.debug(`Flushed ${write.operation} on ${write.table}:${write.recordId}`);
    } catch (err) {
      write.retryCount += 1;
      logger.error(`Flush failed for ${write.table}:${write.recordId} (retry ${write.retryCount}):`, err);
    }
  }

  // Persist only the items that failed
  const remaining = queue.filter(q => !flushedIds.includes(q.id));
  await saveQueue(remaining);
}
