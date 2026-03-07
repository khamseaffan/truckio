import { View, Text, Pressable, StyleSheet, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/shared/utils/logger';

export default function DriversListScreen() {
  const { user } = useAuthStore();

  const handleInvite = async () => {
    try {
      // In production, this would be a deep link with owner's ID
      const inviteMessage = `Join my fleet on Trukio! Download the app and use my invite code: ${user?.id?.slice(0, 8).toUpperCase() || 'TRUKIO'}`;

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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drivers</Text>
        <Pressable style={styles.addButton} onPress={handleInvite}>
          <Text style={styles.addButtonText}>+ Invite</Text>
        </Pressable>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🚛</Text>
        <Text style={styles.emptyText}>No drivers yet</Text>
        <Text style={styles.emptySub}>Invite drivers via WhatsApp link</Text>
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
