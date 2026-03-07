import { View, Text, StyleSheet } from 'react-native';

export default function NewOrderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Order</Text>
      <Text style={styles.placeholder}>Manual order form — Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2A26',
    marginBottom: 8,
  },
  placeholder: {
    color: '#8A8279',
    fontSize: 14,
  },
});
