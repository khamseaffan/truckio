import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/db';
import Job from '@/db/models/Job';
import Order from '@/db/models/Order';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { JOB_TRANSITIONS } from '@/shared/constants/jobStatuses';
import type { JobStatus } from '@/shared/constants/jobStatuses';
import { enqueue } from '@/sync/queue';
import { syncManager } from '@/sync/SyncManager';
import { supabase } from '@/services/supabase/client';

const ACTIVE_STATUSES = ['assigned', 'accepted', 'picked_up', 'in_transit'];

function nextStatusLabel(status: string): string {
  switch (status) {
    case 'assigned': return 'Accept Job';
    case 'accepted': return 'Mark Picked Up';
    case 'picked_up': return 'On the Way';
    case 'in_transit': return 'Mark Delivered';
    default: return '';
  }
}

function statusVariant(status: string) {
  switch (status) {
    case 'assigned': return 'warning' as const;
    case 'accepted': return 'info' as const;
    case 'picked_up': return 'info' as const;
    case 'in_transit': return 'info' as const;
    case 'delivered': return 'success' as const;
    default: return 'neutral' as const;
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function ActiveJobScreen() {
  const { session } = useAuthStore();
  const { showToast } = useUiStore();

  const [job, setJob] = useState<Job | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    // Observe active jobs for this driver
    const sub = database
      .get<Job>('jobs')
      .query(
        Q.where('driver_id', session.user.id),
        Q.where('status', Q.oneOf(ACTIVE_STATUSES)),
      )
      .observe()
      .subscribe(jobs => {
        setJob(jobs[0] ?? null);
        setLoading(false);
      });

    return () => sub.unsubscribe();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!job) {
      setOrder(null);
      return;
    }
    database
      .get<Order>('orders')
      .find(job.orderId)
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [job?.id, job?.orderId]);

  async function handleTransition() {
    if (!job) return;
    const allowed = JOB_TRANSITIONS[job.status as JobStatus];
    if (!allowed.length) return;

    const nextStatus = allowed[0];
    setTransitioning(true);
    try {
      await job.transitionTo(nextStatus);

      enqueue({
        table: 'jobs',
        recordId: job.id,
        operation: 'upsert',
        data: {
          id: job.id,
          order_id: job.orderId,
          owner_id: job.ownerId,
          driver_id: job.driverId,
          driver_name: job.driverName,
          status: nextStatus,
          pickup_time: job.pickupTime || null,
          delivery_time: job.deliveryTime || null,
        },
      });

      syncManager.sync(database, supabase);
      showToast(formatStatus(nextStatus), 'success');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to update status');
    } finally {
      setTransitioning(false);
    }
  }

  async function handleReject() {
    if (!job) return;

    Alert.alert(
      'Reject Job',
      'Are you sure you want to reject this delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setRejecting(true);
            try {
              await job.transitionTo('rejected');
              enqueue({
                table: 'jobs',
                recordId: job.id,
                operation: 'upsert',
                data: { id: job.id, order_id: job.orderId, owner_id: job.ownerId, driver_id: job.driverId, status: 'rejected' },
              });
              syncManager.sync(database, supabase);
              showToast('Job rejected', 'info');
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Failed to reject job');
            } finally {
              setRejecting(false);
            }
          },
        },
      ],
    );
  }

  async function onRefresh() {
    setRefreshing(true);
    await syncManager.sync(database, supabase);
    setRefreshing(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1A6B5A" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Active Job</Text>
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🚚</Text>
            <Text style={styles.emptyText}>No active job</Text>
            <Text style={styles.emptySub}>
              Waiting for your operator to assign a delivery
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const allowed = JOB_TRANSITIONS[job.status as JobStatus];
  const nextLabel = nextStatusLabel(job.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Active Job</Text>
          <Badge label={formatStatus(job.status)} variant={statusVariant(job.status)} />
        </View>

        {order && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Customer</Text>
              <Text style={styles.valueText}>{order.customerName}</Text>
              {order.customerPhone ? (
                <Text style={styles.subText}>{order.customerPhone}</Text>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Pickup</Text>
              <Text style={styles.addressText}>{order.pickupAddress}</Text>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Drop</Text>
              <Text style={styles.addressText}>{order.dropAddress}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Material</Text>
              <Text style={styles.valueText}>
                {order.materialType}
                {order.quantityValue
                  ? ` · ${order.quantityValue}${order.quantityUnit ? ' ' + order.quantityUnit : ''}`
                  : ''}
              </Text>
              {order.notes ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>Notes</Text>
                  <Text style={styles.subText}>{order.notes}</Text>
                </>
              ) : null}
            </View>
          </>
        )}

        {/* Action buttons */}
        {allowed.length > 0 && nextLabel ? (
          <View style={styles.actions}>
            <Button
              title={nextLabel}
              onPress={handleTransition}
              loading={transitioning}
              style={styles.primaryAction}
            />
            {job.status === 'assigned' && (
              <Button
                title="Reject"
                variant="outline"
                onPress={handleReject}
                loading={rejecting}
              />
            )}
          </View>
        ) : (
          <View style={styles.completedBanner}>
            <Text style={styles.completedText}>Delivery Complete</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2A26',
    paddingTop: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8279',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 15,
    color: '#2D2A26',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 15,
    color: '#2D2A26',
    fontWeight: '600',
    lineHeight: 22,
  },
  subText: {
    fontSize: 13,
    color: '#8A8279',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3EDE4',
    marginVertical: 12,
  },
  actions: {
    marginTop: 8,
    gap: 10,
  },
  primaryAction: {},
  completedBanner: {
    backgroundColor: '#E8F0ED',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A6B5A',
  },
  emptyScroll: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2A26',
  },
  emptySub: {
    fontSize: 14,
    color: '#8A8279',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 240,
  },
});
