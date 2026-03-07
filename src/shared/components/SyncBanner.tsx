import { View, Text, StyleSheet } from 'react-native';
import { useSyncStore } from '@/store/syncStore';

export default function SyncBanner() {
  const { status, pendingCount } = useSyncStore();

  if (status === 'idle' || status === 'syncing') return null;

  return (
    <View style={[styles.banner, status === 'error' ? styles.error : styles.offline]}>
      <Text style={styles.text}>
        {status === 'error'
          ? `Sync failed — ${pendingCount} changes pending`
          : `Offline — ${pendingCount} changes will sync when connected`}
      </Text>
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
