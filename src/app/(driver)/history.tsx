import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/db';
import Job from '@/db/models/Job';
import Order from '@/db/models/Order';
import { useAuthStore } from '@/store/authStore';
import { syncManager } from '@/sync/SyncManager';
import { supabase } from '@/services/supabase/client';

interface JobWithOrder {
  job: Job;
  order: Order | null;
}

export default function HistoryScreen() {
  const { session } = useAuthStore();
  const [items, setItems] = useState<JobWithOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const sub = database
      .get<Job>('jobs')
      .query(
        Q.where('driver_id', session.user.id),
        Q.where('status', Q.oneOf(['delivered', 'rejected'])),
      )
      .observe()
      .subscribe(async jobs => {
        const sorted = [...jobs].sort(
          (a, b) => (b.deliveryTime ?? 0) - (a.deliveryTime ?? 0),
        );

        const withOrders = await Promise.all(
          sorted.map(async job => {
            let order: Order | null = null;
            try {
              order = await database.get<Order>('orders').find(job.orderId);
            } catch {}
            return { job, order };
          }),
        );

        setItems(withOrders);
      });

    return () => sub.unsubscribe();
  }, [session?.user?.id]);

  async function onRefresh() {
    setRefreshing(true);
    await syncManager.sync(database, supabase);
    setRefreshing(false);
  }

  function renderItem({ item }: { item: JobWithOrder }) {
    const { job, order } = item;
    const deliveryDate = job.deliveryTime
      ? new Date(job.deliveryTime).toLocaleDateString('en-IN')
      : null;

    return (
      <View style={styles.jobCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName} numberOfLines={1}>
            {order?.customerName ?? '—'}
          </Text>
          <Text style={styles.dateText}>{deliveryDate ?? '—'}</Text>
        </View>
        {order && (
          <Text style={styles.route} numberOfLines={1}>
            {order.pickupAddress.split(',')[0]} → {order.dropAddress.split(',')[0]}
          </Text>
        )}
        <Text style={styles.material} numberOfLines={1}>
          {order?.materialType ?? '—'}
          {job.status === 'rejected' ? ' · Rejected' : ''}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Job History</Text>
      <FlatList
        data={items}
        keyExtractor={item => item.job.id}
        renderItem={renderItem}
        contentContainerStyle={
          items.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No past jobs</Text>
            <Text style={styles.emptySub}>Completed deliveries will appear here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2A26',
    paddingTop: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2A26',
    flex: 1,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#8A8279',
    fontWeight: '500',
  },
  route: {
    fontSize: 13,
    color: '#8A8279',
  },
  material: {
    fontSize: 13,
    color: '#2D2A26',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2A26',
  },
  emptySub: {
    fontSize: 14,
    color: '#8A8279',
    marginTop: 4,
    textAlign: 'center',
  },
});
