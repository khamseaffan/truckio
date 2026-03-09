import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { database } from '@/db';
import Driver from '@/db/models/Driver';
import Badge from '@/shared/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/shared/utils/logger';
import { syncManager } from '@/sync/SyncManager';
import { supabase } from '@/services/supabase/client';

export default function DriversListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Driver.getActiveDriversForOwner(database, user.id).then(setDrivers);
  }, [user?.id]);

  async function handleInvite() {
    try {
      const inviteCode = user?.id?.slice(0, 8).toUpperCase() ?? 'TRUKIO';
      const inviteMessage = `Join my fleet on Trukio!\n\nDownload the app and use my invite code: ${inviteCode}\n\nApp: https://trukio.app`;

      const result = await Share.share({
        message: inviteMessage,
        title: 'Invite Driver to Trukio',
      });

      if (result.action === Share.sharedAction) {
        logger.info('Driver invite shared');
      }
    } catch (err: any) {
      logger.error('Share failed:', err);
      Alert.alert('Error', 'Could not open share sheet');
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await syncManager.sync(database, supabase);
    if (user?.id) {
      const updated = await Driver.getActiveDriversForOwner(database, user.id);
      setDrivers(updated);
    }
    setRefreshing(false);
  }

  function renderDriver({ item }: { item: Driver }) {
    return (
      <Pressable
        style={styles.driverCard}
        onPress={() => router.push(`/(owner)/drivers/${item.id}`)}
      >
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.name}</Text>
          <Text style={styles.driverPhone}>{item.phone}</Text>
        </View>
        <Badge
          label={item.isActive ? 'Active' : 'Inactive'}
          variant={item.isActive ? 'success' : 'neutral'}
        />
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drivers</Text>
        <Pressable style={styles.addButton} onPress={handleInvite}>
          <Text style={styles.addButtonText}>+ Invite</Text>
        </Pressable>
      </View>

      <FlatList
        data={drivers}
        keyExtractor={item => item.id}
        renderItem={renderDriver}
        contentContainerStyle={
          drivers.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🚛</Text>
            <Text style={styles.emptyText}>No drivers yet</Text>
            <Text style={styles.emptySub}>
              Tap + Invite to share your invite link via WhatsApp
            </Text>
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverInfo: {
    flex: 1,
    marginRight: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2A26',
    marginBottom: 2,
  },
  driverPhone: {
    fontSize: 13,
    color: '#8A8279',
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
    maxWidth: 260,
  },
});
