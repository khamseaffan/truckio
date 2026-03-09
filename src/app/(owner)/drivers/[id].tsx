import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/db';
import Driver from '@/db/models/Driver';
import Job from '@/db/models/Job';
import Badge from '@/shared/components/ui/Badge';
import { useUiStore } from '@/store/uiStore';
import { enqueue } from '@/sync/queue';
import { syncManager } from '@/sync/SyncManager';
import { supabase } from '@/services/supabase/client';

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function jobStatusVariant(status: string) {
  switch (status) {
    case 'assigned': return 'warning' as const;
    case 'accepted': return 'info' as const;
    case 'picked_up': return 'info' as const;
    case 'in_transit': return 'info' as const;
    case 'delivered': return 'success' as const;
    case 'rejected': return 'error' as const;
    default: return 'neutral' as const;
  }
}

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useUiStore();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!id) return;

    const sub = database
      .get<Driver>('drivers')
      .query(Q.where('id', id))
      .observe()
      .subscribe(records => {
        setDriver(records[0] ?? null);
        setLoading(false);
      });

    return () => sub.unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!driver?.userId) return;

    database
      .get<Job>('jobs')
      .query(Q.where('driver_id', driver.userId))
      .fetch()
      .then(jobs => {
        const sorted = jobs
          .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
          .slice(0, 5);
        setRecentJobs(sorted);
      });
  }, [driver?.userId]);

  async function handleToggleActive(value: boolean) {
    if (!driver) return;
    setToggling(true);
    try {
      await driver.update(d => {
        d.isActive = value;
      });

      enqueue({
        table: 'drivers',
        recordId: driver.id,
        operation: 'upsert',
        data: {
          id: driver.id,
          user_id: driver.userId,
          name: driver.name,
          phone: driver.phone,
          is_active: value,
        },
      });

      syncManager.sync(database, supabase);
      showToast(`Driver ${value ? 'activated' : 'deactivated'}`, 'success');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to update driver');
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1A6B5A" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
        <Text style={styles.errorText}>Driver not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Badge
            label={driver.isActive ? 'Active' : 'Inactive'}
            variant={driver.isActive ? 'success' : 'neutral'}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverPhone}>{driver.phone}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Active Status</Text>
            <Switch
              value={driver.isActive}
              onValueChange={handleToggleActive}
              disabled={toggling}
              trackColor={{ true: '#1A6B5A' }}
            />
          </View>
          <Text style={styles.toggleHint}>
            {driver.isActive
              ? 'Driver can be assigned new jobs'
              : 'Driver will not appear for job assignment'}
          </Text>
        </View>

        {recentJobs.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Recent Jobs</Text>
            <View style={styles.jobList}>
              {recentJobs.map(job => (
                <View key={job.id} style={styles.jobRow}>
                  <Badge label={formatStatus(job.status)} variant={jobStatusVariant(job.status)} />
                  <Text style={styles.jobDate} numberOfLines={1}>
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN') : '—'}
                  </Text>
                </View>
              ))}
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 12,
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
  driverName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D2A26',
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 15,
    color: '#8A8279',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2A26',
  },
  toggleHint: {
    fontSize: 13,
    color: '#8A8279',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8279',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  jobList: {
    gap: 8,
  },
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobDate: {
    fontSize: 13,
    color: '#8A8279',
  },
  errorText: {
    fontSize: 16,
    color: '#8A8279',
    textAlign: 'center',
    marginTop: 60,
  },
});
