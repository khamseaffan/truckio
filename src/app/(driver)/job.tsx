import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActiveJobScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Active Job</Text>

      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🚚</Text>
        <Text style={styles.emptyText}>No active job</Text>
        <Text style={styles.emptySub}>
          Waiting for your operator to assign a delivery
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2A26',
    paddingTop: 16,
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
