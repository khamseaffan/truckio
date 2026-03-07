import { logger } from '@/shared/utils/logger';
import { useSyncStore } from '@/store/syncStore';

/**
 * SyncManager — orchestrates WatermelonDB ↔ Supabase sync.
 * Phase 1: stub only. Fully implemented in Phase 2.
 */
class SyncManager {
  private isRunning = false;

  async sync() {
    if (this.isRunning) {
      logger.debug('Sync already in progress, skipping');
      return;
    }

    this.isRunning = true;
    useSyncStore.getState().setStatus('syncing');

    try {
      // TODO Phase 2: Implement per-table sync strategies
      logger.info('Sync started');
      await new Promise((r) => setTimeout(r, 100)); // placeholder
      logger.info('Sync complete');

      useSyncStore.getState().setStatus('idle');
      useSyncStore.getState().setLastSynced(new Date());
    } catch (err) {
      logger.error('Sync failed:', err);
      useSyncStore.getState().setStatus('error');
    } finally {
      this.isRunning = false;
    }
  }
}

export const syncManager = new SyncManager();
