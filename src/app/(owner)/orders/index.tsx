import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/db';
import Order from '@/db/models/Order';
import Badge from '@/shared/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { syncManager } from '@/sync/SyncManager';
import { supabase } from '@/services/supabase/client';

const STATUS_TABS = ['All', 'Pending', 'Assigned', 'Completed'] as const;
type Tab = (typeof STATUS_TABS)[number];

function statusToBadgeVariant(status: string) {
  switch (status) {
    case 'pending': return 'warning' as const;
    case 'assigned': return 'info' as const;
    case 'in_progress': return 'info' as const;
    case 'completed': return 'success' as const;
    case 'cancelled': return 'error' as const;
    default: return 'neutral' as const;
  }
}

function formatStatus(status: string): string {
  return status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function OrdersListScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const query = database
      .get<Order>('orders')
      .query(Q.where('owner_id', session.user.id));

    const subscription = query.observe().subscribe(setOrders);
    return () => subscription.unsubscribe();
  }, [session?.user?.id]);

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return o.status === 'pending';
    if (activeTab === 'Assigned') return o.status === 'assigned' || o.status === 'in_progress';
    if (activeTab === 'Completed') return o.status === 'completed' || o.status === 'cancelled';
    return true;
  });

  async function onRefresh() {
    setRefreshing(true);
    await syncManager.sync(database, supabase);
    setRefreshing(false);
  }

  function renderOrder({ item }: { item: Order }) {
    const pickup = item.pickupAddress.split(',')[0] ?? item.pickupAddress;
    const drop = item.dropAddress.split(',')[0] ?? item.dropAddress;

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() => router.push(`/(owner)/orders/${item.id}`)}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.customerName}
          </Text>
          <Badge
            label={formatStatus(item.status)}
            variant={statusToBadgeVariant(item.status)}
          />
        </View>
        <Text style={styles.route} numberOfLines={1}>
          {pickup} → {drop}
        </Text>
        <Text style={styles.material} numberOfLines={1}>
          {item.materialType}
          {item.quantityValue ? ` · ${item.quantityValue}${item.quantityUnit ? ' ' + item.quantityUnit : ''}` : ''}
        </Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/(owner)/orders/new')}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {STATUS_TABS.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={
          filteredOrders.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySub}>Tap + New to create your first order</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2A26',
  },
  addButton: {
    backgroundColor: '#1A6B5A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3EDE4',
  },
  tabActive: {
    backgroundColor: '#1A6B5A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8279',
  },
  tabTextActive: {
    color: '#FFFFFF',
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    gap: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2A26',
    flex: 1,
    marginRight: 8,
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
  },
});
