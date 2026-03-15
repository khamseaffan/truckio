import NetInfo from '@react-native-community/netinfo';
import type { Database } from '@nozbe/watermelondb';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/shared/utils/logger';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import { flush, getPendingCount } from './queue';

/** Merge Supabase rows into a WatermelonDB collection, upsert by id */
async function mergeInto(
  db: Database,
  tableName: string,
  rows: Record<string, unknown>[],
  mapFn: (record: any, data: Record<string, unknown>) => void,
): Promise<void> {
  if (rows.length === 0) return;
  const collection = db.get<any>(tableName);
  const ops: any[] = [];

  for (const data of rows) {
    let existing: any = null;
    try {
      existing = await collection.find(data.id as string);
    } catch {
      // WatermelonDB throws when record is not found — treat as "needs create"
    }

    if (existing) {
      ops.push(existing.prepareUpdate((r: any) => mapFn(r, data)));
    } else {
      ops.push(
        collection.prepareCreate((r: any) => {
          r._raw.id = data.id;
          mapFn(r, data);
        }),
      );
    }
  }

  if (ops.length > 0) {
    await db.write(async () => db.batch(...ops));
  }
}

class SyncManager {
  private isRunning = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private netInfoUnsubscribe: (() => void) | null = null;

  async sync(db: Database, supabase: SupabaseClient): Promise<void> {
    if (this.isRunning) {
      logger.debug('Sync already in progress, skipping');
      return;
    }

    const { session, role } = useAuthStore.getState();
    if (!session?.user) return;

    const userId = session.user.id;
    this.isRunning = true;
    useSyncStore.getState().setStatus('syncing');

    try {
      logger.info('Sync started');

      if (role === 'owner') {
        await this.pullForOwner(db, supabase, userId);
      } else if (role === 'driver') {
        await this.pullForDriver(db, supabase, userId);
      }

      await flush(supabase);

      useSyncStore.getState().setStatus('idle');
      useSyncStore.getState().setLastSynced(new Date());
      useSyncStore.getState().setPendingCount(await getPendingCount());
      logger.info('Sync complete');
    } catch (err) {
      logger.error('Sync failed:', err);
      useSyncStore.getState().setStatus('error');
      useSyncStore.getState().setPendingCount(await getPendingCount());
    } finally {
      this.isRunning = false;
    }
  }

  private async pullForOwner(db: Database, supabase: SupabaseClient, ownerId: string) {
    const [ordersRes, jobsRes, driversRes] = await Promise.all([
      supabase.from('orders').select('*').eq('owner_id', ownerId),
      supabase.from('jobs').select('*').eq('owner_id', ownerId),
      supabase.from('drivers').select('*').eq('owner_id', ownerId),
    ]);

    if (ordersRes.data) {
      await mergeInto(db, 'orders', ordersRes.data, (r, d) => {
        r.ownerId = d.owner_id;
        r.customerName = d.customer_name ?? '';
        r.customerPhone = d.customer_phone ?? '';
        r.pickupAddress = d.pickup_address ?? '';
        r.dropAddress = d.drop_address ?? '';
        r.materialType = d.material_type ?? '';
        r.quantityValue = d.quantity_value ?? 0;
        r.quantityUnit = d.quantity_unit ?? '';
        r.status = d.status ?? 'pending';
        r.notes = d.notes ?? '';
        r.scheduledDate = d.scheduled_date ? new Date(d.scheduled_date).getTime() : 0;
      });
    }

    if (jobsRes.data) {
      await mergeInto(db, 'jobs', jobsRes.data, (r, d) => {
        r.orderId = d.order_id;
        r.ownerId = d.owner_id;
        r.driverId = d.driver_id;
        r.driverName = d.driver_name ?? '';
        r.status = d.status ?? 'assigned';
        r.pickupTime = d.pickup_time ? new Date(d.pickup_time).getTime() : 0;
        r.deliveryTime = d.delivery_time ? new Date(d.delivery_time).getTime() : 0;
        r.shareToken = d.share_token ?? '';
      });
    }

    if (driversRes.data) {
      await mergeInto(db, 'drivers', driversRes.data, (r, d) => {
        r.userId = d.user_id ?? '';
        r.ownerId = d.owner_id ?? '';
        r.name = d.name ?? '';
        r.phone = d.phone ?? '';
        r.isActive = d.is_active ?? true;
      });
    }
  }

  private async pullForDriver(db: Database, supabase: SupabaseClient, driverId: string) {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('driver_id', driverId)
      .not('status', 'in', '(delivered,rejected)');

    if (jobs) {
      await mergeInto(db, 'jobs', jobs, (r, d) => {
        r.orderId = d.order_id;
        r.ownerId = d.owner_id;
        r.driverId = d.driver_id;
        r.driverName = d.driver_name ?? '';
        r.status = d.status ?? 'assigned';
        r.pickupTime = d.pickup_time ? new Date(d.pickup_time).getTime() : 0;
        r.deliveryTime = d.delivery_time ? new Date(d.delivery_time).getTime() : 0;
        r.shareToken = d.share_token ?? '';
      });

      // Pull associated orders so driver can see job details
      const orderIds = jobs.map((j: any) => j.order_id).filter(Boolean);
      if (orderIds.length > 0) {
        const { data: orders } = await supabase.from('orders').select('*').in('id', orderIds);
        if (orders) {
          await mergeInto(db, 'orders', orders, (r, d) => {
            r.ownerId = d.owner_id;
            r.customerName = d.customer_name ?? '';
            r.customerPhone = d.customer_phone ?? '';
            r.pickupAddress = d.pickup_address ?? '';
            r.dropAddress = d.drop_address ?? '';
            r.materialType = d.material_type ?? '';
            r.quantityValue = d.quantity_value ?? 0;
            r.quantityUnit = d.quantity_unit ?? '';
            r.status = d.status ?? 'pending';
            r.notes = d.notes ?? '';
            r.scheduledDate = d.scheduled_date ? new Date(d.scheduled_date).getTime() : 0;
          });
        }
      }
    }
  }

  startAutoSync(db: Database, supabase: SupabaseClient): void {
    // Clean up any existing subscriptions before starting
    this.stopAutoSync();

    // Subscribe to network state changes
    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        useSyncStore.getState().setStatus('idle');
        this.sync(db, supabase);
      } else {
        useSyncStore.getState().setStatus('offline');
        getPendingCount().then(c => useSyncStore.getState().setPendingCount(c));
      }
    });

    // Periodic sync every 60 seconds when online
    this.syncInterval = setInterval(() => {
      NetInfo.fetch().then(state => {
        if (state.isConnected && state.isInternetReachable) {
          this.sync(db, supabase);
        }
      });
    }, 60_000);

    // Trigger initial sync
    this.sync(db, supabase);
  }

  stopAutoSync(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncManager = new SyncManager();
