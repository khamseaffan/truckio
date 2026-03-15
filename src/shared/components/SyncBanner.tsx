import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSyncStore } from '@/store/syncStore';
import { syncManager } from '@/sync/SyncManager';
import { database } from '@/db';
import { supabase } from '@/services/supabase/client';

export default function SyncBanner() {
  const { status, pendingCount } = useSyncStore();

  if (pendingCount === 0 && (status === 'idle' || status === 'syncing')) return null;

  const message =
    status === 'error'
      ? `Sync failed — ${pendingCount} changes pending. Tap to retry.`
      : status === 'offline'
      ? `Offline — ${pendingCount} changes will sync when connected`
      : `${pendingCount} changes not yet synced. Tap to sync.`;

  const canRetry = status !== 'syncing' && status !== 'offline' && pendingCount > 0;

  const inner = (
    <View style={[styles.banner, status === 'error' ? styles.error : styles.offline]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );

  if (canRetry) {
    return (
      <Pressable
        onPress={() => syncManager.sync(database, supabase)}
        style={({ pressed }) => pressed ? { opacity: 0.75 } : undefined}
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  error: {
    backgroundColor: '#FDF0EC',
  },
  offline: {
    backgroundColor: '#FDF5E9',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D2A26',
  },
});
