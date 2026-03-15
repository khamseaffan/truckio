import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Q } from '@nozbe/watermelondb';
import { randomUUID } from 'expo-crypto';
import { database } from '@/db';
import Order from '@/db/models/Order';
import Job from '@/db/models/Job';
import Driver from '@/db/models/Driver';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { enqueue } from '@/sync/queue';
import { syncManager } from '@/sync/SyncManager';
import { supabase } from '@/services/supabase/client';

const JOB_STATUS_STEPS = ['assigned', 'accepted', 'picked_up', 'in_transit', 'delivered'];

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

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

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuthStore();
  const { showToast } = useUiStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [busyDriverIds, setBusyDriverIds] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Observe the order
    const orderSub = database
      .get<Order>('orders')
      .query(Q.where('id', id))
      .observe()
      .subscribe(records => {
        setOrder(records[0] ?? null);
        setLoading(false);
      });

    return () => orderSub.unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!order || !session?.user) return;

    // Observe the job for this order
    const jobSub = database
      .get<Job>('jobs')
      .query(Q.where('order_id', order.id))
      .observe()
      .subscribe(records => setJob(records[0] ?? null));

    // Load available drivers + check which ones are busy
    Driver.getActiveDriversForOwner(database, session.user.id).then(async (drvs) => {
      setDrivers(drvs);
      // Find drivers with active (non-terminal) jobs
      const activeJobs = await database
        .get<Job>('jobs')
        .query(
          Q.where('owner_id', session.user.id),
          Q.where('status', Q.notIn(['delivered', 'rejected'])),
        )
        .fetch();
      setBusyDriverIds(new Set(activeJobs.map(j => j.driverId)));
    });

    return () => jobSub.unsubscribe();
  }, [order?.id, session?.user?.id]);

  async function handleAssign() {
    if (!selectedDriverId || !order || !session?.user) return;

    const driver = drivers.find(d => d.id === selectedDriverId);
    if (!driver) return;

    setAssigning(true);
    try {
      // Guard: prevent duplicate job if one was already created (e.g. double-tap)
      const existingJob = await order.getJob();
      if (existingJob) {
        setAssigning(false);
        return;
      }

      // Atomic: create job + update order status in a single write transaction
      const jobId = randomUUID();
      await database.write(async () => {
        const preparedJob = Job.prepareForOrder(database, {
          id: jobId,
          orderId: order.id,
          ownerId: session.user.id,
          driverId: driver.userId,
          driverName: driver.name,
        });
        const preparedOrder = order.prepareUpdate(o => {
          o.status = 'assigned';
        });
        await database.batch(preparedJob, preparedOrder);
      });

      enqueue({
        table: 'jobs',
        recordId: jobId,
        operation: 'upsert',
        data: {
          id: jobId,
          order_id: order.id,
          owner_id: session.user.id,
          driver_id: driver.userId,
          driver_name: driver.name,
          status: 'assigned',
        },
      });
      enqueue({
        table: 'orders',
        recordId: order.id,
        operation: 'upsert',
        data: {
          id: order.id,
          owner_id: order.ownerId,
          customer_name: order.customerName,
          pickup_address: order.pickupAddress,
          drop_address: order.dropAddress,
          material_type: order.materialType,
          status: 'assigned',
        },
      });

      syncManager.sync(database, supabase);
      showToast('Driver assigned', 'success');
      setSelectedDriverId(null);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1A6B5A" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
        <Text style={styles.errorText}>Order not found</Text>
      </SafeAreaView>
    );
  }

  const scheduledDateStr = order.scheduledDate
    ? new Date(order.scheduledDate).toLocaleDateString('en-IN')
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Badge
            label={formatStatus(order.status)}
            variant={statusToBadgeVariant(order.status)}
          />
        </View>

        {/* Order info */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Customer</Text>
          <Text style={styles.valueText}>{order.customerName}</Text>
          {order.customerPhone ? (
            <Text style={styles.subText}>{order.customerPhone}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Pickup</Text>
          <Text style={styles.valueText}>{order.pickupAddress}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Drop</Text>
          <Text style={styles.valueText}>{order.dropAddress}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Material</Text>
          <Text style={styles.valueText}>
            {order.materialType}
            {order.quantityValue
              ? ` · ${order.quantityValue}${order.quantityUnit ? ' ' + order.quantityUnit : ''}`
              : ''}
          </Text>
          {scheduledDateStr && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Scheduled Date</Text>
              <Text style={styles.valueText}>{scheduledDateStr}</Text>
            </>
          )}
          {order.notes ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Notes</Text>
              <Text style={styles.valueText}>{order.notes}</Text>
            </>
          ) : null}
        </View>

        {/* Job section */}
        {job ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Assigned Driver</Text>
            <Text style={styles.valueText}>{job.driverName}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Job Status</Text>
            <View style={styles.statusSteps}>
              {JOB_STATUS_STEPS.map((step, i) => {
                const currentIdx = JOB_STATUS_STEPS.indexOf(job.status);
                const done = i <= currentIdx;
                return (
                  <View key={step} style={styles.stepRow}>
                    <View style={[styles.stepDot, done && styles.stepDotDone]} />
                    {i < JOB_STATUS_STEPS.length - 1 && (
                      <View style={[styles.stepLine, done && styles.stepLineDone]} />
                    )}
                    <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                      {formatStatus(step)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : order.status === 'pending' && drivers.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Assign Driver</Text>
            <View style={styles.driverList}>
              {drivers.map(d => {
                const isBusy = busyDriverIds.has(d.userId);
                return (
                  <Pressable
                    key={d.id}
                    style={[
                      styles.driverRow,
                      selectedDriverId === d.id && styles.driverRowSelected,
                      isBusy && styles.driverRowBusy,
                    ]}
                    onPress={() =>
                      setSelectedDriverId(prev => (prev === d.id ? null : d.id))
                    }
                  >
                    <View>
                      <Text style={styles.driverName}>{d.name}</Text>
                      {isBusy && <Text style={styles.busyLabel}>On a job</Text>}
                    </View>
                    <Text style={styles.driverPhone}>{d.phone}</Text>
                  </Pressable>
                );
              })}
            </View>
            {selectedDriverId && (
              <Button
                title="Assign Driver"
                onPress={handleAssign}
                loading={assigning}
                style={styles.assignButton}
              />
            )}
          </View>
        ) : order.status === 'pending' && drivers.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Assign Driver</Text>
            <Text style={styles.subText}>
              No active drivers. Invite a driver first from the Drivers tab.
            </Text>
          </View>
        ) : null}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 16,
    color: '#1A6B5A',
    fontWeight: '600',
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
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: '#8A8279',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3EDE4',
    marginVertical: 12,
  },
  statusSteps: {
    marginTop: 8,
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8E2D9',
    marginTop: 4,
    marginRight: 10,
  },
  stepDotDone: {
    backgroundColor: '#1A6B5A',
  },
  stepLine: {
    position: 'absolute',
    left: 4.5,
    top: 14,
    width: 1,
    height: 24,
    backgroundColor: '#E8E2D9',
  },
  stepLineDone: {
    backgroundColor: '#1A6B5A',
  },
  stepLabel: {
    fontSize: 14,
    color: '#8A8279',
    paddingBottom: 20,
  },
  stepLabelDone: {
    color: '#2D2A26',
    fontWeight: '600',
  },
  driverList: {
    gap: 8,
    marginTop: 8,
  },
  driverRow: {
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverRowSelected: {
    borderColor: '#1A6B5A',
    backgroundColor: '#E8F0ED',
  },
  driverRowBusy: {
    opacity: 0.6,
  },
  busyLabel: {
    fontSize: 11,
    color: '#C0392B',
    fontWeight: '600',
    marginTop: 2,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2A26',
  },
  driverPhone: {
    fontSize: 13,
    color: '#8A8279',
  },
  assignButton: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#8A8279',
    textAlign: 'center',
    marginTop: 60,
  },
});
