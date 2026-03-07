import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Live Tracking</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>🗺️</Text>
        <Text style={styles.placeholderLabel}>Map will appear here</Text>
        <Text style={styles.placeholderSub}>Active drivers shown in real-time</Text>
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
  placeholder: {
    flex: 1,
    backgroundColor: '#E8F0ED',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A6B5A',
  },
  placeholderSub: {
    fontSize: 13,
    color: '#8A8279',
    marginTop: 4,
  },
});
