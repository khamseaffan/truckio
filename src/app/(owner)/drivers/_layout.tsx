import { Stack } from 'expo-router';

export default function DriversLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF7F2' },
      }}
    />
  );
}
