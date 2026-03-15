import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Q } from '@nozbe/watermelondb';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/db';
import type Order from '@/db/models/Order';
import type Job from '@/db/models/Job';
import type Driver from '@/db/models/Driver';

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [todayJobs, setTodayJobs] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Orders scheduled for today (not created today)
    const jobsSub = database
      .get<Order>('orders')
      .query(
        Q.where('owner_id', uid),
        Q.where('scheduled_date', Q.gte(startOfDay.getTime())),
        Q.where('scheduled_date', Q.lte(endOfDay.getTime())),
      )
      .observeCount()
      .subscribe(setTodayJobs);

    const driversSub = database
      .get<Driver>('drivers')
      .query(Q.where('owner_id', uid), Q.where('is_active', true))
      .observeCount()
      .subscribe(setActiveDrivers);

    const ordersSub = database
      .get<Order>('orders')
      .query(Q.where('owner_id', uid))
      .observeCount()
      .subscribe(setTotalOrders);

    return () => {
      jobsSub.unsubscribe();
      driversSub.unsubscribe();
      ordersSub.unsubscribe();
    };
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Pressable
          onPress={() => router.push('/(owner)/profile')}
          style={styles.profileButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="person-circle-outline" size={32} color="#1A6B5A" />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayJobs}</Text>
          <Text style={styles.statLabel}>Today's Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeDrivers}</Text>
          <Text style={styles.statLabel}>Active Drivers</Text>
        </View>
      </View>

      <View style={styles.statCardFull}>
        <Text style={styles.statNumber}>{totalOrders}</Text>
        <Text style={styles.statLabel}>Total Orders</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.newOrderBtn, pressed && { opacity: 0.8 }]}
        onPress={() => router.push('/(owner)/orders/new')}
      >
        <Text style={styles.newOrderBtnText}>+ New Order</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Recent Orders</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>
          {totalOrders === 0 ? 'No orders yet. Create your first order!' : 'Go to Orders tab to view all orders.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 24,
  },
  profileButton: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2A26',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D2A26',
  },
  statLabel: {
    fontSize: 13,
    color: '#8A8279',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2A26',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#B5AFA6',
  },
  statCardFull: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    padding: 20,
    marginBottom: 12,
  },
  newOrderBtn: {
    backgroundColor: '#1A6B5A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  newOrderBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
