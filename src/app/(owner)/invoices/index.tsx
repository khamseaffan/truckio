import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InvoicesListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Invoices</Text>

      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🧾</Text>
        <Text style={styles.emptyText}>No invoices yet</Text>
        <Text style={styles.emptySub}>Invoices auto-generate when jobs are delivered</Text>
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
