import { View, Text, StyleSheet } from 'react-native';
import { useSyncStore } from '@/store/syncStore';

export default function SyncBanner() {
  const { status, pendingCount } = useSyncStore();

  if (pendingCount === 0 && (status === 'idle' || status === 'syncing')) return null;

  const message =
    status === 'error'
      ? `Sync failed — ${pendingCount} changes pending`
      : status === 'offline'
      ? `Offline — ${pendingCount} changes will sync when connected`
      : `${pendingCount} changes not yet synced`;

  return (
    <View style={[styles.banner, status === 'error' ? styles.error : styles.offline]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
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
